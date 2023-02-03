import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MovieList } from "src/routes/exports";
import Navigator from "./navigator";

interface IMovie {
  poster_path?: string | null;
  adult?: boolean;
  overview?: string;
  release_date?: string;
  genre_ids?: number[];
  id?: number;
  original_title?: string;
  original_language?: string;
  title?: string;
  backdrop_path?: string | null;
  popularity?: number;
  vote_count?: number;
  video?: boolean;
  vote_average?: number;
}

function App() {
  return (
    <BrowserRouter>
      <Navigator />
      <Routes>
        <Route path="/:genre" element={<MovieList />} />
        <Route path="/" element={<MovieList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
