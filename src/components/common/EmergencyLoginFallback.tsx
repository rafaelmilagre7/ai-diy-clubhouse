import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Componente de fallback que sempre renderiza quando há problemas de autenticação
 */
const EmergencyLoginFallback = () => {
  const handleForceLogin = () => {
    console.log("🚨 [EMERGENCY-FALLBACK] Forçando navegação para login");
    // Limpar todo o estado e forçar navegação
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const handleForceReload = () => {
    console.log("🚨 [EMERGENCY-FALLBACK] Forçando reload da página");
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-destructive">Problema de Autenticação</CardTitle>
          <CardDescription>
            Houve um problema ao carregar a aplicação. Use as opções abaixo para resolver.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleForceLogin}
            className="w-full"
            variant="default"
          >
            Ir para Login
          </Button>
          <Button 
            onClick={handleForceReload}
            className="w-full"
            variant="outline"
          >
            Recarregar Página
          </Button>
          <div className="text-xs text-muted-foreground text-center">
            Se o problema persistir, limpe o cache do navegador.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyLoginFallback;