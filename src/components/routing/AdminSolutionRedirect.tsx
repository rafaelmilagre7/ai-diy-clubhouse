
import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";

/**
 * Componente para verificar e corrigir URLs incorretas de soluções na área de admin
 * Por exemplo, redireciona de /admin/solution/:id para /admin/solutions/:id
 */
const AdminSolutionRedirect = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Verificar se estamos em uma rota incorreta
    if (location.pathname.includes("/admin/solution/")) {
      const correctPath = location.pathname.replace("/admin/solution/", "/admin/solutions/");
      
      console.log(`Redirecionando de rota incorreta: ${location.pathname} para ${correctPath}`);
      
      toast.info("Redirecionando para a URL correta...", {
        id: `redirect-${id}`,
        duration: 2000
      });
      
      // Redirecionar para a rota correta
      navigate(correctPath, { replace: true });
    }
  }, [location.pathname, id, navigate]);
  
  return null;
};

export default AdminSolutionRedirect;
