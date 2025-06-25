
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { getUserRoleName } from '@/lib/supabase/types';

export const useIntelligentRedirect = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const redirect = useCallback((fallback = '/dashboard') => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!profile) {
      navigate('/onboarding');
      return;
    }

    const userRole = getUserRoleName(profile);
    
    switch (userRole) {
      case 'formacao':
        navigate('/formacao');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate(fallback);
        break;
    }
  }, [navigate, user, profile]);

  return { redirect };
};
