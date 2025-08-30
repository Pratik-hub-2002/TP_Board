import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import useStore from "./store";
import AppLoader from "./components/layout/AppLoader";

//Screen
import AuthScreen from "./screens/AuthScreen/mainPage";
import BoardsScreen from "./screens/BoardsScreen";
import BoardScreen from "./screens/BoardScreen";

//
import PublicOnlyRoute from "./components/utils/PublicOnlyRoute";
import PrivateRoute from "./components/utils/PrivateRoute";
import SnackbarManager from "./components/layout/SnackbarManager";


const App = () => {
  const { loader, setLoginStatus } = useStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLoginStatus(!!user);
    });
    return () => unsub();
  }, [setLoginStatus]);

  if (loader) return <AppLoader />;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarManager />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route
            path="/"
            element={
              <PublicOnlyRoute>
                <AuthScreen />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/boards"
            element={
              <PrivateRoute>
                <BoardsScreen />
              </PrivateRoute>
            }
          />
          <Route
            path="/boards/:boardId"
            element={
              <PrivateRoute component={BoardScreen} />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
