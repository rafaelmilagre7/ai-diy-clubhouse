
import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useLogging } from "@/hooks/useLogging";
import { toast } from "sonner";

const AdminSolutionRedirect = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { log } = useLogging("AdminSolutionRedirect");
  
  useEffect(() => {
    if (id) {
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
      
      // Notificar o usuário
      toast.info("Redirecionando para a URL correta...", {
        id: `redirect-${id}`,
        duration: 2000
      });
      
      // Redirecionar para a URL nova
      navigate(newPath, { replace: true });
    } else {
      // Se não houver ID, voltar para a lista
      navigate("/admin/solutions");
    }
  }, [id, navigate, log, location.pathname]);
  
  return null; // Componente não renderiza nada, apenas redireciona
};

export default AdminSolutionRedirect;
