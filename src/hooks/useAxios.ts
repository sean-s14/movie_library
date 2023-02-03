import axios from "axios";
// import { useQueryClient } from "@tanstack/react-query";

const env = import.meta.env;
const baseURL = "https://api.themoviedb.org/3/";

const useAxios = () => {
  //   const queryClient = useQueryClient();

  // const headers = {
  //   "Content-Type": "application/json;charset=utf-8",
  //   Authorization: `Bearer ${env.VITE_TMDB_API_KEY_V4}`,
  // };

  const config: any = {
    baseURL,
    // TODO: Add this when solution is found to TMDB issue
    // withCredentials: true,
    // headers: headers
  };

  // TODO: Add this when solution is found to TMDB issue
  // if (env.PROD) {
  //   config.withCredentials = true;
  //   config.headers = headers;
  // }

  const instance = axios.create(config);

  instance.interceptors.request.use(async (req: any) => {
    console.log("Interceptor Request :", req);

    // If the url already has parameters, use ? instead of &
    const regex = new RegExp(/[\?]/g);
    let seperator = regex.test(req.url) ? "&" : "?";
    req.url += seperator + "api_key=" + env.VITE_TMDB_API_KEY_V3;

    return req;
  });

  instance.interceptors.response.use(
    (res: any) => {
      console.log("Interceptor Response :", res);
      return res;
    },
    (err: any) => {
      console.log("Interceptor Error :", err);
      throw err;
    }
  );

  return instance;
};

export default useAxios;
