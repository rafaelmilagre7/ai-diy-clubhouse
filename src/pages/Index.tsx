
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Index = () => {
  const { signInAsMember, signInAsAdmin } = useAuth();

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
            Plataforma DIY
          </h1>
          <p className="mt-2 text-center text-lg text-gray-600">
            Implemente soluções de IA com autonomia e sucesso
          </p>
        </div>

        <div className="mt-12 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <Link to="/login" className="w-full">
              <Button 
                className="w-full py-6 text-base"
                variant="default"
              >
                Login Normal
              </Button>
            </Link>
            
            <Button 
              className="w-full py-6 text-base bg-blue-600 hover:bg-blue-700"
              onClick={signInAsMember}
            >
              Login como Membro (Teste)
            </Button>
            
            <Button 
              className="w-full py-6 text-base bg-purple-600 hover:bg-purple-700"
              onClick={signInAsAdmin}
            >
              Login como Admin (Teste)
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
                className="font-medium text-blue-600 hover:text-blue-500"
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

export default Index;
