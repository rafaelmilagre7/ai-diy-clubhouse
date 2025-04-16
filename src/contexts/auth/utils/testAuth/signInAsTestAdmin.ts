
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { createTestUser } from './createTestUser';

// Test admin credentials
const TEST_ADMIN = {
  email: "admin@viverdeia.ai",
  password: "admin-teste-2024"
};

/**
 * Sign in as test admin
 * If the test admin doesn't exist, it will be created
 */
export const signInAsTestAdmin = async (): Promise<void> => {
  console.log("Tentando login como admin de teste");
  try {
    // Try to sign in directly first
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_ADMIN.email,
      password: TEST_ADMIN.password
    });
    
    if (error) {
      // If user doesn't exist or other error, try to create account
      if (error.message.includes('Invalid login credentials') || 
          error.message.includes('Email not confirmed')) {
        await createTestUser(TEST_ADMIN.email, TEST_ADMIN.password, 'admin');
      } else {
        throw error;
      }
    } else {
      console.log("Login bem-sucedido como admin");
      
      // Verify profile has correct role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user?.id)
        .single();
        
      if (!profileError && profileData && profileData.role !== 'admin') {
        console.log("Corrigindo papel para admin, estava como:", profileData.role);
        
        // Update role to admin if needed
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', data.user?.id);
          
        if (updateError) {
          console.error('Erro ao atualizar papel para admin:', updateError);
        } else {
          console.log('Papel atualizado para admin com sucesso');
        }
      }
      
      // Update user metadata as well
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: { role: 'admin' }
      });
      
      if (updateUserError) {
        console.error("Erro ao atualizar metadata do usuário:", updateUserError);
      }
      
      toast({
        title: 'Login como Admin',
        description: 'Você está logado como usuário administrador de teste.',
      });
    }
  } catch (error: any) {
    console.error('Erro ao fazer login como admin:', error);
    toast({
      title: 'Erro no login',
      description: error?.message || 'Erro ao fazer login como administrador de teste.',
      variant: 'destructive',
    });
    throw error;
  }
};
