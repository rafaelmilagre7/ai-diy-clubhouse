
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useLogging } from "@/hooks/useLogging";
import LoadingScreen from "@/components/common/LoadingScreen";
import { supabase } from "@/lib/supabase";

const MemberSolutionRedirect = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { log } = useLogging("MemberSolutionRedirect");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const redirectToProperPath = async () => {
      if (!id) {
        navigate("/solutions", { replace: true });
        return;
      }
      
      try {
        // Verificar primeiro se a solução existe para evitar redirecionamentos inválidos
        const { data: solution, error } = await supabase
          .from("solutions")
          .select("id, title")
          .eq("id", id)
          .eq("published", true)
          .single();
        
        // Se a solução não for encontrada, redirecionar para a lista
        if (error || !solution) {
          log("Solução não encontrada, redirecionando para lista", { id });
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
      } catch (err) {
        log("Erro durante o redirecionamento", { error: err });
        navigate("/solutions", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    redirectToProperPath();
  }, [id, navigate, log, location.pathname]);
  
  // Mostrar tela de carregamento apenas durante o redirecionamento inicial
  if (isLoading) {
    return <LoadingScreen message="Redirecionando..." />;
  }
  
  return null;
};

export default MemberSolutionRedirect;
