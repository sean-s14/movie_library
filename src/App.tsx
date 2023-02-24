import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home, MovieList } from "src/routes/exports";
import Navigator from "./navigator";

const router = createBrowserRouter([
  {
    element: <Navigator />,
    children: [
      {
        path: "/movies",
        element: <MovieList />,
      },
      {
        path: "*",
        element: <Home />,
      },
    ],
  },
]);

function App() {
  return (
    <RouterProvider
      router={router}
      // fallbackElement={<BigSpinner />} TODO: Add Later
    />
  );
}

export default App;
