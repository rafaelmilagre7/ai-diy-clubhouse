
import { supabase } from '@/lib/supabase';
import { TEST_ADMIN } from './constants';
import { toast } from '@/hooks/use-toast';
import { UserProfile } from '@/lib/supabase';

export const signInAsTestAdmin = async (): Promise<void> => {
  try {
    console.log("Tentando login como admin de teste usando:", TEST_ADMIN.email);
    
    // Clear any previous session first
    await supabase.auth.signOut();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_ADMIN.email,
      password: TEST_ADMIN.password,
    });
    
    if (error) {
      console.error("Erro ao fazer login como admin:", error);
      throw error;
    }
    
    if (data && data.user) {
      console.log("Login como admin de teste bem-sucedido:", data.user.id);
      
      // Forçar a atualização dos metadados do usuário para garantir que o papel está correto
      await supabase.auth.updateUser({
        data: { role: 'admin' }
      });
      
      // Verificar se o perfil já existe
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      // Se o perfil não existir, criar um
      if (!profileData) {
        const newProfile: Partial<UserProfile> = {
          id: data.user.id,
          email: TEST_ADMIN.email,
          name: 'Administrador Teste',
          role: 'admin',
          avatar_url: null,
          company_name: null,
          industry: null
        };
        
        await supabase.from('profiles').insert([newProfile]);
      }
      
      toast({
        title: "Login como Admin",
        description: "Você está logado como um administrador de teste.",
      });
      
      // Usar window.location para forçar um refresh completo,
      // garantindo que o estado de autenticação seja atualizado em toda a aplicação
      window.location.href = '/admin';
    }
  } catch (error) {
    console.error("Erro no login de admin de teste:", error);
    toast({
      title: "Erro no Login",
      description: "Não foi possível fazer login como administrador de teste. Tente novamente.",
      variant: "destructive",
    });
    throw error;
  }
};
