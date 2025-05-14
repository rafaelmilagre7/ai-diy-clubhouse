
import React from 'react';
import { Link } from 'react-router-dom';
import { CloudOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

interface OfflinePageProps {
  title?: string;
  message?: string;
}

const OfflinePage: React.FC<OfflinePageProps> = ({
  title = "Modo Offline",
  message = "Não foi possível conectar ao servidor. Verifique sua conexão com a internet."
}) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-4">
            <CloudOff className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground text-center mb-6">
            {message}
          </p>
          
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="font-medium text-foreground mb-2">O que pode estar acontecendo:</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>O servidor está passando por manutenção</li>
                <li>As variáveis de ambiente não estão configuradas</li>
                <li>Sua conexão com a internet está instável</li>
              </ul>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={handleRefresh} 
            className="w-full"
            variant="default"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
          
          <Link to="/login" className="w-full">
            <Button 
              variant="outline" 
              className="w-full"
            >
              Voltar para o login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OfflinePage;
