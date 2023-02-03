import { useEffect } from "react";
import { useState, SyntheticEvent } from "react";
import { AppBar, Toolbar, Typography, Tabs, Tab } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAxios } from "src/hooks/exports";

interface IGenres {
  id: number;
  name: string;
}

export default function Navigator() {
  const navigate = useNavigate();
  const location = useLocation();
  const api = useAxios();
  const [value, setValue] = useState(0);
  // const [valueText, setValueText] = useState("");

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

  useEffect(() => {
    const path = location.pathname.replace("/", "");
    // console.log("location :", location);
    // console.log("path :", path);
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
    let target = event.target?.textContent.toLowerCase();
    if (target) {
      if (target === "discover") {
        navigate("/");
      } else {
        navigate(`/${target}`);
      }
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
          justifyContent: { sm: "center" },
        }}
      >
        <Typography>Welcome to Sean's Movie Library</Typography>
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
