
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const createTestUser = async () => {
  try {
    console.log('🔧 Criando usuário de teste...');
    
    const email = 'teste@viverdeia.ai';
    const password = '123456';
    const name = 'Usuário Teste';
    
    // Primeiro, verificar se o usuário já existe
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existingProfile) {
      console.log('✅ Usuário de teste já existe:', email);
      // Removido o toast para evitar notificação indesejada
      return { success: true, email, password, message: 'Usuário já existe' };
    }
    
    // Criar o usuário
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
    
  } catch (error: any) {
    console.error('❌ Erro ao criar usuário de teste:', error);
    toast.error('Erro ao criar usuário de teste', {
      description: error.message
    });
    return {
      success: false,
      error: error.message
    };
  }
};

// Expor no console para uso fácil
if (typeof window !== 'undefined') {
  (window as any).createTestUser = createTestUser;
}
