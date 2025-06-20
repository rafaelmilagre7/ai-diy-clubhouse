
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Invite } from "./types";

export const useInvitesList = () => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('invites')
        .select(`
          id,
          email,
          role_id,
          token,
          expires_at,
          used_at,
          created_at,
          created_by,
          last_sent_at,
          send_attempts,
          notes,
          user_roles:role_id(id, name, description)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvites((data as any) || []);
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
      setInvites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  return { invites, loading, fetchInvites };
};
