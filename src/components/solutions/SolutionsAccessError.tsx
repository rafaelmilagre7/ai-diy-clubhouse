import React from 'react';
import { AccessBlocked } from '@/components/ui/access-blocked';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, Mail, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SolutionsAccessErrorProps {
  error?: string;
}

export const SolutionsAccessError: React.FC<SolutionsAccessErrorProps> = ({ error }) => {
  if (error?.includes('permissão')) {
    return <AccessBlocked feature="solutions" />;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <div className="max-w-lg w-full space-y-6">
        <Alert className="border-destructive/40 bg-destructive/5">
          <ShieldCheck className="h-5 w-5 text-destructive" />
          <AlertTitle className="text-destructive">Erro de Acesso</AlertTitle>
          <AlertDescription className="text-destructive/90">
            {error || 'Ocorreu um erro ao verificar suas permissões de acesso às soluções.'}
          </AlertDescription>
        </Alert>

        <div className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-lg p-6 space-y-4">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-medium">Precisa de Ajuda?</h3>
            <p className="text-sm text-muted-foreground">
              Entre em contato com nossa equipe para resolver questões de acesso.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open('mailto:contato@viverdeia.ai?subject=Problema de Acesso às Soluções', '_blank')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contatar Suporte
            </Button>
            
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => window.history.back()}
            >
              Voltar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};