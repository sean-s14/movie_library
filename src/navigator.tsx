import {
  useEffect,
  useState,
  SyntheticEvent,
  KeyboardEvent,
  ChangeEvent,
} from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Box,
  Tooltip,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { grey } from "@mui/material/colors";
import {
  useNavigate,
  useLocation,
  useSearchParams,
  createSearchParams,
  Outlet,
} from "react-router-dom";
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
  const navigate = useNavigate();
  const api = useAxios();
  const [value, setValue] = useState<number | boolean>(0);
  const [searchText, setSearchText] = useState("");

  const { data: movieGenres }: any = useQuery({
    queryKey: ["movie", "genres"],
    queryFn: getMovieGenres,
  });

  /** Retrieves all movie genres from API */
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
    const regex = new RegExp(/\/movies\/[0-9]+/);
    if (location.pathname === "/" || regex.test(location.pathname)) {
      setValue(false);
    }
  }, [location, movieGenres]);

  /** Navigates to /movies with the ?with_genres={genreId} as its parameter */
  function handleTabChange(
    event: SyntheticEvent<Element, Event>,
    newValue: number
  ) {
    setValue(newValue);
    // @ts-ignore
    const target = getGenreId(event.target?.textContent.toLowerCase());
    console.log("Target:", target);
    if (target !== undefined) {
      return navigate({
        pathname: "movies",
        search: createSearchParams({ with_genres: target }).toString(),
      });
    }
    return navigate("movies");
  }

  /** Navigates to /movies with ?query={searchText} as its parameters */
  function handleSearch() {
    return navigate({
      pathname: "movies",
      search: createSearchParams({ query: searchText }).toString(),
    });
  }

  /** Executes handleSearch (above) if the 'enter' key is pressed */
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  /** Set's the searchText state variable whenever the text in TextField changes */
  function handleSearchOnChange(e: ChangeEvent<HTMLInputElement>) {
    // @ts-ignore
    const value = e.target.value;
    console.log(typeof value, value);
    if (typeof value === "string") {
      setSearchText(value);
    }
  }

  /** Determines wether user is on the "discover" page */
  function handleIsDiscover() {
    let params = 0;
    let isQuery = false;
    if (searchParams.get("query") !== null) {
      isQuery = true;
      params++;
    }
    for (const [key, val] of searchParams.entries()) {
      if (key === "query") continue;
      params++;
    }
    if ((!isQuery && params > 0) || (isQuery && params > 1)) {
      return true;
    }
  }

  return (
    <>
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
          {/* Title & Logo */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              src={TMDB_LOGO}
              alt="TMDB Logo"
              height="30"
              style={{ marginLeft: 20, marginRight: 30, cursor: "pointer" }}
              onClick={() => navigate("/")}
            />
            <Typography variant="h5">Sean's Movie Library</Typography>
          </Box>

          {/* <Link to="/movies">Movies</Link> */}

          {/* Search Box */}
          <Tooltip
            title={
              handleIsDiscover()
                ? "Movies cannot be searched by name when using sort or filter"
                : ""
            }
          >
            <span>
              <TextField
                value={searchText}
                onChange={handleSearchOnChange}
                onKeyDown={handleKeyDown}
                id="search-bar"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{ cursor: "pointer" }}
                      onClick={handleSearch}
                    >
                      <Search />
                    </InputAdornment>
                  ),
                }}
                size="small"
                sx={{ background: grey[900] }}
                disabled={handleIsDiscover()}
              />
            </span>
          </Tooltip>
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

      <Outlet />
    </>
  );
}
