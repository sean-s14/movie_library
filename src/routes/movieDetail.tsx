import { Box, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAxios } from "src/hooks/exports";
import { Link, useParams } from "react-router-dom";
import RouteContainer from "src/routeContainer";

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

  return (
    <RouteContainer>
      {movieDataIsFetching ? (
        <Typography>Fetching...</Typography>
      ) : (
        <Typography>{movieData?.title}</Typography>
      )}
    </RouteContainer>
  );
}
