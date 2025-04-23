
import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useLogging } from "@/hooks/useLogging";
import { toast } from "sonner";
import LoadingScreen from "@/components/common/LoadingScreen";

const MemberSolutionRedirect = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { log } = useLogging("MemberSolutionRedirect");
  
  useEffect(() => {
    if (id) {
      // Analisar qual tipo de redirecionamento precisamos fazer
      if (location.pathname.startsWith("/solution/")) {
        // Caminho padrão para detalhes da solução
        const newPath = `/solutions/${id}`;
        
        log("Redirecionando para o caminho correto da solução", { 
          from: location.pathname, 
          to: newPath 
        });
        
        console.log(`Redirecionando de ${location.pathname} para ${newPath}`);
        
        // Redirecionar com efeito de substituição para não criar histórico desnecessário
        navigate(newPath, { replace: true });
      } else if (location.pathname.includes("/implement/") || location.pathname.includes("/implementation/")) {
        // Se for implementação, manter o mesmo padrão
        const moduleIdx = location.pathname.split("/").pop() || "0";
        const newPath = `/implement/${id}/${moduleIdx}`;
        
        log("Redirecionando para implementação", { 
          from: location.pathname, 
          to: newPath 
        });
        
        console.log(`Redirecionando implementação de ${location.pathname} para ${newPath}`);
        
        // Redirecionar com efeito de substituição
        navigate(newPath, { replace: true });
      }
    } else {
      // Se não houver ID, voltar para a lista de soluções
      navigate("/solutions");
    }
  }, [id, navigate, log, location.pathname]);
  
  return <LoadingScreen message="Redirecionando..." />;
};

export default MemberSolutionRedirect;
