import { Box } from "@mui/material";

export default function RouteContainer(props: any) {
  return (
    <Box
      sx={{
        mt: "70px",
        display: "flex",
        justifyContent: "center",
        pt: 10,
        minHeight: "calc(100vh - 70px)",
        ...props.sx,
      }}
    >
      {props.children}
    </Box>
  );
}
