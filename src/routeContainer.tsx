import { Box } from "@mui/material";
import tmdbLogo from "src/assets/tmdb_logo.svg";

export default function RouteContainer(props: any) {
  return (
    <Box
      sx={{
        mt: "70px",
        display: "flex",
        justifyContent: "center",
        py: 10,
        minHeight: "calc(100vh - 70px)",
        /* fallback for old browsers */
        // background: "#0f2027",
        /* Chrome 10-25, Safari 5.1-6 */
        // background:
        //   "-webkit-linear-gradient(to right, #0f2027, #203a43, #2c5364)",
        // backgroundImage: "linear-gradient(45deg, #141e30, #243b55)",
        backgroundImage: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
        ...props.sx,
      }}
    >
      <img
        src={tmdbLogo}
        alt="TMDB Logo"
        style={{
          position: "fixed",
          top: 450,
          margin: 30,
          zIndex: 0,
          opacity: 0.6,
        }}
      />
      {props.children}
    </Box>
  );
}
