import { useEffect } from "react";
import { useState, SyntheticEvent } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Box,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { grey } from "@mui/material/colors";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAxios } from "src/hooks/exports";
import TMDB_LOGO from "src/assets/tmdb_logo_2.svg";

interface IGenres {
  id: number;
  name: string;
}

export default function Navigator() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const api = useAxios();
  const [value, setValue] = useState(0);

  const { data: movieGenres }: any = useQuery({
    queryKey: ["movie", "genres"],
    queryFn: getMovieGenres,
  });

  async function getMovieGenres() {
    try {
      const result = await api.get("/genre/movie/list");
      return result?.data;
    } catch (e: any) {
      throw e.response.data.error;
    }
  }

  /**
   * Retrieves array of genres from queryClient with hash ["movie", "genres"].
   * Filter out the genre ID from the genres array using the 'genre' parameter.
   */
  function getGenreId(genre: string): string | undefined {
    console.log("Genre:", genre);
    // if (!searchParams.get("with_genres")) return undefined;
    try {
      const genreId = movieGenres?.genres.filter(
        (movie: IGenres) => movie.name.toLowerCase() === genre
      )[0].id;
      return genreId.toString();
    } catch (e: any) {
      return undefined;
    }
  }

  // TODO: What's going on here
  useEffect(() => {
    const path = location.pathname.replace("/", "");
    movieGenres?.genres.forEach((movie: IGenres, index: number) => {
      if (movie.name.toLowerCase() === path) {
        setValue(index + 1);
      }
    });
  }, [location, movieGenres]);

  const handleTabChange = (
    event: SyntheticEvent<Element, Event>,
    newValue: number
  ) => {
    setValue(newValue);
    // @ts-ignore
    const target = getGenreId(event.target?.textContent.toLowerCase());
    console.log("Target:", target);
    if (target === undefined) {
      setSearchParams((prev) => {
        let new_obj = Object.fromEntries(prev.entries());
        delete new_obj["with_genres"];
        return new_obj;
      });
    } else {
      setSearchParams((prev) => ({
        ...Object.fromEntries(prev.entries()),
        with_genres: target,
      }));
    }
  };

  return (
    <AppBar
      component="nav"
      sx={{
        height: 130,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          // justifyContent: { sm: "center" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img
            src={TMDB_LOGO}
            alt="TMDB Logo"
            height="30"
            style={{ marginLeft: 20, marginRight: 30 }}
          />
          <Typography variant="h5">Sean's Movie Library</Typography>
        </Box>
        <TextField
          id="search-bar"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          size="small"
          sx={{ background: grey[900] }}
        />
      </Toolbar>

      <Tabs
        value={value}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable tabs for genres"
        sx={{ height: 60 }}
        TabIndicatorProps={{
          style: { transition: "none" },
        }}
      >
        <Tab label={"Discover"} value={0} />
        {movieGenres?.genres?.map(({ id, name }: IGenres, index: number) => (
          <Tab key={index} label={name} value={index + 1} />
        ))}
      </Tabs>
    </AppBar>
  );
}
