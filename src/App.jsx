import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { auth, onAuthStateChanged } from "./firebase";
import useStore from "./store";

import AuthScreen from "./screens/AuthScreen/mainPage";
import AppLoader from "./components/layout/AppLoader";
import BoardsScreen from "./screens/BoardsScreen";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import PrivateRoute from "./components/utils/PrivateRoute";

const App = () => {
  const { loader, setLoginStatus } = useStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLoginStatus(!!user);
    });

    return () => unsub();
  }, []);

  if (loader) {
    return <AppLoader />;
  }



  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicOnlyRoute component={ AuthScreen } />} />
          <Route path="/boards" element={<PrivateRoute component={ BoardsScreen } />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
