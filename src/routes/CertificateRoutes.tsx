
import { RouteObject } from "react-router-dom";
import ValidateCertificate from "@/pages/certificate/ValidateCertificate";

export const certificateRoutes: RouteObject[] = [
  {
    path: "/certificado/validar",
    element: <ValidateCertificate />
  },
  {
    path: "/certificado/validar/:code",
    element: <ValidateCertificate />
  }
];
