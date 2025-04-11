
import { supabase } from '@/lib/supabase';
import { signInWithGoogle, signInAsTestMember, signInAsTestAdmin, signOutUser } from '../utils';

interface UseAuthMethodsProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useAuthMethods = ({ setIsLoading }: UseAuthMethodsProps) => {
  const signIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
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
