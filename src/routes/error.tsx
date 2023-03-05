import { Link } from "react-router-dom";

export default function Error() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        minWidth: "100vw",
        backgroundImage: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
      }}
    >
      <h1 style={{ fontSize: 80 }}>404</h1>
      <Link to={"/"} style={{ color: "white" }}>
        &lt; Home
      </Link>
    </div>
  );
}
