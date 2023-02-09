import "./movieList.css";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAxios } from "src/hooks/exports";
import { useParams } from "react-router-dom";
import {
  Paper,
  Stack,
  Box,
  Collapse,
  FormControl,
  Select,
  SelectChangeEvent,
  Button,
  ToggleButton,
  MenuItem,
  Card,
  CardMedia,
  CardContent,
  CardHeader,
  Typography,
  Skeleton,
  Pagination,
  Avatar,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { green, amber, red, grey } from "@mui/material/colors";
import RouteContainer from "src/routeContainer";
import { dateConverter } from "src/utils/exports";

interface IGenres {
  id: number;
  name: string;
}

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

function App() {
  const queryClient = useQueryClient();
  const api = useAxios();
  const { genre } = useParams();
  const [pageNum, setPageNum] = useState(1);
  const [sort, setSort] = useState("popularity.desc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [certChoices, setCertChoices] = useState<string[] | null>(null);
  const [allFilters, setAllFilters] = useState<string[] | null>(null);

  useEffect(() => {
    setPageNum(1); // This resets the page number whenever the user changes genre
    refetchMovieData();
  }, [genre]);

  useEffect(() => {
    // window.scrollTo(0, 0);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" }); // Does'nt work on safari as of July 2021
  }, [pageNum]);

  useEffect(() => {
    setPageNum(1);
  }, [sort]);

  useEffect(() => {
    setPageNum(1);
  }, [certChoices]);

  /**
   * Retrieves array of genres from queryClient with hash ["movie", "genres"].
   * Filter out the genre ID from the genres array using the 'genre' parameter.
   */
  function getGenreId(): number | undefined {
    if (!genre) return undefined;
    const genres: { genres: IGenres[] } | undefined = queryClient.getQueryData([
      "movie",
      "genres",
    ]);
    const genreId = genres?.genres.filter(
      (movie: IGenres) => movie.name.toLowerCase() === genre
    )[0].id;
    return genreId;
  }

  const {
    data: movieData,
    refetch: refetchMovieData,
    isFetching: movieDataIsFetching,
  }: any = useQuery({
    enabled: !!queryClient.getQueryData(["movie", "genres"]), // TODO: Explain Why
    queryKey: ["movie", genre || "discover", pageNum, sort, allFilters],
    queryFn: getMovieList,
  });

  const { data: certificationData }: any = useQuery({
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
    const genreId = getGenreId();
    try {
      if (!genreId) {
        const result = await api.get(`/discover/movie?page=${pageNum}`);
        return result?.data;
      } else {
        let query = `/discover/movie?with_genres=${genreId}&page=${pageNum}&sort_by=${sort}`;
        if (certChoices !== null) {
          query +=
            `&certification_country=GB` +
            `&certification=${certChoices.join("|")}`;
        }
        console.log("Query :", query);
        const result = await api.get(query);
        return result?.data;
      }
    } catch (e: any) {
      throw e.response.data.error;
    }
  }

  function handlePageNum(e: React.ChangeEvent<unknown>, value: number) {
    setPageNum(value);
  }

  function handleSort(e: SelectChangeEvent) {
    const val = e.target.value;
    if (typeof val === "string") {
      setSort(val);
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

  function handleCertificationOptions(e: any, newAlignment: string | null) {
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

  function searchWithFilters() {
    setAllFilters(certChoices);
  }

  return (
    <RouteContainer
      sx={{ flexDirection: "column", alignItems: "center", px: 5 }}
    >
      {/* Filter Options */}
      <Collapse in={filterOpen}>
        <Box
          sx={{
            height: 150,
          }}
        >
          <Stack spacing={2} direction="row">
            {certificationData?.map(
              ({ certification, selected }: ICert, index: number) => (
                <ToggleButton
                  key={index}
                  value={certification}
                  selected={selected}
                  onChange={handleCertificationOptions}
                  sx={{
                    width: 50,
                  }}
                >
                  {certification}
                </ToggleButton>
              )
            )}
          </Stack>
          <Button
            sx={{ mt: 2, width: "100%" }}
            variant="outlined"
            onClick={searchWithFilters}
          >
            Search
          </Button>
        </Box>
      </Collapse>

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
            <Select
              variant="outlined"
              value={sort}
              displayEmpty
              onChange={handleSort}
            >
              {sortOptions?.map(({ title, query }, index) => (
                <MenuItem key={index} value={query}>
                  {title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Filter */}
          <Button variant="outlined" onClick={handleFilterOpen}>
            Filter
          </Button>
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
                        {movie.vote_average}
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
                          (movie?.vote_average && movie.vote_average * 10) || 0
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
