
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();

  // Redirecionar automaticamente para a página de autenticação após um breve delay
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/auth', { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

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
            Redirecionando para a página de login...
          </div>
        </div>

        <div className="text-center mt-4">
          <p>
            Se você não for redirecionado automaticamente, clique{" "}
            <Link to="/auth" className="text-viverblue hover:underline">
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
