
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";

// Usar páginas que já existem
import Solutions from "@/pages/member/Solutions";
import SolutionDetails from "@/pages/member/SolutionDetails";
import ImplementationTrailPage from "@/pages/member/ImplementationTrailPage";

export const SolutionsRoutes = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Carregando soluções..." />}>
      <Routes>
        <Route index element={<Solutions />} />
        <Route path=":id" element={<SolutionDetails />} />
        <Route path=":id/implementar" element={<ImplementationTrailPage />} />
      </Routes>
    </Suspense>
  );
};
