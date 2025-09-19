import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAutomationRules = () => {
  return useQuery({
    queryKey: ['automation_rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useAutomationRule = (id?: string) => {
  return useQuery({
    queryKey: ['automation_rule', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};