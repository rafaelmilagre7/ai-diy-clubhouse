
import { supabase, UserProfile, UserRole } from '@/lib/supabase';
import { TEST_ADMIN, TEST_MEMBER } from './types';
import { toast } from '@/hooks/use-toast';

// Fetch user profile from Supabase
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return null;
  }
};

// Create test user (member or admin)
export const createTestUser = async (email: string, password: string, role: UserRole): Promise<void> => {
  try {
    // Create the user
    const { data: userData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: role === 'admin' ? 'Administrador Teste' : 'Membro Teste',
          role: role
        }
      }
    });

    if (signUpError) throw signUpError;

    // Login immediately after creation
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) throw signInError;

    // Check if profile was automatically created (via trigger)
    // If not, create it manually
    if (userData.user) {
      setTimeout(async () => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.user!.id)
          .single();

        if (!profileData) {
          // Create profile manually if needed
          await supabase.from('profiles').insert({
            id: userData.user!.id,
            email: email,
            name: role === 'admin' ? 'Administrador Teste' : 'Membro Teste',
            role: role
          });
        }
      }, 1000);
    }

    toast({
      title: `Usuário ${role} criado`,
      description: `Usuário de teste ${role} criado e logado com sucesso.`,
    });

  } catch (error: any) {
    console.error(`Erro ao criar usuário ${role}:`, error);
    toast({
      title: 'Erro ao criar usuário',
      description: error?.message || `Não foi possível criar o usuário de teste ${role}.`,
      variant: 'destructive',
    });
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<void> => {
  try {
    // Use current URL as redirect URL
    const redirectUrl = `${window.location.origin}`;
    console.log('Redirecionando para:', redirectUrl);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error signing in:', error);
    toast({
      title: 'Erro ao fazer login',
      description: 'Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.',
      variant: 'destructive',
    });
  }
};

// Sign in as test member
export const signInAsTestMember = async (): Promise<void> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_MEMBER.email,
      password: TEST_MEMBER.password
    });
    
    if (error) {
      // If user doesn't exist, create an account
      if (error.message.includes('Invalid login credentials')) {
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_ADMIN.email,
      password: TEST_ADMIN.password
    });
    
    if (error) {
      // If user doesn't exist, create an account
      if (error.message.includes('Invalid login credentials')) {
        await createTestUser(TEST_ADMIN.email, TEST_ADMIN.password, 'admin');
      } else {
        throw error;
      }
    } else {
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

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
    });
  } catch (error) {
    console.error('Error signing out:', error);
    toast({
      title: 'Erro ao fazer logout',
      description: 'Ocorreu um erro ao tentar fazer logout. Por favor, tente novamente.',
      variant: 'destructive',
    });
  }
};
