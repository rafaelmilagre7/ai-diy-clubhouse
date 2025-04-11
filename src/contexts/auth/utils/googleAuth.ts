
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

// Sign in with Google
export const signInWithGoogle = async (): Promise<void> => {
  try {
    // Use current URL as redirect URL
    const redirectUrl = `${window.location.origin}`;
    console.log('Redirecionando para:', redirectUrl);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error signing in:', error);
    toast({
      title: 'Erro ao fazer login',
      description: 'Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.',
      variant: 'destructive',
    });
  }
};
