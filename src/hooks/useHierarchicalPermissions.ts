import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { getUserRoleName } from '@/lib/supabase/types';

export interface HierarchicalPermissions {
  isSuperAdmin: boolean;
  isMasterUser: boolean;
  isSubUser: boolean;
  organizationId: string | null;
  canManageTeam: boolean;
  canInviteMembers: boolean;
  canViewTeamAnalytics: boolean;
  canManageOrganization: boolean;
  canAccessAdminPanel: boolean;
}

export const useHierarchicalPermissions = () => {
  const { user, profile } = useAuth();
  const [permissions, setPermissions] = useState<HierarchicalPermissions>({
    isSuperAdmin: false,
    isMasterUser: false,
    isSubUser: false,
    organizationId: null,
    canManageTeam: false,
    canInviteMembers: false,
    canViewTeamAnalytics: false,
    canManageOrganization: false,
    canAccessAdminPanel: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    if (!user?.id || !profile) {
      setLoading(false);
      return;
    }

    try {
      const userRole = getUserRoleName(profile);
      const isSuperAdmin = userRole === 'admin';
      
      // Considerar tanto is_master_user quanto papéis membro_club e master_user como masters
      const isMasterUser = 
        (profile as any).is_master_user === true || 
        userRole === 'master_user' ||
        userRole === 'membro_club';
      
      const organizationId = (profile as any).organization_id || null;

      // Conceder permissões básicas para qualquer master user
      let masterPermissions: Partial<HierarchicalPermissions> = {};
      if (isMasterUser) {
        masterPermissions = {
          canManageTeam: true,
          canInviteMembers: true,
          canViewTeamAnalytics: true,
          canManageOrganization: false, // Requer organização válida
        };

        // Se tiver organização, verificar se é o master dela
        if (organizationId) {
          const { data: org } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', organizationId)
            .eq('master_user_id', user.id)
            .single();

          if (org) {
            masterPermissions.canManageOrganization = true;
          }
        }
      }

      setPermissions({
        isSuperAdmin,
        isMasterUser,
        isSubUser: !isSuperAdmin && !isMasterUser,
        organizationId,
        canAccessAdminPanel: isSuperAdmin,
        canManageTeam: false,
        canInviteMembers: false,
        canViewTeamAnalytics: false,
        canManageOrganization: false,
        ...masterPermissions,
      });
    } catch (error) {
      console.error('Error fetching hierarchical permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar se pode acessar rota específica
  const canAccessRoute = (route: string): boolean => {
    if (permissions.isSuperAdmin) return true;

    switch (true) {
      case route.startsWith('/admin'):
        return permissions.isSuperAdmin;
      case route.startsWith('/master-dashboard'):
        return permissions.isMasterUser;
      default:
        return true; // Rotas públicas/member
    }
  };

  // Verificar se pode executar ação específica
  const canPerformAction = (action: string): boolean => {
    if (permissions.isSuperAdmin) return true;

    switch (action) {
      case 'manage_team':
        return permissions.canManageTeam;
      case 'invite_members':
        return permissions.canInviteMembers;
      case 'view_team_analytics':
        return permissions.canViewTeamAnalytics;
      case 'manage_organization':
        return permissions.canManageOrganization;
      case 'access_admin_panel':
        return permissions.canAccessAdminPanel;
      default:
        return false;
    }
  };

  // Obter dashboard apropriado baseado no tipo de usuário
  const getDefaultDashboard = (): string => {
    if (permissions.isSuperAdmin) return '/admin';
    if (permissions.isMasterUser) return '/master-dashboard';
    return '/dashboard';
  };

  useEffect(() => {
    fetchPermissions();
  }, [user?.id, profile?.role_id, (profile as any)?.is_master_user, (profile as any)?.organization_id]);

  return {
    permissions,
    loading,
    canAccessRoute,
    canPerformAction,
    getDefaultDashboard,
    refetch: fetchPermissions,
  };
};