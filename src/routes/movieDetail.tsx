import "./movieDetail.css";
import { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Avatar,
  CircularProgress,
  Divider,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useAxios } from "src/hooks/exports";
import {
  dateConverter,
  calculateColor,
  timeConverter,
} from "src/utils/exports";
import RouteContainer from "src/routeContainer";

interface ICrew {
  adult?: boolean;
  gender?: number | null;
  id?: number;
  known_for_department?: string;
  name?: string;
  original_name?: string;
  popularity?: number;
  profile_path?: string | null;
  credit_id?: string;
  department?: string;
  job: string;
}

interface ICast {
  adult?: boolean;
  gender?: number | null;
  id?: number;
  known_for_department?: string;
  name?: string;
  original_name?: string;
  popularity?: number;
  profile_path?: string | null;
  cast_id?: number;
  character?: string;
  credit_id?: string;
  order: number;
}

interface ICredits {
  cast: ICast[];
  crew: ICrew[];
  id: number;
}

export default function MovieDetail() {
  const api = useAxios();
  const { id: movieId } = useParams();

  const { data: movieData, isFetching: movieDataIsFetching }: any = useQuery({
    queryKey: ["movie", movieId],
    queryFn: getMovieDetail,
  });

  async function getMovieDetail() {
    try {
      const query = `movie/${movieId}`;
      const result = await api.get(query);
      return result?.data;
    } catch (e: any) {
      throw e.response.data.error;
    }
  }

  const {
    data: movieDataCredits,
    isFetching: movieDataCreditsIsFetching,
  }: any = useQuery({
    queryKey: ["movie", movieId, "credits"],
    queryFn: getMovieDetailCredits,
  });

  async function getMovieDetailCredits(): Promise<ICredits | Error> {
    try {
      const query = `movie/${movieId}/credits`;
      const result = await api.get(query);
      return result?.data;
    } catch (e: any) {
      throw e.response.data.error;
    }
  }

  function getMainCrew(crew: ICrew[]): ICrew[] {
    const main_crew = ["director", "producer", "writer"];
    const filtered = crew.filter((worker) =>
      main_crew.includes(worker["job"].toLowerCase())
    );
    return filtered;
  }

  return (
    <RouteContainer noLogo={true} sx={{ py: 0 }}>
      {movieDataIsFetching ? (
        <Typography>Fetching...</Typography>
      ) : (
        <Box
          sx={{
            width: "100%",
            height: 550,
            display: "flex",
            position: "relative",
          }}
        >
          <img
            id="backdrop-image"
            src={`https://image.tmdb.org/t/p/w1280/${movieData.backdrop_path}`}
            alt={`Backdrop image for ${movieData.title}`}
          />
          <img
            id="poster-image"
            src={`https://image.tmdb.org/t/p/w500/${movieData.poster_path}`}
            alt={`Poster image for ${movieData.title}`}
          />
          <Stack
            spacing={1}
            sx={{
              position: "inherit",
              width: "100%",
              height: "100%",
              color: grey[100],
              p: 3,
              pr: 15,
              // borderLeft: "2px solid white", // TODO: Remove when done
            }}
          >
            {/* Title */}
            <Typography variant={"h4"} sx={{ color: "inherit" }}>
              {movieData.title}
            </Typography>

            {/* Release Date, Genres, Runtime */}
            <Typography variant={"subtitle2"} sx={{ color: grey[300] }}>
              {movieData.release_date &&
                dateConverter(movieData.release_date, true)}
              {"  "}
              &bull;
              {movieData?.genres &&
                movieData.genres.map(
                  ({ name }: { name: string }, index: number) => (
                    <Typography key={index} component={"span"}>
                      {" "}
                      {name}
                      {index < movieData.genres.length - 1 && ","}
                    </Typography>
                  )
                )}{" "}
              &bull;{" "}
              <Typography component={"span"}>
                {movieData?.runtime && timeConverter(movieData.runtime)}
              </Typography>
            </Typography>

            {/* User Score */}
            <Box
              sx={{
                position: "relative",
                width: 80,
                height: 80,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "black",
                  color: "white",
                  fontSize: 24,
                  fontWeight: 700,
                  width: "100%",
                  height: "100%",
                }}
              >
                {movieData.vote_average?.toFixed(1)}
              </Avatar>
              <CircularProgress
                variant="determinate"
                size={"100%"}
                sx={{
                  // ml: "2px",
                  mt: "-80px",
                  position: "absolute",
                  color: () => calculateColor(movieData),
                }}
                value={
                  (movieData?.vote_average && movieData.vote_average * 10) || 0
                }
              />
            </Box>

            {/* Tagline */}
            <Typography
              component={"em"}
              variant={"subtitle1"}
              sx={{ color: grey[400], fontSize: 18 }}
            >
              {movieData?.tagline && movieData.tagline}
            </Typography>

            {/* Overview Label */}
            <Typography variant={"h5"}>Overview</Typography>

            {/* Overview */}
            <Typography variant={"body1"}>
              {movieData?.overview && movieData.overview}
            </Typography>

            {movieDataCreditsIsFetching ? (
              <Typography>Fetching...</Typography>
            ) : (
              <Stack
                direction="row"
                sx={{ maxWidth: "100%", flexWrap: "wrap", gap: 4 }}
                divider={<Divider orientation="vertical" flexItem />}
              >
                {getMainCrew(movieDataCredits.crew).map(
                  (worker: ICrew, index: number) => (
                    <Box
                      key={index}
                      sx={{
                        objectFit: "contain",
                        mt: 2,
                      }}
                    >
                      <Typography sx={{ fontWeight: 700 }}>
                        {worker?.name}
                      </Typography>
                      <Typography variant={"subtitle2"}>
                        {worker?.job}
                      </Typography>
                    </Box>
                  )
                )}
              </Stack>
            )}
          </Stack>
        </Box>
      )}
    </RouteContainer>
  );
}
