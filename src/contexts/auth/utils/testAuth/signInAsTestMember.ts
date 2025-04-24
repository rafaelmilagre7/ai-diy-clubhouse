
import { supabase } from '@/lib/supabase';
import { TEST_MEMBER } from './constants';
import { toast } from '@/hooks/use-toast';
import { UserProfile } from '@/lib/supabase';

export const signInAsTestMember = async (): Promise<void> => {
  try {
    console.log("Tentando login como membro de teste usando:", TEST_MEMBER.email);
    
    // Clear any previous session first
    await supabase.auth.signOut();
    
    // Pequena pausa para garantir que o logout foi concluído
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_MEMBER.email,
      password: TEST_MEMBER.password,
    });
    
    if (error) {
      console.error("Erro ao fazer login como membro:", error);
      throw error;
    }
    
    if (data && data.user) {
      console.log("Login como membro de teste bem-sucedido:", data.user.id);
      
      // Forçar a atualização dos metadados do usuário para garantir que o papel está correto
      await supabase.auth.updateUser({
        data: { role: 'member' }
      });
      
      // Verificar se o perfil já existe
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      // Se o perfil não existir, criar um
      if (!profileData) {
        // Criando um objeto com as propriedades obrigatórias
        const newProfile = {
          id: data.user.id,
          email: TEST_MEMBER.email,
          name: 'Membro Teste',
          role: 'member',
          avatar_url: null,
          company_name: null,
          industry: null
        };
        
        await supabase.from('profiles').insert(newProfile);
      }
      
      toast({
        title: "Login como Membro",
        description: "Você está logado como um membro de teste.",
      });
      
      // Resetar a aplicação e forçar redirecionamento para o dashboard
      console.log("Redirecionando para o dashboard do membro");
      localStorage.setItem('forceNavigateToDashboard', 'true');
      
      // Usar rotas diretas para melhor compatibilidade
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error("Erro no login de membro de teste:", error);
    toast({
      title: "Erro no Login",
      description: "Não foi possível fazer login como membro de teste. Tente novamente.",
      variant: "destructive",
    });
    throw error;
  }
};
