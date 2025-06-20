
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
          role:role_id!inner(id, name, description)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mapear os dados para garantir que role seja um objeto
      const mappedInvites = data?.map(invite => ({
        ...invite,
        role: Array.isArray(invite.role) ? invite.role[0] : invite.role
      })) || [];

      setInvites(mappedInvites);
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
