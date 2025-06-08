
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { AlertCircle, RefreshCw } from "lucide-react";

export const DashboardConnectionErrorState = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Container className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-error" />
        </div>
        
        <div className="space-y-2">
          <Text variant="section" textColor="primary">
            Erro de Conexão
          </Text>
          <Text variant="body" textColor="secondary">
            Não foi possível conectar com o servidor. Verifique sua conexão e tente novamente.
          </Text>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Problema de autenticação</AlertTitle>
          <AlertDescription>
            Sua sessão pode ter expirado. Tente fazer login novamente.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
          <Button asChild>
            <a href="/auth">Fazer Login</a>
          </Button>
        </div>
      </div>
    </Container>
  );
};
