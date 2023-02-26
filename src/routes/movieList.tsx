import "./movieList.css";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAxios } from "src/hooks/exports";
import { useSearchParams, Link } from "react-router-dom";
import {
  Paper,
  Stack,
  Collapse,
  FormControl,
  FormControlLabel,
  Select,
  SelectChangeEvent,
  Button,
  ToggleButton,
  MenuItem,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Skeleton,
  Pagination,
  Avatar,
  CircularProgress,
  TextField,
  Divider,
  Tooltip,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { green, amber, red, grey } from "@mui/material/colors";
import RouteContainer from "src/routeContainer";
import { dateConverter } from "src/utils/exports";

interface IMovie {
  poster_path?: string | null;
  adult?: boolean;
  overview?: string;
  release_date?: string;
  genreId_ids?: number[];
  id?: number;
  original_title?: string;
  original_language?: string;
  title?: string;
  backdrop_path?: string | null;
  popularity?: number;
  vote_count?: number;
  video?: boolean;
  vote_average?: number;
}

interface ICert {
  certification: string;
  meaning: string;
  order: number;
  selected?: boolean;
}

const sortOptions = [
  {
    title: "Popularity (desc)",
    query: "popularity.desc",
  },
  {
    title: "Popularity (asc)",
    query: "popularity.asc",
  },
  {
    title: "Vote Average (desc)",
    query: "vote_average.desc",
  },
  {
    title: "Vote Average (asc)",
    query: "vote_average.asc",
  },
  {
    title: "Release Date (desc)",
    query: "release_date.desc",
  },
  {
    title: "Release Date (asc)",
    query: "release_date.asc",
  },
  {
    title: "Title (desc)",
    query: "original_title.desc",
  },
  {
    title: "Title (asc)",
    query: "original_title.asc",
  },
];

interface IReleaseDate {
  on?: string;
  from?: string;
  to?: string;
}

interface IRating {
  min?: string;
  max?: string;
}

interface IFilterObject {
  "vote_average.gte"?: string;
  "vote_average.lte"?: string;
  primary_release_year?: string;
  "primary_release_date.gte"?: string;
  "primary_release_date.lte"?: string;
  certification_country?: string;
  certification?: string;
}

function App() {
  const queryClient = useQueryClient();
  const api = useAxios();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageNum, setPageNum] = useState(1);
  const [sort, setSort] = useState("popularity.desc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [certChoices, setCertChoices] = useState<string[] | null>(null);
  const [releaseDate, setReleaseDate] = useState<IReleaseDate | null>(null);
  const [rating, setRating] = useState<IRating | null>(null);

  useEffect(() => {
    // window.scrollTo(0, 0); // This works on all browsers (I think) but it isn't smooth
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" }); // Doesn't work on safari as of July 2021
  }, [pageNum]);

  useEffect(() => {
    setPageNum(1);
  }, [sort]);

  const {
    data: movieData,
    refetch: refetchMovieData,
    isFetching: movieDataIsFetching,
  }: any = useQuery({
    // "enabled" prevents api query from begin made before a list of genres has been retrieved
    enabled: !!queryClient.getQueryData(["movie", "genres"]),
    queryKey: ["movie", ...searchParams.entries()],
    queryFn: getMovieList,
  });

  const {
    data: certificationData,
    isLoading: certDataIsLoading,
    isFetching: certDataIsFetching,
  }: any = useQuery({
    queryKey: ["certifications"],
    queryFn: getCertificationList,
    cacheTime: Infinity,
    staleTime: Infinity,
    onSuccess: (data) => {
      let gb_certifications = data?.certifications["GB"];
      gb_certifications?.sort(
        (obj1: ICert, obj2: ICert) => obj1.order - obj2.order
      );
      gb_certifications = gb_certifications?.map((item: ICert) => {
        item.selected = false;
        return item;
      });
      console.log("GB Certifications :", gb_certifications);
      queryClient.setQueryData(["certifications"], gb_certifications);
    },
  });

  async function getCertificationList() {
    try {
      const result = await api.get("/certification/movie/list");
      return result?.data;
    } catch (e: any) {
      throw e.response.data.error;
    }
  }

  async function getMovieList() {
    console.log("Search Params:", searchParams.get("query"));
    try {
      let full_query = "discover/movie";
      let first = true;
      for (const [key, val] of searchParams.entries()) {
        // If it is using the "query" parameter then there is no need to add any
        // other parameters since they will not work with tmdb
        if (key === "query") {
          full_query = `search/movie?${key}=${val}`;
          break;
        }
        full_query += `${first ? "?" : "&"}${key}=${val}`;
        if (first) {
          first = false;
        }
      }

      console.log("Full Query :", full_query);
      const result = await api.get(full_query);
      return result?.data;
    } catch (e: any) {
      throw e.response.data.error;
    }
  }

  function handlePageNum(e: React.ChangeEvent<unknown>, value: number) {
    setPageNum(value);
    setSearchParams((prev) => ({
      ...Object.fromEntries(prev.entries()),
      page: value.toString(),
    }));
  }

  function handleSort(e: SelectChangeEvent) {
    const value = e.target.value;
    if (typeof value === "string") {
      setSort(value);
      setSearchParams((prev) => ({
        ...Object.fromEntries(prev.entries()),
        sort_by: value.toString(),
      }));
    }
  }

  function handleFilterOpen() {
    setFilterOpen((prev) => !prev);
  }

  /**
   * Used to calculate the color to use for the circular progress bar surrounding the movie rating
   */
  function calculateColor(movie: IMovie) {
    if (movie?.vote_average) {
      if (movie.vote_average > 8) {
        return green[400];
      } else if (movie.vote_average > 4) {
        return amber[400];
      } else {
        return red[400];
      }
    } else {
      return "grey";
    }
  }

  function handleCertificationChoices(e: any, newAlignment: string | null) {
    queryClient.setQueryData(["certifications"], (data: any) => {
      if (!data) return data;

      // ===== Modify data to invert selected option =====
      let dataClone = JSON.parse(JSON.stringify(data));
      dataClone = dataClone?.map((item: ICert) => {
        if (item.certification === newAlignment) {
          item.selected = !item.selected;
        }
        return item;
      });
      console.log("Data Clone :", dataClone);

      // ===== Get the selected certifications and pass them to certChoices =====
      let selected = dataClone.reduce((prev: string[], obj: ICert) => {
        if (obj.selected) {
          prev.push(obj.certification);
        }
        return prev;
      }, []);
      console.log("Selected :", selected);
      if (selected.length < 1) {
        setCertChoices(null);
      } else {
        setCertChoices(selected);
      }

      return dataClone;
    });
  }

  /** Executed when clicking the search button for filters */
  function searchWithFilters() {
    const filter_object: IFilterObject = {};

    setSearchParams((prev) => {
      let new_obj = Object.fromEntries(prev.entries());

      // Rating
      if (rating !== null) {
        if (
          rating.hasOwnProperty("min") &&
          typeof rating["min"] === "string" &&
          rating["min"].length > 0 &&
          parseFloat(rating["min"]) > 0
        ) {
          filter_object["vote_average.gte"] = rating["min"];
        } else {
          if (new_obj.hasOwnProperty("vote_average.gte")) {
            delete new_obj["vote_average.gte"];
          }
        }

        if (
          rating.hasOwnProperty("max") &&
          typeof rating["max"] === "string" &&
          rating["max"].length > 0 &&
          parseFloat(rating["max"]) > 0
        ) {
          filter_object["vote_average.lte"] = rating["max"];
        } else {
          if (new_obj.hasOwnProperty("vote_average.lte")) {
            delete new_obj["vote_average.lte"];
          }
        }
      }

      // Release Date
      if (releaseDate !== null) {
        if (releaseDate.hasOwnProperty("on")) {
          if (typeof releaseDate["on"] === "string") {
            if (releaseDate["on"].length > 0) {
              filter_object["primary_release_year"] = releaseDate["on"];
            }
          }
        }
        if (releaseDate.hasOwnProperty("from")) {
          if (typeof releaseDate["from"] === "string") {
            if (releaseDate["from"].length > 0) {
              filter_object["primary_release_date.gte"] = releaseDate["from"];
            }
          }
        }
        if (releaseDate.hasOwnProperty("to")) {
          if (typeof releaseDate["to"] === "string") {
            if (releaseDate["to"].length > 0) {
              filter_object["primary_release_date.lte"] = releaseDate["to"];
            }
          }
        }
      }

      // Certification Choices
      if (certChoices !== null) {
        filter_object["certification_country"] = "GB";
        filter_object["certification"] = `${certChoices.join("|")}`;
      }

      return {
        ...new_obj,
        ...filter_object,
      };
    });
  }

  function handleReleaseDate(
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    const val = e.target.value; // captures 2012
    const prop = e.target.name.split("-")[2]; // captures 'on' in 'release-date-on'
    setReleaseDate((prev) => ({ ...prev, [prop]: val }));
  }

  function handleRating(
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    const val = e.target.value; // captures 2012
    const prop = e.target.name.split("-")[1]; // captures 'on' in 'release-date-on'
    setRating((prev) => ({ ...prev, [prop]: val }));
  }

  function handleIsQuery() {
    return searchParams.get("query") !== null;
  }

  return (
    <RouteContainer
      sx={{ flexDirection: "column", alignItems: "center", px: 5 }}
    >
      {/* Filter Options */}
      <Collapse
        in={!handleIsQuery() && filterOpen}
        timeout={1000}
        sx={{
          zIndex: 1,
          backgroundColor: "rgba(33, 33, 33, 0.8)",
          mb: 2,
          borderRadius: 2,
          width: "90%",
        }}
      >
        <Stack
          spacing={2}
          sx={{
            height: 460,
            px: 4,
            py: 2,
          }}
        >
          {/* Age Certification */}
          <Typography sx={{ letterSpacing: 1, textAlign: "center" }}>
            Age Certification
          </Typography>
          {!certDataIsFetching &&
            certificationData &&
            Array.isArray(certificationData) && (
              <Stack spacing={2} direction="row" justifyContent="center">
                {certificationData.map(
                  ({ certification, selected }: ICert, index: number) => (
                    <ToggleButton
                      key={index}
                      value={certification}
                      selected={selected}
                      onChange={handleCertificationChoices}
                      sx={{
                        width: 50,
                      }}
                    >
                      {certification}
                    </ToggleButton>
                  )
                )}
              </Stack>
            )}

          <Divider sx={{ m: 2 }} />

          {/* Release Date */}
          <Typography sx={{ letterSpacing: 1, textAlign: "center" }}>
            Release Date
          </Typography>
          <Stack spacing={2} direction="row" justifyContent="center">
            <FormControlLabel
              // value="start"
              label="on"
              labelPlacement="start"
              control={
                <TextField
                  type="number"
                  placeholder="????"
                  sx={{ width: 90, mx: 1 }}
                  size="small"
                  inputProps={{ min: 1874, max: 2023 }}
                  onChange={handleReleaseDate}
                  name="release-date-on"
                />
              }
            />
            <Divider orientation="vertical" sx={{ height: 80 }}>
              OR
            </Divider>

            <FormControlLabel
              // value="start"
              label="from"
              labelPlacement="start"
              control={
                <TextField
                  type="number"
                  placeholder="????"
                  sx={{ width: 90, ml: 1 }}
                  size="small"
                  inputProps={{ min: 1874, max: 2023 }}
                  onChange={handleReleaseDate}
                  name="release-date-from"
                />
              }
            />
            <FormControlLabel
              // value="start"
              label="to"
              labelPlacement="start"
              control={
                <TextField
                  type="number"
                  placeholder="????"
                  sx={{ width: 90, ml: 1 }}
                  size="small"
                  inputProps={{ min: 1874, max: 2023 }}
                  onChange={handleReleaseDate}
                  name="release-date-to"
                />
              }
            />
          </Stack>

          <Divider sx={{ m: 2 }} />

          {/* Rating */}
          <Typography sx={{ letterSpacing: 1, textAlign: "center" }}>
            Rating
          </Typography>
          <Stack spacing={5} direction="row" justifyContent="center">
            <FormControlLabel
              // value="start"
              label="min"
              labelPlacement="start"
              control={
                <TextField
                  type="number"
                  placeholder="0.0"
                  sx={{ width: 90, ml: 1 }}
                  size="small"
                  inputProps={{ min: 0, max: 10, step: 0.1 }}
                  onChange={handleRating}
                  name="rating-min"
                />
              }
            />
            <FormControlLabel
              // value="start"
              label="max"
              labelPlacement="start"
              control={
                <TextField
                  type="number"
                  placeholder="0.0"
                  sx={{ width: 90, ml: 1 }}
                  size="small"
                  inputProps={{ min: 0, max: 10, step: 0.1 }}
                  onChange={handleRating}
                  name="rating-max"
                />
              }
            />
          </Stack>

          {/* Search Button */}
          <Button
            fullWidth
            variant="outlined"
            onClick={searchWithFilters}
            sx={{
              mt: "30px !important",
              width: "90%",
              maxWidth: 500,
              alignSelf: "center",
            }}
          >
            Search
          </Button>
        </Stack>
      </Collapse>

      {/* Pagination, Sort & Filter */}
      <Stack
        direction="row"
        spacing={8}
        sx={{
          height: 40,
          mb: 5,
        }}
      >
        {/* Pagination */}
        <Pagination
          count={movieData?.total_pages || (movieDataIsFetching ? 10 : 1)}
          page={pageNum}
          variant="outlined"
          shape="rounded"
          onChange={handlePageNum}
          size="large"
          siblingCount={0}
        />

        {/* Sort & Filter */}
        <Stack direction="row" spacing={2} sx={{ height: 40 }}>
          {/* Sort */}
          <FormControl
            sx={{
              minWidth: 150,
            }}
            size="small"
          >
            <Tooltip
              title={
                handleIsQuery()
                  ? "Movies cannot be sorted when using the search bar"
                  : ""
              }
            >
              <span>
                <Select
                  variant="outlined"
                  value={sort}
                  displayEmpty
                  onChange={handleSort}
                  disabled={handleIsQuery()}
                  sx={handleIsQuery() ? { pointerEvents: "none" } : {}}
                >
                  {sortOptions?.map(({ title, query }, index) => (
                    <MenuItem key={index} value={query}>
                      {title}
                    </MenuItem>
                  ))}
                </Select>
              </span>
            </Tooltip>
          </FormControl>

          {/* Filter */}
          <Tooltip title="Movies cannot be filtered when using the search bar">
            <span>
              <Button
                variant="outlined"
                onClick={handleFilterOpen}
                disabled={handleIsQuery()}
              >
                Filter
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Movie List */}
      <Grid container spacing={2} rowSpacing={6} disableEqualOverflow>
        {movieDataIsFetching
          ? [...new Uint8Array(20)].map((num, index) => (
              <Grid
                key={index}
                xs={12}
                xs475={6}
                sm={6}
                sm650={4}
                sm750={4}
                md={3}
                md1050={2.4}
                xl={2}
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Paper elevation={12}>
                  <Card
                    sx={{
                      width: 185,
                    }}
                  >
                    <Skeleton
                      sx={{ height: 277 }}
                      animation="wave"
                      variant="rectangular"
                    />
                    <CardContent sx={{ height: 160 }} className="glassmorphism">
                      <Skeleton animation="wave" height={20} width="30%" />
                      <Skeleton animation="wave" height={30} width="90%" />
                      <Skeleton animation="wave" height={15} width="70%" />
                    </CardContent>
                  </Card>
                </Paper>
              </Grid>
            ))
          : movieData?.results?.map((movie: IMovie, index: number) => (
              <Grid
                key={index}
                xs={12}
                xs475={6}
                sm={6}
                sm650={4}
                sm750={4}
                md={3}
                md1050={2.4}
                xl={2}
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Link
                  to={`/movies/${movie.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <Paper
                    elevation={12}
                    sx={{
                      borderRadius: 3,
                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                      zIndex: 1,
                    }}
                  >
                    <Card
                      sx={{
                        width: 185,
                        borderRadius: "inherit",
                        backgroundColor: "rgba(0, 0, 0, 0)",
                      }}
                    >
                      <CardMedia
                        component="img"
                        src={`https://image.tmdb.org/t/p/w185/${movie.poster_path}`}
                        alt={movie.title}
                        height={277}
                      />
                      <CardContent
                        sx={{
                          height: 130,
                          color: grey[100],
                        }}
                        className="glassmorphism"
                      >
                        <Avatar
                          sx={{
                            bgcolor: "black",
                            mt: -5,
                            color: "white",
                            fontSize: 16,
                            fontWeight: 700,
                          }}
                        >
                          {movie.vote_average?.toFixed(1)}
                        </Avatar>
                        <CircularProgress
                          variant="determinate"
                          size={38}
                          sx={{
                            ml: "1px",
                            mt: "-39px",
                            position: "absolute",
                            color: () => calculateColor(movie),
                          }}
                          value={
                            (movie?.vote_average && movie.vote_average * 10) ||
                            0
                          }
                        />
                        <Typography
                          variant={"body1"}
                          sx={{ mt: 1, color: "inherit", fontWeight: 700 }}
                          gutterBottom
                        >
                          {movie.title}
                        </Typography>
                        <Typography
                          variant={"subtitle2"}
                          sx={{ color: grey[300] }}
                        >
                          {movie.release_date &&
                            dateConverter(movie.release_date, true)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Paper>
                </Link>
              </Grid>
            ))}
      </Grid>

      {/* Pagination */}
      <Pagination
        sx={{ mt: 5 }}
        count={movieData?.total_pages || (movieDataIsFetching ? 10 : 1)}
        page={pageNum}
        variant="outlined"
        shape="rounded"
        onChange={handlePageNum}
      />
    </RouteContainer>
  );
}

export default App;
