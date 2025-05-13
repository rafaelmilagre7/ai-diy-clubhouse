
import { useState, useEffect } from "react";
import { useUsers } from "@/hooks/admin/useUsers";
import { UsersHeader } from "@/components/admin/users/UsersHeader";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { UserRoleManager } from "@/components/admin/users/UserRoleManager";
import { UserProfile } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ShieldAlert, RefreshCw } from "lucide-react";
import { DeleteUserDialog } from "@/components/admin/users/DeleteUserDialog";
import { ResetPasswordDialog } from "@/components/admin/users/ResetPasswordDialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";

const AdminUsers = () => {
  // Usando o hook useUsers com as otimizações implementadas
  const {
    users,
    availableRoles,
    loading,
    isRefreshing,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    fetchUsers,
    canManageUsers,
    canAssignRoles,
    canDeleteUsers,
    canResetPasswords,
    error,
  } = useUsers();

  const { isAdmin } = useAuth();
  const [roleManagerOpen, setRoleManagerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [showAdminWarning, setShowAdminWarning] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Efeito para detectar problemas de permissão e avisar sobre uso de fallback
  useEffect(() => {
    // Verificar se há problemas com permissões mas o usuário é admin por email
    if (isAdmin && !canManageUsers && !canAssignRoles) {
      setShowAdminWarning(true);
    } else {
      setShowAdminWarning(false);
    }
  }, [isAdmin, canManageUsers, canAssignRoles]);

  // Efeito para timeout de carregamento
  useEffect(() => {
    let timeoutId: number | null = null;
    
    if (loading && !loadingTimeout) {
      timeoutId = window.setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000); // 10 segundos de timeout
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loading, loadingTimeout]);

  const handleEditRole = (user: UserProfile) => {
    setSelectedUser(user);
    setRoleManagerOpen(true);
  };

  const handleDeleteUser = (user: UserProfile) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleResetPassword = (user: UserProfile) => {
    setSelectedUser(user);
    setResetPasswordDialogOpen(true);
  };

  const handleRefresh = () => {
    // Limitar a 3 tentativas manuais para evitar sobrecarga
    if (loadAttempts < 3 && !isRefreshing) {
      setLoadAttempts(prev => prev + 1);
      toast.info("Atualizando lista de usuários...");
      fetchUsers();
    } else if (isRefreshing) {
      toast.info("Atualização em andamento, aguarde...");
    } else {
      toast.warning("Limite de tentativas atingido", {
        description: "Por favor, atualize a página ou tente mais tarde."
      });
    }
  };

  const handleForceRefresh = () => {
    // Forçar atualização mesmo além do limite
    toast.info("Forçando atualização da lista...");
    window.location.reload();
  };

  // Verificação simplificada de acesso administrativo usando o contexto
  if (!isAdmin && !canManageUsers) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acesso restrito</AlertTitle>
        <AlertDescription>
          Você não tem permissão para visualizar a lista de usuários.
        </AlertDescription>
      </Alert>
    );
  }

  // Se o carregamento demorar demais, mostrar feedback mais informativo
  if (loading && !users.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-viverblue border-t-transparent rounded-full"></div>
        <div>Carregando usuários...</div>
        <div className="text-sm text-muted-foreground">
          {loadingTimeout ? "O carregamento está demorando mais que o esperado." : "Isso pode levar alguns instantes."}
        </div>
        
        {loadingTimeout && (
          <Button 
            onClick={handleForceRefresh}
            variant="outline"
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Forçar atualização
          </Button>
        )}
      </div>
    );
  }

  // Exibir mensagem de erro quando aplicável
  if (error && !users.length) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar usuários</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>Ocorreu um problema ao carregar a lista de usuários:</p>
          <p className="font-mono text-sm bg-destructive/10 p-2 rounded">{error.message}</p>
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="px-4 py-2"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="animate-spin mr-2 h-4 w-4" /> Atualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleForceRefresh}
              variant="default"
            >
              Recarregar página
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {showAdminWarning && (
        <div className="flex items-center gap-2 py-2 px-4 bg-amber-50 border border-amber-200 rounded-md mb-4">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
          <p className="text-sm text-amber-700">
            Houve um problema ao verificar permissões específicas, mas o acesso foi concedido devido ao seu papel de administrador.
          </p>
        </div>
      )}
      
      <UsersHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      
      <div className="border rounded-lg">
        <UsersTable
          users={users}
          loading={loading}
          canEditRoles={canAssignRoles || isAdmin}
          canDeleteUsers={canDeleteUsers || isAdmin}
          canResetPasswords={canResetPasswords || isAdmin}
          onEditRole={handleEditRole}
          onDeleteUser={handleDeleteUser}
          onResetPassword={handleResetPassword}
          onRefresh={handleRefresh}
        />
      </div>
      
      {/* Componentes de diálogo remanescentes */}
      {(canAssignRoles || isAdmin) && (
        <UserRoleManager
          open={roleManagerOpen}
          onOpenChange={setRoleManagerOpen}
          user={selectedUser}
          availableRoles={availableRoles}
          onSuccess={() => {
            // Atualizar lista após alterar papel
            setTimeout(() => fetchUsers(), 500);
          }}
        />
      )}
      
      {(canDeleteUsers || isAdmin) && (
        <DeleteUserDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          user={selectedUser}
          onSuccess={fetchUsers}
        />
      )}
      
      {(canResetPasswords || isAdmin) && (
        <ResetPasswordDialog
          open={resetPasswordDialogOpen}
          onOpenChange={setResetPasswordDialogOpen}
          user={selectedUser}
        />
      )}
    </div>
  );
};

export default AdminUsers;
