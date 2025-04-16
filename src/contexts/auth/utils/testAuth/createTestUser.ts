
import { supabase, UserRole } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

/**
 * Creates a test user with the specified email, password, and role
 * If the user already exists, updates their role if needed
 */
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

    // Ensure we have correct role metadata
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
