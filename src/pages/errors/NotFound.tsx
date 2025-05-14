
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-warning/10 rounded-full mx-auto flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-warning" />
          </div>
          <CardTitle className="text-2xl">Página não encontrada</CardTitle>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground text-center mb-6">
            A página que você está procurando não existe ou foi removida.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">Você pode tentar:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Verificar se o URL está correto</li>
              <li>Voltar para a página inicial</li>
              <li>Contatar o suporte se o problema persistir</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter>
          <Link to="/" className="w-full">
            <Button className="w-full">
              Voltar para a página inicial
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotFoundPage;
