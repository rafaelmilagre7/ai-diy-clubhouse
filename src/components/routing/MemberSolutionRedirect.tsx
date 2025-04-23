
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useLogging } from "@/hooks/useLogging";
import LoadingScreen from "@/components/common/LoadingScreen";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const MemberSolutionRedirect = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { log, logError } = useLogging("MemberSolutionRedirect");
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    const redirectToProperPath = async () => {
      if (!id) {
        navigate("/solutions", { replace: true });
        return;
      }
      
      try {
        log("Verificando solução para redirecionamento", { id, path: location.pathname });
        
        // Verificar primeiro se a solução existe para evitar redirecionamentos inválidos
        const { data: solution, error } = await supabase
          .from("solutions")
          .select("id, title")
          .eq("id", id)
          .eq("published", true)
          .single();
        
        // Se a solução não for encontrada ou houver erro, redirecionar para a lista
        if (error || !solution) {
          log("Solução não encontrada, redirecionando para lista", { id, error });
          toast.error("Solução não encontrada");
          navigate("/solutions", { replace: true });
          return;
        }
        
        // Analisar qual tipo de redirecionamento precisamos fazer
        if (location.pathname.startsWith("/solution/")) {
          // Caminho padrão para detalhes da solução
          const newPath = `/solutions/${id}`;
          log("Redirecionando para o caminho correto da solução", { from: location.pathname, to: newPath });
          navigate(newPath, { replace: true });
        } else if (location.pathname.includes("/implement/") || location.pathname.includes("/implementation/")) {
          // Se for implementação, usar o formato correto
          const moduleIdx = location.pathname.split("/").pop() || "0";
          const newPath = `/implement/${id}/${moduleIdx}`;
          log("Redirecionando para implementação", { from: location.pathname, to: newPath });
          navigate(newPath, { replace: true });
        }
      } catch (err: any) {
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        
        logError("Erro durante o redirecionamento", { error: err, retryCount: newRetryCount });
        
        if (newRetryCount <= 3) {
          // Tentar novamente após um pequeno atraso com backoff exponencial
          const delay = Math.min(1000 * Math.pow(1.5, newRetryCount), 5000);
          log(`Tentando novamente em ${delay}ms (tentativa ${newRetryCount}/3)`);
          
          setTimeout(() => {
            redirectToProperPath();
          }, delay);
        } else {
          toast.error("Não foi possível carregar a solução. Por favor, tente novamente mais tarde.");
          navigate("/solutions", { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };

    redirectToProperPath();
  }, [id, navigate, location.pathname, log, logError, retryCount]);
  
  // Mostrar tela de carregamento apenas durante o redirecionamento inicial
  if (isLoading) {
    return <LoadingScreen message="Redirecionando..." />;
  }
  
  return null;
};

export default MemberSolutionRedirect;
