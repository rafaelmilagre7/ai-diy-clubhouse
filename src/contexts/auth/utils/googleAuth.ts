
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

// Sign in with Google - esta função está desativada
export const signInWithGoogle = async (): Promise<void> => {
  // A funcionalidade de login com Google foi desativada
  toast({
    title: 'Funcionalidade desativada',
    description: 'O login com Google não está mais disponível.',
    variant: 'destructive',
  });
};
