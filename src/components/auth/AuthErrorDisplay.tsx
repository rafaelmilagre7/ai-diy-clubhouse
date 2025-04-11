
import React from "react";
import { Button } from "@/components/ui/button";

interface AuthErrorDisplayProps {
  error: Error | string; // Atualizado para aceitar tanto Error quanto string
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
}

/**
 * Component to display authentication errors with retry functionality
 */
const AuthErrorDisplay: React.FC<AuthErrorDisplayProps> = ({
  error,
  retryCount,
  maxRetries,
  onRetry
}) => {
  // Extrair a mensagem de erro independentemente do tipo
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-destructive/10 border border-destructive p-6 rounded-lg max-w-md">
        <h2 className="text-xl font-bold text-destructive mb-2">Erro de Autenticação</h2>
        <p className="mb-4">{errorMessage}</p>
        <p className="mb-4">Houve um problema ao carregar seu perfil. Por favor, tente fazer login novamente.</p>
        <Button 
          variant="default"
          onClick={() => {
            localStorage.removeItem('supabase.auth.token');
            window.location.href = '/login';
          }}
        >
          Voltar para login
        </Button>
        
        {retryCount < maxRetries && (
          <Button 
            variant="outline"
            className="ml-2"
            onClick={onRetry}
          >
            Tentar novamente ({maxRetries - retryCount} tentativas restantes)
          </Button>
        )}
      </div>
    </div>
  );
};

export default AuthErrorDisplay;
