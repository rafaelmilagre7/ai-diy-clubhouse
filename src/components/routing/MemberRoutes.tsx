
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "@/components/layout/MemberLayout";
import SystemDiagnostic from "@/pages/system/SystemDiagnostic";

// Importações lazy para melhor performance
const Dashboard = lazy(() => import("@/pages/member/Dashboard"));
const SolutionDetails = lazy(() => import("@/components/solution/SolutionDetails"));
const SolutionImplementation = lazy(() => import("@/pages/member/SolutionImplementation"));
const Profile = lazy(() => import("@/pages/member/Profile"));
const Achievements = lazy(() => import("@/pages/member/Achievements"));

/**
 * MemberRoutes - Define as rotas disponíveis para membros autenticados
 */
const MemberRoutes = () => {
  console.log("MemberRoutes renderizando");
  
  return (
    <MemberLayout>
      <Suspense fallback={<LoadingScreen message="Carregando..." />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/solutions/:id" element={<SolutionDetails />} />
          <Route path="/implementation/:solutionId/:moduleId" element={<SolutionImplementation />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/diagnostic" element={<SystemDiagnostic />} />
        </Routes>
      </Suspense>
    </MemberLayout>
  );
};

export default MemberRoutes;
