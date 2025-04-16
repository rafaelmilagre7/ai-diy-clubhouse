
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { createTestUser } from './createTestUser';

// Test member credentials
const TEST_MEMBER = {
  email: "membro@viverdeia.ai",
  password: "membro-teste-2024"
};

/**
 * Sign in as test member
 * If the test member doesn't exist, it will be created
 */
export const signInAsTestMember = async (): Promise<void> => {
  console.log("Tentando login como membro de teste");
  try {
    // Try to sign in directly first
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_MEMBER.email,
      password: TEST_MEMBER.password
    });
    
    if (error) {
      // If user doesn't exist or other error, try to create account
      if (error.message.includes('Invalid login credentials') || 
          error.message.includes('Email not confirmed')) {
        await createTestUser(TEST_MEMBER.email, TEST_MEMBER.password, 'member');
      } else {
        throw error;
      }
    } else {
      console.log("Login bem-sucedido como membro");
      
      // Ensure profile has 'member' role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user?.id)
        .single();
        
      if (!profileError && profileData && profileData.role !== 'member') {
        console.log("Corrigindo papel para member, estava como:", profileData.role);
        
        // Update role to member if needed
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'member' })
          .eq('id', data.user?.id);
          
        if (updateError) {
          console.error('Erro ao atualizar papel para member:', updateError);
        } else {
          console.log('Papel atualizado para member com sucesso');
        }
      }
      
      // Update user metadata as well
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: { role: 'member' }
      });
      
      if (updateUserError) {
        console.error("Erro ao atualizar metadata do usuário:", updateUserError);
      }
      
      toast({
        title: 'Login como Membro',
        description: 'Você está logado como usuário membro de teste.',
      });
    }
  } catch (error: any) {
    console.error('Erro ao fazer login como membro:', error);
    toast({
      title: 'Erro no login',
      description: error?.message || 'Erro ao fazer login como membro de teste.',
      variant: 'destructive',
    });
    throw error;
  }
};
