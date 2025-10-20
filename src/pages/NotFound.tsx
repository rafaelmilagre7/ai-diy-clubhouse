
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Home, LogOut, RefreshCw, MapPin } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Log melhorado do erro 404
    logger.error("404 Error: Usuário tentou acessar rota inexistente", {
      pathname: location.pathname,
      search: location.search,
      state: location.state,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }, [location]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('supabase.auth.token');
      toast.success("Redirecionando para o login...");
      setTimeout(() => {
        navigate('/login');
      }, 500);
    } catch (error) {
      logger.error("Erro ao fazer logout da página 404", error);
      // Fallback direto
      navigate('/login');
    }
  };

  const handleReload = () => {
    // Tentar navegar para a rota novamente
    navigate(0);
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-md">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-operational/20 rounded-full flex items-center justify-center mb-md">
            <MapPin className="w-8 h-8 text-operational" />
          </div>
          <CardTitle className="text-3xl font-bold mb-sm">404</CardTitle>
          <p className="text-xl text-muted-foreground">Página não encontrada</p>
        </CardHeader>
        
        <CardContent className="space-y-lg">
          <div className="text-center">
            <p className="text-muted-foreground mb-md">
              A página que você está procurando não existe ou foi movida.
            </p>
            
            <div className="bg-muted p-md rounded-lg text-sm">
              <p className="font-medium mb-sm">URL solicitada:</p>
              <code className="text-xs bg-background px-sm py-xs rounded">
                {location.pathname}{location.search}
              </code>
            </div>
          </div>

          <div className="space-y-sm">
            <div className="text-center">
              <p className="text-sm font-medium mb-sm">O que você pode fazer:</p>
            </div>
            
            <div className="flex flex-col gap-sm">
              <Button onClick={handleGoHome} className="flex items-center gap-sm w-full">
                <Home className="h-4 w-4" />
                Ir para o Dashboard
              </Button>
              
              <div className="flex gap-sm">
                <Button variant="outline" onClick={handleReload} className="flex items-center gap-sm flex-1">
                  <RefreshCw className="h-4 w-4" />
                  Tentar novamente
                </Button>
                
                <Button variant="outline" onClick={handleLogout} className="flex items-center gap-sm flex-1">
                  <LogOut className="h-4 w-4" />
                  Fazer Login
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Se o problema persistir, entre em contato com o suporte.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
