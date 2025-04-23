
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

// Sign in with Google
export const signInWithGoogle = async (): Promise<void> => {
  try {
    // Obter a URL do dashboard para redirecionamento seguro
    const redirectUrl = `${window.location.origin}/dashboard`;
    console.log('Google Auth - Redirecionando para:', redirectUrl);
    
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
      console.error('Erro na autenticação Google:', error);
      throw error;
    }
    
    // Feedback positivo (opcional)
    console.log('Login com Google iniciado com sucesso', data);
    
    // Se chegou aqui sem redirecionamento, algo está errado
    setTimeout(() => {
      toast({
        title: 'Problemas no redirecionamento',
        description: 'Verifique se as URLs de redirecionamento estão configuradas corretamente no Supabase.',
        variant: 'destructive',
      });
    }, 3000);
  } catch (error) {
    console.error('Error signing in with Google:', error);
    toast({
      title: 'Erro ao fazer login com Google',
      description: 'Ocorreu um erro ao tentar fazer login. Por favor, verifique as configurações do Supabase.',
      variant: 'destructive',
    });
  }
};
