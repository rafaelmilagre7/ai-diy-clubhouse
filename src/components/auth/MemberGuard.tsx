
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import MemberLayout from "@/components/layout/MemberLayout";

const MemberGuard = () => {
  const { user } = useAuth();
  
  // Já verificamos autenticação no AuthGuard
  // Aqui apenas aplicamos o layout para membros
  console.log("MemberGuard renderizado para usuário:", user?.email);
  
  return (
    <MemberLayout>
      <Outlet />
    </MemberLayout>
  );
};

export default MemberGuard;
