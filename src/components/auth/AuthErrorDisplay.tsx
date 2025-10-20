
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
    <div className="min-h-screen flex flex-col items-center justify-center p-md">
      <div className="bg-destructive/10 border border-destructive p-lg rounded-lg max-w-md">
        <h2 className="text-xl font-bold text-destructive mb-sm">Erro de Autenticação</h2>
        <p className="mb-md">{errorMessage}</p>
        <p className="mb-md">Houve um problema ao carregar seu perfil. Por favor, tente fazer login novamente.</p>
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
