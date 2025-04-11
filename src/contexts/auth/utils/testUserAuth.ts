
import { supabase, UserProfile, UserRole } from '@/lib/supabase';
import { TEST_ADMIN, TEST_MEMBER } from '../constants';
import { toast } from '@/hooks/use-toast';

// Create test user (member or admin)
export const createTestUser = async (email: string, password: string, role: UserRole): Promise<void> => {
  try {
    // Check if the user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (!existingUser) {
      console.log("Criando novo usuário de teste:", role);
      // Create the user with admin access
      const { data: userData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: role === 'admin' ? 'Administrador Teste' : 'Membro Teste',
            role: role
          },
          // Don't require email confirmation for test users
          emailRedirectTo: window.location.origin
        }
      });

      if (signUpError) throw signUpError;
    } else {
      console.log("Usuário de teste já existe:", role);
      
      // Atualizar o perfil com o papel correto se necessário
      if (existingUser.role !== role) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: role })
          .eq('id', existingUser.id);
          
        if (updateError) {
          console.error(`Erro ao atualizar papel do usuário para ${role}:`, updateError);
        } else {
          console.log(`Papel do usuário atualizado para ${role}`);
        }
      }
    }

    // Login with the created user
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      // If email not confirmed error, we'll show a more helpful message
      if (signInError.message.includes('Email not confirmed')) {
        toast({
          title: 'Email não confirmado',
          description: 'Em um ambiente de produção, você precisaria confirmar o email. Para testes, utilize o painel do Supabase para desativar a confirmação de email.',
          variant: 'destructive',
        });
        throw new Error('Email não confirmado. Desative a confirmação de email no Supabase para testes.');
      } else {
        throw signInError;
      }
    }

    toast({
      title: `Login como ${role === 'admin' ? 'Admin' : 'Membro'}`,
      description: `Você está logado como usuário ${role} de teste.`,
    });

  } catch (error: any) {
    console.error(`Erro ao criar/logar usuário ${role}:`, error);
    toast({
      title: 'Erro no login',
      description: error?.message || `Ocorreu um erro ao fazer login como ${role} de teste.`,
      variant: 'destructive',
    });
    throw error;
  }
};

// Sign in as test member
export const signInAsTestMember = async (): Promise<void> => {
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

// Sign in as test admin
export const signInAsTestAdmin = async (): Promise<void> => {
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
      // Se o login foi bem-sucedido, verifica se o perfil tem o papel correto
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user?.id)
        .single();
        
      if (!profileError && profileData && profileData.role !== 'admin') {
        // Atualiza o papel para admin se necessário
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
