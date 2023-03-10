import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Error, Home, MovieList, MovieDetail } from "src/routes/exports";
import Navigator from "./navigator";

const router = createBrowserRouter([
  {
    element: <Navigator />,
    errorElement: <Error />,
    children: [
      {
        path: "/movies",
        element: <MovieList />,
      },
      {
        path: "/movies/:id",
        element: <MovieDetail />,
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
