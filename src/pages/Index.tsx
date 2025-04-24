
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth();

  // Redirecionar automaticamente para a página correta após verificar autenticação
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Se já estiver autenticado, redirecionar para a página apropriada
        if (isAdmin) {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        // Redirecionar para autenticação após um breve delay
        const timer = setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [navigate, user, isAdmin, isLoading]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img
            className="mx-auto h-24 w-auto"
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
          />
          <h1 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            VIVER DE IA Club
          </h1>
          <p className="mt-2 text-center text-lg text-gray-600">
            Implemente soluções de IA com autonomia e sucesso
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-viverblue">
            Redirecionando para a página adequada...
          </div>
        </div>

        <div className="text-center mt-4">
          <p>
            Se você não for redirecionado automaticamente, clique{" "}
            <Link to="/login" className="text-viverblue hover:underline">
              aqui
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
