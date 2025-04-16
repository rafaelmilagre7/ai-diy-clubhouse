
import { supabase, UserProfile, UserRole } from '@/lib/supabase';
import { TEST_ADMIN, TEST_MEMBER } from '../constants';
import { toast } from '@/hooks/use-toast';

// Create test user (member or admin)
export const createTestUser = async (email: string, password: string, role: UserRole): Promise<void> => {
  try {
    console.log(`Criando/verificando usuário de teste: ${email} com papel ${role}`);

    // Check if the user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    let userId: string | undefined = existingUser?.id;
    
    if (!existingUser) {
      console.log(`Criando novo usuário de teste: ${email} (${role})`);
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
      
      userId = userData.user?.id;
      
      console.log(`Usuário criado com ID: ${userId}`);
    } else {
      console.log(`Usuário de teste já existe: ${email} (${existingUser.role})`);
      
      // Atualizar o perfil com o papel correto se necessário
      if (existingUser.role !== role) {
        console.log(`Atualizando papel do usuário de ${existingUser.role} para ${role}`);
        
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

    // Garantir que temos role metadata correta
    if (userId) {
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: { role: role }
      });
      
      if (updateUserError) {
        console.error("Erro ao atualizar metadata do usuário:", updateUserError);
      } else {
        console.log(`Metadata do usuário atualizada com papel: ${role}`);
      }
    }

    // Login with the created user
    console.log(`Fazendo login com ${email} (${role})`);
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
      
      // Garante que o perfil tem o papel 'member'
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user?.id)
        .single();
        
      if (!profileError && profileData && profileData.role !== 'member') {
        console.log("Corrigindo papel para member, estava como:", profileData.role);
        
        // Atualiza o papel para member se necessário
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
      
      // Atualiza os metadados do usuário também
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

// Sign in as test admin
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
      
      // Se o login foi bem-sucedido, verifica se o perfil tem o papel correto
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user?.id)
        .single();
        
      if (!profileError && profileData && profileData.role !== 'admin') {
        console.log("Corrigindo papel para admin, estava como:", profileData.role);
        
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
      
      // Atualiza os metadados do usuário também
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
