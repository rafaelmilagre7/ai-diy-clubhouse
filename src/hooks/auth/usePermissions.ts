
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  created_at: string;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('permission_definitions')
          .select('*')
          .order('category, name');

        if (error) throw error;
        setPermissions(data || []);
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  return { permissions, loading };
};
