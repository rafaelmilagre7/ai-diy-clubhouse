
import React, { useState, useEffect } from 'react';
import { useUsers } from '@/hooks/admin/useUsers';
import { UsersHeader } from '@/components/admin/users/UsersHeader';
import { UsersTable } from '@/components/admin/users/UsersTable';
import { UserRoleDialog } from '@/components/admin/users/UserRoleDialog';
import { DeleteUserDialog } from '@/components/admin/users/DeleteUserDialog';
import { ResetPasswordDialog } from '@/components/admin/users/ResetPasswordDialog';
import { Card, CardContent } from '@/components/ui/card';
import { UserProfile } from '@/lib/supabase/types';

const UserManagement = () => {
  const {
    users,
    availableRoles,
    loading,
    isRefreshing,
    searchQuery,
    selectedUser,
    error,
    canManageUsers,
    canAssignRoles,
    canDeleteUsers,
    canResetPasswords,
    setSelectedUser,
    fetchUsers,
    searchUsers
  } = useUsers();

  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const mapUserToProfile = (user: any): UserProfile => ({
    id: user.id,
    email: user.email || '',
    name: user.name || '',
    avatar_url: user.avatar_url || '',
    role: user.role || '',
    role_id: user.role_id || '',
    user_roles: user.user_roles,
    company_name: user.company_name || '',
    industry: user.industry || '',
    created_at: user.created_at,
    updated_at: new Date().toISOString(),
    phone: null,
    instagram: null,
    linkedin: null,
    country: null,
    state: null,
    city: null,
    company_website: null,
    current_position: null,
    company_sector: null,
    company_size: null,
    annual_revenue: null,
    primary_goal: null,
    business_challenges: null,
    ai_knowledge_level: null,
    weekly_availability: null,
    networking_interests: null,
    nps_score: null,
    phone_country_code: '+55',
    onboarding_completed: false,
    onboarding_completed_at: null,
    is_premium: false,
    premium_expires_at: null,
    referred_by: null,
    referrals_count: 0,
    successful_referrals_count: 0,
    last_login_at: null,
    login_count: 0,
    email_verified: false,
    email_verified_at: null,
    profile_completion_percentage: 0,
    last_profile_update: null,
    preferences: null,
    timezone: null,
    language: 'pt',
    notifications_enabled: true,
    marketing_emails_enabled: true
  });

  const handleEditRole = (user: any) => {
    setSelectedUser(mapUserToProfile(user));
    setShowRoleDialog(true);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(mapUserToProfile(user));
    setShowDeleteDialog(true);
  };

  const handleResetPassword = (user: any) => {
    setSelectedUser(mapUserToProfile(user));
    setShowResetDialog(true);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <UsersHeader
          searchQuery={searchQuery}
          onSearch={searchUsers}
          onRefresh={fetchUsers}
          isRefreshing={isRefreshing}
          canManageUsers={canManageUsers}
        />
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Erro ao carregar usuários: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UsersHeader
        searchQuery={searchQuery}
        onSearch={searchUsers}
        onRefresh={fetchUsers}
        isRefreshing={isRefreshing}
        canManageUsers={canManageUsers}
      />

      <UsersTable
        users={users}
        loading={loading}
        canAssignRoles={canAssignRoles}
        canDeleteUsers={canDeleteUsers}
        canResetPasswords={canResetPasswords}
        onEditRole={handleEditRole}
        onDeleteUser={handleDeleteUser}
        onResetPassword={handleResetPassword}
      />

      <UserRoleDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        user={selectedUser}
        availableRoles={availableRoles}
        onSuccess={fetchUsers}
      />

      <DeleteUserDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        user={selectedUser}
        onSuccess={fetchUsers}
      />

      <ResetPasswordDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        user={selectedUser}
      />
    </div>
  );
};

export default UserManagement;
