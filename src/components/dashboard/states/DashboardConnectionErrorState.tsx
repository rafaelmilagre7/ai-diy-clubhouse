
import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

export const DashboardConnectionErrorState: FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-error/10 rounded-2xl">
              <WifiOff className="h-12 w-12 text-error" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Text variant="subsection" textColor="primary">
              Erro de conexão
            </Text>
            <Text variant="body" textColor="secondary">
              Não foi possível carregar seus dados. Verifique sua conexão e tente novamente.
            </Text>
          </div>
          
          <Alert variant="destructive">
            <AlertDescription>
              Se o problema persistir, entre em contato com o suporte.
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col gap-3">
            <Button onClick={handleRefresh} className="hover-scale">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
            
            <Button variant="outline" asChild className="hover-scale">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Voltar ao início
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
