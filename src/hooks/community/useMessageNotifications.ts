
import { useState, useEffect } from 'react';

export const useMessageNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Por enquanto retornamos 0 até conectar com dados reais do Supabase
  useEffect(() => {
    setUnreadCount(0);
  }, []);

  return {
    unreadCount
  };
};
