
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

// Esta função está completamente desativada
export const signInWithGoogle = async (): Promise<void> => {
  // A funcionalidade de login com Google foi removida
  toast({
    title: 'Funcionalidade indisponível',
    description: 'O login com Google não está mais disponível na plataforma.',
    variant: 'destructive',
  });
};
