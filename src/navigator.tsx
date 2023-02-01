import { AppBar, Toolbar, Typography } from "@mui/material";

export default function Navigator() {
  return (
    <AppBar
      component="nav"
      sx={{
        height: 70,
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
    </AppBar>
  );
}
