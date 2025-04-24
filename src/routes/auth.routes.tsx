
import { Fragment } from "react";
import { Route } from "react-router-dom";
import PublicRoute from "@/components/auth/PublicRoute";

// Páginas de autenticação
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ResetPassword from "@/pages/auth/ResetPassword";
import SetNewPassword from "@/pages/auth/SetNewPassword";

export const authRoutes = (
  <Fragment>
    <Route path="/login" element={
      <PublicRoute>
        <Login />
      </PublicRoute>
    } />
    <Route path="/register" element={
      <PublicRoute>
        <Register />
      </PublicRoute>
    } />
    <Route path="/reset-password" element={
      <PublicRoute>
        <ResetPassword />
      </PublicRoute>
    } />
    <Route path="/set-new-password" element={
      <PublicRoute>
        <SetNewPassword />
      </PublicRoute>
    } />
  </Fragment>
);
