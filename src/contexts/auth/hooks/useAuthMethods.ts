
import { supabase } from '@/lib/supabase';
import { signInWithGoogle, signInAsTestMember, signInAsTestAdmin, signOutUser } from '../utils';

interface UseAuthMethodsProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useAuthMethods = ({ setIsLoading }: UseAuthMethodsProps) => {
  const signIn = async (email?: string, password?: string) => {
    setIsLoading(true);
    try {
      if (email && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return { data, error };
      } else {
        await signInWithGoogle();
        return { data: null, error: null };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsMember = async () => {
    setIsLoading(true);
    try {
      await signInAsTestMember();
    } catch (error) {
      console.error('Member login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsAdmin = async () => {
    setIsLoading(true);
    try {
      await signInAsTestAdmin();
    } catch (error) {
      console.error('Admin login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    signIn,
    signOut,
    signInAsMember,
    signInAsAdmin
  };
};
