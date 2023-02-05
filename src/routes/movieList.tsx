import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAxios } from "src/hooks/exports";
import { useParams } from "react-router-dom";
import {
  Paper,
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

function App() {
  const queryClient = useQueryClient();
  const api = useAxios();
  const { genre } = useParams();
  const [pageNum, setPageNum] = useState(1);

  useEffect(() => {
    setPageNum(1); // This resets the page number whenever the user changes genre
    refetchMovideData();
  }, [genre]);

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
    refetch: refetchMovideData,
    isFetching: movideDataIsFetching,
  }: any = useQuery({
    enabled: !!queryClient.getQueryData(["movie", "genres"]), // TODO: Explain Why
    queryKey: ["movie", genre || "discover", pageNum],
    queryFn: getMovieList,
  });

  async function getMovieList() {
    const genreId = getGenreId();
    try {
      if (!genreId) {
        const result = await api.get(`/discover/movie?page=${pageNum}`);
        return result?.data;
      } else {
        const result = await api.get(
          `/discover/movie?with_genres=${genreId}&page=${pageNum}`
        );
        return result?.data;
      }
    } catch (e: any) {
      throw e.response.data.error;
    }
  }

  function handlePageNum(e: React.ChangeEvent<unknown>, value: number) {
    setPageNum(value);
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

  return (
    <RouteContainer
      sx={{ flexDirection: "column", alignItems: "center", px: 5 }}
    >
      {/* Pagination */}
      <Pagination
        sx={{ mb: 5 }}
        count={movieData?.total_pages || (movideDataIsFetching ? 10 : 1)}
        page={pageNum}
        variant="outlined"
        shape="rounded"
        onChange={handlePageNum}
      />

      {/* Movie List */}
      <Grid container spacing={2} rowSpacing={6} disableEqualOverflow>
        {movideDataIsFetching
          ? [1, 2, 3, 4, 5, 6, 7, 8].map((num, index) => (
              <Grid
                key={index}
                xs={6}
                sm={4}
                md={3}
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
                    <CardContent sx={{ height: 160 }}>
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
                <Paper elevation={12}>
                  <Card
                    sx={{
                      width: 185,
                    }}
                  >
                    <CardMedia
                      component="img"
                      src={`https://image.tmdb.org/t/p/w185/${movie.poster_path}`}
                      alt={movie.title}
                      height={277}
                    />
                    <CardContent sx={{ height: 130 }}>
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
                      <Typography variant={"body1"} sx={{ mt: 1 }} gutterBottom>
                        {movie.title}
                      </Typography>
                      <Typography
                        variant={"subtitle2"}
                        sx={{ color: grey[500] }}
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
        count={movieData?.total_pages || (movideDataIsFetching ? 10 : 1)}
        page={pageNum}
        variant="outlined"
        shape="rounded"
        onChange={handlePageNum}
      />
    </RouteContainer>
  );
}

export default App;
