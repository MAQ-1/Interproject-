import { Suspense, lazy, useEffect, useState } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import type { AccessTokenResponse } from "@shared/auth";
import { api, getAccessToken, setAccessToken, clearAuthSession } from "./api";
import Navbar from "./components/Navbar";
import GuestRoute from "./routes/GuestRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const FilesPage = lazy(() => import("./pages/FilesPage"));
const FileOpen = lazy(() => import("./pages/FileOpen"));
const VerifyPage = lazy(() => import("./pages/VerifyPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved) return saved;

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    return prefersDark ? "dark" : "light";
  });

  const [accessToken, setAccessTokenState] = useState<string | null>(() =>
    getAccessToken(),
  );
  const [isBootstrappingAuth, setIsBootstrappingAuth] = useState(
    () => getAccessToken() === null,
  );

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (getAccessToken()) {
      setIsBootstrappingAuth(false);
      return;
    }

    let isMounted = true;

    const bootstrapAuth = async () => {
      try {
        const response =
          await api.post<AccessTokenResponse>("/api/auth/refresh");

        if (isMounted) {
          setAccessTokenState(response.data.accessToken);
        }
      } catch {
        if (isMounted) {
          setAccessTokenState(null);
        }
      } finally {
        if (isMounted) {
          setIsBootstrappingAuth(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error('[Logout] Error during logout:', error);
    } finally {
      clearAuthSession();
      setAccessTokenState(null);
      navigate("/login", { replace: true });
    }
  };

  const isAuth = !!accessToken;

  return (
    <div className="app-shell">
      {!isBootstrappingAuth && isAuth && location.pathname !== "/" && (
        <Navbar
          isAuthenticated={isAuth}
          isLightMode={theme === "light"}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
      )}

      <main
        className={`page-shell${
          !isBootstrappingAuth && !isAuth ? " page-shell-guest" : ""
        }`}
      >
        {isBootstrappingAuth ? (
          <div className="loading-card">Loading your workspace...</div>
        ) : (
          <Suspense fallback={<div className="loading-card">Loading your workspace...</div>}>
            <Routes>
              <Route
                path="/"
                element={
                  <LandingPage />
                }
              />

              <Route
                path="/login"
                element={
                  <GuestRoute isAuthenticated={isAuth}>
                    <LoginPage onAuth={setAccessTokenState} />
                  </GuestRoute>
                }
              />

              <Route
                path="/register"
                element={
                  <GuestRoute isAuthenticated={isAuth}>
                    <RegisterPage />
                  </GuestRoute>
                }
              />

              <Route
                path="/files"
                element={
                  <ProtectedRoute isAuthenticated={isAuth}>
                    <FilesPage />
                  </ProtectedRoute>
                }
              />


              <Route
                path="/fileOpen"
                element={
                  <ProtectedRoute isAuthenticated={isAuth}>
                    <FileOpen />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/verify/:sessionId"
                element={
                  <ProtectedRoute isAuthenticated={isAuth}>
                    <VerifyPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="*"
                element={<NotFoundPage isAuthenticated={isAuth} />}
              />
            </Routes>
          </Suspense>
          
        )}
      </main>
    </div>
  );
}

export default App;
