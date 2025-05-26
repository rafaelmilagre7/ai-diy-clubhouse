import { useState, useEffect } from "react";
import { useUsers } from "@/hooks/admin/useUsers";
import { UsersHeader } from "@/components/admin/users/UsersHeader";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { UserRoleManager } from "@/components/admin/users/UserRoleManager";
import { UserProfile } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, ShieldCheck } from "lucide-react";
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
    error
  } = useUsers();
  const {
    isAdmin
  } = useAuth();
  const [roleManagerOpen, setRoleManagerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [showAdminInfo, setShowAdminInfo] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Efeito para detectar quando o admin foi determinado pelo email
  useEffect(() => {
    if (isAdmin) {
      setShowAdminInfo(true);

      // Esconder após 5 segundos
      const timer = setTimeout(() => {
        setShowAdminInfo(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isAdmin]);

  // Efeito para timeout de carregamento
  useEffect(() => {
    let timeoutId: number | null = null;
    if (loading && !loadingTimeout) {
      timeoutId = window.setTimeout(() => {
        setLoadingTimeout(true);
      }, 5000); // 5 segundos de timeout
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
    toast.info("Atualizando lista de usuários...");
    fetchUsers();
  };
  const handleForceRefresh = () => {
    toast.info("Recarregando a página por completo...");
    window.location.reload();
  };

  // Verificação simplificada de acesso administrativo usando o contexto
  if (!isAdmin) {
    return <Alert variant="destructive" className="my-4 border-destructive/40">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-semibold">Acesso restrito</AlertTitle>
        <AlertDescription className="text-destructive-foreground/90">
          Você não tem permissão para visualizar a lista de usuários.
        </AlertDescription>
      </Alert>;
  }

  // Se o carregamento demorar demais, mostrar feedback mais informativo
  if (loading && !users.length) {
    return <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-viverblue border-t-transparent rounded-full"></div>
        <div className="text-foreground font-medium">Carregando usuários...</div>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          {loadingTimeout ? "O carregamento está demorando mais que o esperado." : "Isso pode levar alguns instantes."}
        </div>
        
        {loadingTimeout && <Button onClick={handleForceRefresh} variant="outline" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" /> Forçar atualização
          </Button>}
      </div>;
  }

  // Exibir mensagem de erro quando aplicável
  if (error && !users.length) {
    return <Alert variant="destructive" className="my-4 border-destructive/40">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-semibold">Erro ao carregar usuários</AlertTitle>
        <AlertDescription className="space-y-2 text-destructive-foreground/90">
          <p>Ocorreu um problema ao carregar a lista de usuários:</p>
          <p className="font-mono text-sm bg-destructive/10 p-2 rounded text-destructive-foreground/90">{error.message}</p>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleRefresh} variant="outline" className="px-4 py-2" disabled={isRefreshing}>
              {isRefreshing ? <>
                  <RefreshCw className="animate-spin mr-2 h-4 w-4" /> Atualizando...
                </> : <>
                  <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
                </>}
            </Button>
            
            <Button onClick={handleForceRefresh} variant="default">
              Recarregar página
            </Button>
          </div>
        </AlertDescription>
      </Alert>;
  }
  return <div className="space-y-6">
      {/* Banner informativo quando o admin foi verificado por email */}
      {showAdminInfo && <div className="flex items-center gap-2 py-2 px-4 border border-blue-200 rounded-md mb-4 animate-fade-in bg-gray-800">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          <p className="text-sm text-blue-700">
            Acesso de administrador concedido. Você tem acesso completo ao gerenciamento de usuários.
          </p>
        </div>}
      
      <UsersHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} onRefresh={handleRefresh} isRefreshing={isRefreshing} />
      
      <div className="border rounded-lg">
        <UsersTable users={users} loading={loading} canEditRoles={canAssignRoles} canDeleteUsers={canDeleteUsers} canResetPasswords={canResetPasswords} onEditRole={handleEditRole} onDeleteUser={handleDeleteUser} onResetPassword={handleResetPassword} onRefresh={handleRefresh} />
      </div>
      
      {/* Mostrar informação sobre quantidade de usuários carregados */}
      {users.length > 0 && !isRefreshing && <div className="text-sm text-neutral-600 dark:text-muted-foreground text-right">
          {users.length} usuários carregados
        </div>}
      
      {/* Componentes de diálogo */}
      {canAssignRoles && <UserRoleManager open={roleManagerOpen} onOpenChange={setRoleManagerOpen} user={selectedUser} availableRoles={availableRoles} onSuccess={() => {
      // Atualizar lista após alterar papel
      setTimeout(() => fetchUsers(), 500);
    }} />}
      
      {canDeleteUsers && <DeleteUserDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} user={selectedUser} onSuccess={fetchUsers} />}
      
      {canResetPasswords && <ResetPasswordDialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen} user={selectedUser} />}
    </div>;
};
export default AdminUsers;