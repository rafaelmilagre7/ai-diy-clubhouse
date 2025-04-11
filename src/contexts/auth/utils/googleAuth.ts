
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

// Sign in with Google
export const signInWithGoogle = async (): Promise<void> => {
  try {
    // Obter a URL atual (importante para o redirecionamento funcionar)
    const redirectUrl = `${window.location.origin}`;
    console.log('Redirecionando para:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        // Adiciona algumas configs opcionais
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      throw error;
    }
    
    // Feedback positivo (opcional)
    console.log('Login iniciado com sucesso', data);
  } catch (error) {
    console.error('Error signing in:', error);
    toast({
      title: 'Erro ao fazer login',
      description: 'Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.',
      variant: 'destructive',
    });
  }
};
