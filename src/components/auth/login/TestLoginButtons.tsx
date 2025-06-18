
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

/**
 * Componente de desenvolvimento para facilitar testes de login
 * Removido em produção para segurança
 */
export const TestLoginButtons = () => {
  const { signInWithEmail } = useAuth();

  // Não renderizar em produção
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const handleTestLogin = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
      toast.success(`Login realizado como ${email}`);
    } catch (error) {
      console.error('Erro no login de teste:', error);
      toast.error('Erro ao fazer login de teste');
    }
  };

  return (
    <div className="mt-6 p-4 border border-amber-300 bg-amber-50 rounded-lg">
      <h3 className="text-sm font-medium text-amber-800 mb-3">
        🔧 Ambiente de Desenvolvimento - Login Rápido
      </h3>
      <div className="space-y-2">
        <Button
          onClick={() => handleTestLogin('admin@viverdeia.com.br', 'admin123')}
          variant="outline"
          size="sm"
          className="w-full text-xs"
        >
          Login como Admin
        </Button>
        <Button
          onClick={() => handleTestLogin('user@viverdeia.com.br', 'user123')}
          variant="outline"
          size="sm"
          className="w-full text-xs"
        >
          Login como Usuário
        </Button>
      </div>
      <p className="text-xs text-amber-600 mt-2">
        ⚠️ Apenas disponível em desenvolvimento
      </p>
    </div>
  );
};
