
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

export const useAdminPreview = () => {
  const [searchParams] = useSearchParams();
  const { isAdmin } = useAuth();
  
  const isAdminPreviewMode = useMemo(() => {
    const adminViewParam = searchParams.get('admin-view');
    return adminViewParam === 'true' && isAdmin;
  }, [searchParams, isAdmin]);
  
  return {
    isAdminPreviewMode,
    isValidAdminAccess: isAdmin
  };
};
