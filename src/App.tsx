import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MovieList } from "src/routes/exports";
import Navigator from "./navigator";

function App() {
  return (
    <BrowserRouter>
      <Navigator />
      <Routes>
        <Route path="/" element={<MovieList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
