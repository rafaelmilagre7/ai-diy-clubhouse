
import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useLogging } from "@/hooks/useLogging";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

const MemberSolutionRedirect = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { log } = useLogging("MemberSolutionRedirect");
  
  useEffect(() => {
    if (!id) {
      navigate("/solutions", { replace: true });
      return;
    }
    
    log("Redirecionando URL antiga para novo formato", { 
      from: location.pathname,
      to: `/solutions/${id}` 
    });
    
    // Notificar o usuário sobre o redirecionamento
    toast.info("Atualizamos nossos links. Redirecionando para o novo endereço.");
    
    // Redirecionar para o novo formato de URL
    navigate(`/solutions/${id}`, { replace: true });
    
  }, [id, navigate, location.pathname, log]);
  
  return <LoadingScreen message="Redirecionando..." />;
};

export default MemberSolutionRedirect;
