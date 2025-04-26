
import { Route } from "react-router-dom";
import { lazy } from "react";

const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const SetNewPassword = lazy(() => import("@/pages/auth/SetNewPassword"));

export const AuthRoutes = () => {
  return (
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/reset-password/update" element={<SetNewPassword />} />
    </>
  );
};
