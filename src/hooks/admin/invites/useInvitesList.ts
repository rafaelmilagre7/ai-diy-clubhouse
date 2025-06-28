
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Invite } from "./types";

export const useInvitesList = () => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true);

      // Query only existing columns from invites table
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
          user_roles:role_id(id, name, description)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map the data to ensure compatibility with Invite type
      const mappedInvites: Invite[] = (data || []).map(invite => ({
        id: invite.id,
        email: invite.email,
        role_id: invite.role_id,
        token: invite.token,
        expires_at: invite.expires_at,
        used_at: invite.used_at,
        created_at: invite.created_at,
        created_by: invite.created_by,
        whatsapp_number: null, // Not available in current schema
        notes: null, // Not available in current schema
        last_sent_at: null, // Not available in current schema
        send_attempts: 0, // Not available in current schema
        role: invite.user_roles || { id: invite.role_id, name: 'Unknown', description: '' },
        user_roles: invite.user_roles || { id: invite.role_id, name: 'Unknown', description: '' }
      }));

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
