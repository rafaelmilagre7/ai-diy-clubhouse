
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLogging } from "@/hooks/useLogging";
import { toast } from "sonner";

const AdminSolutionRedirect = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { log } = useLogging("AdminSolutionRedirect");
  
  useEffect(() => {
    if (id) {
      log("Redirecionando URL antiga para novo formato", { 
        from: `/admin/solution/${id}`, 
        to: `/admin/solutions/${id}` 
      });
      
      // Notificar o usuário
      toast.info("Redirecionando para a URL correta...", {
        id: `redirect-${id}`,
        duration: 2000
      });
      
      // Redirecionar para a URL nova
      navigate(`/admin/solutions/${id}`, { replace: true });
    } else {
      // Se não houver ID, voltar para a lista
      navigate("/admin/solutions");
    }
  }, [id, navigate, log]);
  
  return null; // Componente não renderiza nada, apenas redireciona
};

export default AdminSolutionRedirect;
