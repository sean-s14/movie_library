import { green, amber, red, grey } from "@mui/material/colors";

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

/**
 * Used to calculate the color to use for the circular progress bar surrounding the movie rating
 */
export default function calculateColor(movie: IMovie) {
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
