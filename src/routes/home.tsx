import { KeyboardEvent } from "react";
import { TextField, InputAdornment } from "@mui/material";
import { Search } from "@mui/icons-material";
import { grey } from "@mui/material/colors";
import { useNavigate, createSearchParams } from "react-router-dom";
import RouteContainer from "src/routeContainer";

export default function Home() {
  const navigate = useNavigate();

  function handleSearch(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    console.log("Navigating...");
    // @ts-ignore
    const value = e.target.value;
    if (typeof value === "string") {
      return navigate({
        pathname: "movies",
        search: createSearchParams({ query: value }).toString(),
      });
    }
  }

  return (
    <RouteContainer>
      <TextField
        onKeyDown={handleSearch}
        id="home-search-bar"
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        size="medium"
        sx={{
          mt: 15,
          maxWidth: 500,
          width: "80%",
          "& .MuiInputBase-root": {
            borderRadius: 20,
          },
          "&.MuiFormControl-root": {
            maxHeight: 56,
            borderRadius: 20,
          },
          background: grey[900],
        }}
      />
    </RouteContainer>
  );
}
