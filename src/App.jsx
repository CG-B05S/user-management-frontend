import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./routes/PrivateGuard";
import GuestRoute from "./routes/GuestGuard";
import Navbar from "./pages/Navbar";

function RecaptchaBadgeVisibility() {
  const location = useLocation();

  useEffect(() => {
    const authPaths = new Set([
      "/",
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password"
    ]);

    const shouldShowBadge = authPaths.has(location.pathname);
    document.querySelectorAll(".grecaptcha-badge").forEach((badge) => {
      badge.style.display = shouldShowBadge ? "block" : "none";
    });
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RecaptchaBadgeVisibility />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 min-h-0">
          <Routes>

        {/* AUTH ROUTES (blocked if logged in) */}
        <Route
          path="/"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        <Route
          path="/verify-otp"
          element={
            <GuestRoute>
              <VerifyOtp />
            </GuestRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />

        <Route
          path="/reset-password"
          element={
            <GuestRoute>
              <ResetPassword />
            </GuestRoute>
          }
        />

        {/* PROTECTED ROUTE */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
