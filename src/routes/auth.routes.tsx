
import { Fragment } from "react";
import { Route } from "react-router-dom";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ResetPassword from "@/pages/auth/ResetPassword";
import SetNewPassword from "@/pages/auth/SetNewPassword";
import PublicLayout from "@/components/layout/PublicLayout";

export const authRoutes = (
  <Fragment>
    <Route path="/login" element={
      <PublicLayout>
        <Login />
      </PublicLayout>
    } />
    <Route path="/register" element={
      <PublicLayout>
        <Register />
      </PublicLayout>
    } />
    <Route path="/reset-password" element={
      <PublicLayout>
        <ResetPassword />
      </PublicLayout>
    } />
    <Route path="/set-new-password" element={
      <PublicLayout>
        <SetNewPassword />
      </PublicLayout>
    } />
  </Fragment>
);
