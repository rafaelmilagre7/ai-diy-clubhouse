
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/auth";

export const DashboardConnectionErrorState = () => {
  const { signOut } = useAuth();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <div className="container flex flex-col items-center justify-center py-12 text-center">
      <div className="max-w-md mx-auto">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Problema de conexão</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os dados do seu dashboard. Isso pode ser causado por um problema temporário de conexão.
          </AlertDescription>
        </Alert>
          
        <div className="flex flex-col md:flex-row gap-4 justify-center mt-4">
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Atualizar página
          </Button>
          
          <Button variant="outline" onClick={handleSignOut}>
            Sair e entrar novamente
          </Button>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <p>Sugestões de solução:</p>
          <ul className="list-disc text-left ml-6 mt-2 space-y-1">
            <li>Verifique sua conexão com a internet</li>
            <li>Limpe o cache do navegador</li>
            <li>Tente usar outro navegador</li>
            <li>Se o problema persistir, contate o suporte</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
