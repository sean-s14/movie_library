import "./movieDetail.css";
import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Avatar,
  CircularProgress,
  Divider,
  Paper,
  Card,
  CardMedia,
  CardContent,
  Modal,
  Button,
  Skeleton,
  useMediaQuery,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { PlayCircleOutline } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useAxios } from "src/hooks/exports";
import {
  dateConverter,
  calculateColor,
  timeConverter,
} from "src/utils/exports";
import RouteContainer from "src/routeContainer";

const responsiveCarousel = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 1300 },
    items: 6,
    slidesToSlide: 6,
  },
  desktop: {
    breakpoint: { max: 1300, min: 1100 },
    items: 5,
    slidesToSlide: 5,
  },
  tablet: {
    breakpoint: { max: 1100, min: 900 },
    items: 4,
    slidesToSlide: 4,
  },
  tablet2: {
    breakpoint: { max: 900, min: 700 },
    items: 3,
    slidesToSlide: 3,
  },
  mobile: {
    breakpoint: { max: 700, min: 0 },
    items: 2,
    slidesToSlide: 2,
  },
  mobile2: {
    breakpoint: { max: 500, min: 0 },
    items: 1,
    slidesToSlide: 1,
  },
};

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

interface IVideo {
  is_639_1?: string;
  is_3166_1?: string;
  name?: string;
  key?: string;
  site?: string;
  size?: string;
  type?: string;
  official?: boolean;
  published_at?: string;
  id: string;
}

interface IVideos {
  id: number;
  results: IVideo[];
}

const styles = {
  basicInfo: {
    fontSize: { xs: 13, md: 16 },
  },
  userScore: {
    diameter: { xs: 50, md: 80 },
  },
};

export default function MovieDetail() {
  const api = useAxios();
  const { id: movieId } = useParams();
  const [trailerOpen, setTrailerOpen] = useState(false);

  function handleTrailerOpen() {
    setTrailerOpen((prev) => !prev);
  }

  const { data: movieData, isFetching: movieDataIsFetching }: any = useQuery({
    queryKey: ["movie", movieId],
    queryFn: getMovieDetail,
  });

  async function getMovieDetail() {
    try {
      const query = `movie/${movieId}`;
      const result = await api.get(query);
      // Timeout for testing purposes
      // return new Promise((resolve, reject) => {
      //   setTimeout(() => {
      //     resolve(result?.data);
      //   }, 1500);
      // });
      return result?.data;
    } catch (e: any) {
      throw e.response.data.error;
    }
  }

  const { data: movieVideos, isFetching: movieVideosIsFetching }: any =
    useQuery({
      queryKey: ["movie", movieId, "videos"],
      queryFn: getMovieVideos,
    });

  async function getMovieVideos() {
    try {
      const query = `movie/${movieId}/videos`;
      const result = await api.get(query);
      return result?.data;
    } catch (e: any) {
      throw e.response.data.error;
    }
  }

  function getMovieTrailer(videos: IVideos): IVideo | null {
    let trailer = null;
    for (const video of videos["results"]) {
      if (video["name"] === "Official Trailer" && video["type"] === "Trailer") {
        trailer = video;
      }
    }
    return trailer;
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
    <RouteContainer
      noLogo={true}
      sx={{
        py: 0,
        pb: 10,
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: { xs: "fit-content", md1050: 550 },
          display: "flex",
          flexDirection: { xs: "column", sm700: "row" },
          position: "relative",
        }}
      >
        {/* Backdrop Image */}
        {movieData ? (
          <img
            id="backdrop-image"
            src={`https://image.tmdb.org/t/p/w1280/${movieData.backdrop_path}`}
            alt={`Backdrop image for ${movieData.title}`}
          />
        ) : (
          <Skeleton
            variant="rectangular"
            width={"100%"}
            height={"100%"}
            sx={{ position: "absolute" }}
          ></Skeleton>
        )}

        {/* Poster Image */}
        {movieData ? (
          <img
            id="poster-image"
            src={`https://image.tmdb.org/t/p/w500/${movieData.poster_path}`}
            alt={`Poster image for ${movieData.title}`}
          />
        ) : (
          <Skeleton
            id="poster-image"
            variant="rectangular"
            sx={{
              minWidth: { xs: 260, md: 300 },
              height: { sx: 390, md: 450 },
            }}
          ></Skeleton>
        )}

        <Stack
          spacing={movieData ? 1 : 0}
          sx={{
            position: "inherit",
            width: "100%",
            height: "100%",
            color: grey[100],
            p: 3,
            pr: { xs: 8, md: 15 },
          }}
        >
          {/* Title */}
          {movieData ? (
            <Typography
              variant={"h4"}
              sx={{ color: "inherit", fontSize: { xs: 24, md: 36 } }}
            >
              {movieData.title}
            </Typography>
          ) : (
            <Skeleton width={350} height={70}></Skeleton>
          )}

          {/* Release Date, Genres, Runtime */}
          {movieData ? (
            <Typography
              variant={"subtitle2"}
              sx={{ color: grey[300], ...styles.basicInfo }}
            >
              {movieData.release_date &&
                dateConverter(movieData.release_date, true)}
              {"  "}
              &bull;
              {movieData?.genres &&
                movieData.genres.map(
                  ({ name }: { name: string }, index: number) => (
                    <Typography
                      key={index}
                      component={"span"}
                      sx={styles.basicInfo}
                    >
                      {" "}
                      {name}
                      {index < movieData.genres.length - 1 && ","}
                    </Typography>
                  )
                )}{" "}
              &bull;{" "}
              <Typography component={"span"} sx={styles.basicInfo}>
                {movieData?.runtime && timeConverter(movieData.runtime)}
              </Typography>
            </Typography>
          ) : (
            <Skeleton width={350} height={40}></Skeleton>
          )}

          {/* User Score & Trailer Button */}
          <Stack direction="row" spacing={3} alignItems="center">
            {/* User Score */}
            {movieData ? (
              <Box
                sx={{
                  position: "relative",
                  minWidth: styles.userScore.diameter,
                  minHeight: styles.userScore.diameter,
                  width: styles.userScore.diameter,
                  height: styles.userScore.diameter,
                  maxWidth: styles.userScore.diameter,
                  maxHeight: styles.userScore.diameter,
                  display: "inline-flex",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "black",
                    color: "white",
                    fontSize: { xs: 18, md: 24 },
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
                    position: "absolute",
                    color: () => calculateColor(movieData),
                  }}
                  value={
                    (movieData?.vote_average && movieData.vote_average * 10) ||
                    0
                  }
                />
              </Box>
            ) : (
              <Skeleton variant="circular" width={80} height={80}></Skeleton>
            )}

            {/* Trailer Button */}
            {!movieVideosIsFetching && movieVideos ? (
              getMovieTrailer(movieVideos) !== null && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleTrailerOpen}
                  sx={{
                    width: { xs: 150, md: 180 },
                    height: { xs: 50, md: 62 },
                    display: "flex",
                    justifyContent: "space-between",
                    borderRadius: 10,
                    px: 0,
                    py: 0,
                    pr: 2,
                  }}
                >
                  <PlayCircleOutline sx={{ fontSize: { xs: 48, md: 60 } }} />
                  <Typography
                    variant="h6"
                    sx={{ fontSize: { xs: 18, md: 22 } }}
                  >
                    Trailer
                  </Typography>
                </Button>
              )
            ) : (
              <Skeleton
                variant="rectangular"
                width={180}
                height={62}
                sx={{ borderRadius: 10 }}
              ></Skeleton>
            )}
          </Stack>

          {/* Trailer */}
          <Modal
            open={trailerOpen}
            onClose={handleTrailerOpen}
            aria-labelledby="trailer-modal"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                maxWidth: "80%",
                width: 800,
                height: "calc(800px / 16 * 9)",
                maxHeight: "calc(80% / 16 * 9)",
              }}
            >
              {!movieVideosIsFetching &&
                movieVideos &&
                getMovieTrailer(movieVideos) !== null && (
                  <iframe
                    loading="lazy"
                    id="movie-trailer"
                    src={`https://www.youtube.com/embed/${
                      getMovieTrailer(movieVideos)?.key
                    }`}
                  ></iframe>
                )}
            </Box>
          </Modal>

          {/* Tagline */}
          {movieData ? (
            <Typography
              component={"em"}
              variant={"subtitle1"}
              sx={{ color: grey[400], fontSize: { xs: 15, md: 18 } }}
            >
              {movieData?.tagline && movieData.tagline}
            </Typography>
          ) : (
            <Skeleton width={300} height={40}></Skeleton>
          )}

          {/* Overview Label */}
          {movieData ? (
            <Typography variant={"h5"} sx={{ fontSize: { xs: 20, md: 24 } }}>
              Overview
            </Typography>
          ) : (
            <Skeleton width={140} height={50}></Skeleton>
          )}

          {/* Overview */}
          {movieData ? (
            <Typography variant={"body1"} sx={{ fontSize: { xs: 14, md: 16 } }}>
              {movieData?.overview && movieData.overview}
            </Typography>
          ) : (
            <Skeleton width={"95%"} height={150}></Skeleton>
          )}

          {/* Main Crew */}
          <Stack
            direction="row"
            sx={{
              maxWidth: "100%",
              flexWrap: "wrap",
              gap: 4,
            }}
            divider={<Divider orientation="vertical" flexItem />}
          >
            {!movieDataCreditsIsFetching && movieDataCredits
              ? getMainCrew(movieDataCredits.crew).map(
                  (worker: ICrew, index: number) => (
                    <Box
                      key={index}
                      sx={{
                        objectFit: "contain",
                        mt: 2,
                      }}
                    >
                      <Typography
                        sx={{ fontWeight: 700, fontSize: { xs: 14, md: 16 } }}
                      >
                        {worker?.name}
                      </Typography>
                      <Typography
                        variant={"subtitle2"}
                        sx={{ fontSize: { xs: 12, md: 14 } }}
                      >
                        {worker?.job}
                      </Typography>
                    </Box>
                  )
                )
              : [1, 2, 3, 4].map((item) => (
                  <Box key={item} sx={{}}>
                    <Skeleton width={100} height={35}></Skeleton>
                    <Skeleton width={80} height={25}></Skeleton>
                  </Box>
                ))}
          </Stack>
        </Stack>
      </Box>

      {/* Cast Carousel */}
      <Box
        sx={{
          width: "100%",
        }}
      >
        {movieDataCreditsIsFetching ? (
          <Typography>Fetching...</Typography>
        ) : (
          <Carousel
            responsive={responsiveCarousel}
            containerClass="carouselContainer"
            customTransition="transform 750ms ease-in-out"
            itemClass="carousel-item"
          >
            {movieDataCredits.cast.map((actor: ICast, index: number) => (
              <Paper
                key={index}
                elevation={12}
                sx={{ width: 170, borderRadius: 3 }}
              >
                <Card sx={{ borderRadius: "inherit" }}>
                  <CardMedia
                    image={`https://image.tmdb.org/t/p/w185/${actor.profile_path}`}
                    sx={{ width: 170, height: 255 }}
                  />
                  <CardContent sx={{ height: 80, px: 2 }}>
                    <Typography
                      variant="h1"
                      component="div"
                      sx={{ fontSize: 16 }}
                    >
                      {actor.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {actor.character}
                    </Typography>
                  </CardContent>
                </Card>
              </Paper>
            ))}
          </Carousel>
        )}
      </Box>
    </RouteContainer>
  );
}
