import App from "src/App";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const env = import.meta.env;

declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    xs: true;
    xs300: true;
    xs450: true;
    xs475: true;
    sm: true;
    sm650: true;
    sm750: true;
    md: true;
    md1050: true;
    lg: true;
    xl: true;
  }
}

// ===== MUI =====
const darkTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      xs300: 300,
      xs450: 450,
      xs475: 475,
      sm: 600,
      sm650: 650,
      sm750: 750,
      md: 900,
      md1050: 1050,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    mode: "dark",
  },
});

// ===== FIREBASE =====
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ===== TanStack Query =====
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  );
}

export default Providers;
