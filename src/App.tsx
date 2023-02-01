import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAxios } from "src/hooks/exports";
import {
  Paper,
  Card,
  CardMedia,
  CardContent,
  CardHeader,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import RouteContainer from "./routeContainer";
import Navigator from "./navigator";

interface IMovie {
  poster_path?: string | null;
  adult?: boolean;
  overview?: string;
  release_date?: string;
  genre_ids?: number[];
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
  const api = useAxios();

  const { data: movieData }: any = useQuery({
    queryKey: ["movie_list"],
    queryFn: getMovieList,
  });

  async function getMovieList() {
    try {
      const result = await api.get("/discover/movie");
      return result?.data;
    } catch (e: any) {
      throw e.response.data.error;
    }
  }

  return (
    <>
      <Navigator />
      <RouteContainer>
        <Grid container spacing={2} rowSpacing={6} disableEqualOverflow>
          {movieData?.results?.map((movie: IMovie, index: number) => (
            <Grid
              key={index}
              xs={4}
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
                  {/* <CardContent>
                  <Typography>{movie.title}</Typography>
                  <Typography>{movie.release_date}</Typography>
                  <Typography>{movie.vote_average}</Typography>
                </CardContent> */}
                </Card>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </RouteContainer>
    </>
  );
}

export default App;
