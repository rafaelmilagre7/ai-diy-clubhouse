
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const createTestUser = async () => {
  try {
    console.log('🔧 Verificando usuário de teste...');
    
    const email = 'teste@viverdeia.ai';
    const password = '123456';
    const name = 'Usuário Teste';
    
    // Verificar se o usuário já existe na tabela profiles
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .eq('email', email)
      .maybeSingle();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar perfil existente:', profileError);
      return { success: false, error: profileError.message };
    }
    
    if (existingProfile) {
      console.log('✅ Usuário de teste já existe:', existingProfile);
      // Não mostrar toast se usuário já existe para evitar spam
      return { 
        success: true, 
        email, 
        password, 
        userId: existingProfile.id,
        message: 'Usuário já existe' 
      };
    }
    
    // Tentar criar o usuário apenas se não existir
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'member'
          }
        }
      });
      
      if (authError) {
        // Se for erro de usuário já existente, tratar como sucesso silencioso
        if (authError.message.includes('already registered')) {
          console.log('✅ Usuário de teste já registrado no auth');
          return { 
            success: true, 
            email, 
            password, 
            message: 'Usuário já registrado' 
          };
        }
        
        console.error('❌ Erro ao criar usuário:', authError);
        throw authError;
      }
      
      console.log('✅ Usuário de teste criado com sucesso!');
      toast.success('Usuário de teste criado!', {
        description: `Email: ${email} | Senha: ${password}`
      });
      
      return {
        success: true,
        email,
        password,
        userId: authData.user?.id,
        message: 'Usuário criado com sucesso'
      };
      
    } catch (authError: any) {
      console.error('❌ Erro na criação do usuário:', authError);
      return {
        success: false,
        error: authError.message
      };
    }
    
  } catch (error: any) {
    console.error('❌ Erro inesperado ao verificar/criar usuário de teste:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Expor no console apenas em desenvolvimento
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).createTestUser = createTestUser;
}
