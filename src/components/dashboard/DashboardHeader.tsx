
import { useAuth } from "@/contexts/auth";

interface DashboardHeaderProps {
  // Removidas as props desnecessárias para simplificar
}

export const DashboardHeader = () => {
  const { profile } = useAuth();
  
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md">
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo, {profile?.name?.split(" ")[0] || "Membro"}!</h1>
      </div>
    </div>
  );
};
