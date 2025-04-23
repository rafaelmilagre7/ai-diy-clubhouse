
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useLogging } from "@/hooks/useLogging";
import LoadingScreen from "@/components/common/LoadingScreen";
import { supabase } from "@/lib/supabase";

const AdminSolutionRedirect = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { log, logError } = useLogging("AdminSolutionRedirect");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const redirectToProperPath = async () => {
      if (!id) {
        navigate("/admin/solutions", { replace: true });
        return;
      }
      
      try {
        // Verificar primeiro se a solução existe para evitar redirecionamentos inválidos
        const { data: solution, error } = await supabase
          .from("solutions")
          .select("id, title")
          .eq("id", id)
          .maybeSingle();
        
        // Se a solução não for encontrada, redirecionar para a lista
        if (error || !solution) {
          logError("Solução não encontrada no admin, redirecionando para lista", { id });
          navigate("/admin/solutions", { replace: true });
          return;
        }
        
        // Verificar se estamos na rota antiga do editor ou apenas na rota da solução
        const isEditorRoute = location.pathname.includes('/editor');
        const newPath = isEditorRoute 
          ? `/admin/solutions/${id}/editor` 
          : `/admin/solutions/${id}`;
        
        log("Redirecionando URL antiga para novo formato", { 
          from: location.pathname, 
          to: newPath 
        });
        
        console.log(`Redirecionando de ${location.pathname} para ${newPath}`);
        navigate(newPath, { replace: true });
      } catch (err) {
        logError("Erro durante o redirecionamento admin", { error: err });
        navigate("/admin/solutions", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    redirectToProperPath();
  }, [id, navigate, log, logError, location.pathname]);
  
  // Mostrar tela de carregamento apenas durante o redirecionamento inicial
  if (isLoading) {
    return <LoadingScreen message="Redirecionando..." />;
  }
  
  return null;
};

export default AdminSolutionRedirect;
