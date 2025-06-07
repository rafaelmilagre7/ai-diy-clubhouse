
import { toast } from '@/hooks/use-toast';

// Funcionalidade de login com Google removida para produção
export const signInWithGoogle = async (): Promise<void> => {
  toast({
    title: 'Funcionalidade indisponível',
    description: 'Por favor, utilize o login com email e senha.',
    variant: 'destructive',
  });
};
