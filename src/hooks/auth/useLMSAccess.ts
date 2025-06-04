
import { useFeatureAccess } from '@/hooks/auth/useFeatureAccess';

export const useLMSAccess = () => {
  const { hasAccess, accessMessage } = useFeatureAccess('lmsManagement');
  
  return {
    hasLMSAccess: hasAccess,
    lmsAccessMessage: accessMessage
  };
};
