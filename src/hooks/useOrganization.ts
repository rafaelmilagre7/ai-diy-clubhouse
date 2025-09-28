import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export interface Organization {
  id: string;
  name: string;
  master_user_id: string;
  plan_type: string;
  max_users: number;
  settings: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role_id: string;
  is_master_user: boolean;
  created_at: string;
  user_roles?: {
    name: string;
    description?: string;
  } | null;
}

export const useOrganization = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar organização do usuário atual
  const fetchOrganization = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('master_user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setOrganization(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Buscar membros da equipe
  const fetchTeamMembers = async () => {
    if (!organization?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          avatar_url,
          role_id,
          is_master_user,
          created_at,
          user_roles!role_id (
            name,
            description
          )
        `)
        .eq('organization_id', organization.id)
        .order('is_master_user', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar os dados para garantir que user_roles seja um objeto único
      const transformedData = (data || []).map(member => ({
        ...member,
        user_roles: Array.isArray(member.user_roles) 
          ? member.user_roles[0] || null 
          : member.user_roles
      })) as TeamMember[];

      setTeamMembers(transformedData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Criar organização
  const createOrganization = async (name: string, planType: string = 'basic') => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name,
          master_user_id: user.id,
          plan_type: planType,
          max_users: planType === 'basic' ? 5 : planType === 'premium' ? 20 : 50
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar perfil do usuário para master
      await supabase
        .from('profiles')
        .update({
          organization_id: data.id,
          is_master_user: true,
          role_id: (await supabase
            .from('user_roles')
            .select('id')
            .eq('name', 'master_user')
            .single()).data?.id
        })
        .eq('id', user.id);

      setOrganization(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  // Atualizar organização
  const updateOrganization = async (updates: Partial<Organization>) => {
    if (!organization?.id) return;

    try {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organization.id)
        .select()
        .single();

      if (error) throw error;

      setOrganization(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Remover membro da equipe
  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          organization_id: null,
          is_master_user: false
        })
        .eq('id', memberId);

      if (error) throw error;

      await fetchTeamMembers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Verificar se o usuário é master
  const isMasterUser = () => {
    return organization?.master_user_id === user?.id;
  };

  // Verificar limites do plano
  const canAddMoreMembers = () => {
    if (!organization) return false;
    return teamMembers.length < organization.max_users;
  };

  useEffect(() => {
    fetchOrganization();
  }, [user?.id]);

  useEffect(() => {
    if (organization) {
      fetchTeamMembers();
    }
    setLoading(false);
  }, [organization]);

  return {
    organization,
    teamMembers,
    loading,
    error,
    createOrganization,
    updateOrganization,
    removeMember,
    fetchTeamMembers,
    fetchOrganization,
    isMasterUser,
    canAddMoreMembers
  };
};