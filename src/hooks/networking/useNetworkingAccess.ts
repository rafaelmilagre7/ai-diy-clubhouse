
import { useFeatureAccess } from '@/hooks/auth/useFeatureAccess';

export function useNetworkingAccess() {
  return useFeatureAccess('networking');
}
