
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img
            className="mx-auto h-20 w-auto"
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Plataforma DIY
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Implemente soluções de IA com autonomia e sucesso
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <Button 
              onClick={signIn} 
              className="group relative w-full flex justify-center py-6 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-viverblue shadow"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <FcGoogle className="h-5 w-5" />
              </span>
              Entrar com Google
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500 mt-8">
            <p>
              Acesso exclusivo para membros do VIVER DE IA Club.
            </p>
            <p className="mt-2">
              Não é membro ainda?{" "}
              <a
                href="https://viverdeiaclub.com.br"
                className="font-medium text-viverblue hover:text-viverblue-dark"
                target="_blank"
                rel="noopener noreferrer"
              >
                Conheça o Club
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
