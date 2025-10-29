import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AuroraCard } from "@/components/ui/AuroraCard";
import { CardContent, CardHeader } from "@/components/ui/card";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { 
  MoreHorizontal, 
  UserCog, 
  Key, 
  RotateCcw, 
  Trash2, 
  UserX,
  UserCheck,
  BookOpen,
  Calendar,
  Mail,
  CheckCircle
} from "lucide-react";
import { UserProfile, getUserRoleName } from "@/lib/supabase";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { UserResetDialog } from "./UserResetDialog";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { ToggleUserStatusDialog } from "./ToggleUserStatusDialog";
import { motion } from "framer-motion";

interface UsersTableProps {
  users: UserProfile[];
  loading: boolean;
  onEditRole: (user: UserProfile) => void;
  onDeleteUser: (user: UserProfile) => void;
  onResetPassword: (user: UserProfile) => void;
  onResetUser: (user: UserProfile) => void;
  onToggleStatus: (user: UserProfile) => void;
  onManageCourses: (user: UserProfile) => void;
  onRefresh: () => void;
  canEditRoles: boolean;
  canDeleteUsers: boolean;
  canResetPasswords: boolean;
  canResetUsers: boolean;
  canToggleStatus: boolean;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading,
  onEditRole,
  onDeleteUser,
  onResetPassword,
  onResetUser,
  onToggleStatus,
  onManageCourses,
  onRefresh,
  canEditRoles,
  canDeleteUsers,
  canResetPasswords,
  canResetUsers,
  canToggleStatus
}) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  const handleResetUser = (user: UserProfile) => {
    setSelectedUser(user);
    setResetDialogOpen(true);
  };

  const handleToggleStatus = (user: UserProfile) => {
    setSelectedUser(user);
    setToggleStatusDialogOpen(true);
  };

  const handleDeleteUser = (user: UserProfile) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleResetSuccess = () => {
    onRefresh();
  };

  const handleDeleteSuccess = () => {
    onRefresh();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <AdminCard key={i} loading={true}>
            <div className="h-32" />
          </AdminCard>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <AuroraCard variant="glass" className="p-12 text-center">
        <div className="p-4 rounded-xl bg-aurora-primary/10 border border-aurora-primary/20 inline-block mb-4">
          <UserCog className="h-8 w-8 text-aurora-primary aurora-glow" />
        </div>
        <h3 className="text-xl font-semibold aurora-text-gradient mb-2">Nenhum usuário encontrado</h3>
        <p className="text-muted-foreground">
          Tente ajustar os filtros ou aguarde novos usuários se cadastrarem
        </p>
      </AuroraCard>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user, index) => {
          const roleName = getUserRoleName(user);
          const isActive = (user.status || 'active') === 'active';
          const createdDate = new Date(user.created_at);
          const isNewUser = Date.now() - createdDate.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days
          
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                ease: 'easeOut' 
              }}
            >
              <AuroraCard 
                variant="interactive" 
                glow={true} 
                className="group h-full"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-aurora-primary/10 transition-all aurora-glow group-hover:ring-aurora-primary/20">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-aurora-primary/20 to-operational/20 text-aurora-primary font-semibold">
                            {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {isNewUser && (
                          <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full animate-pulse aurora-glow" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate aurora-text-gradient">
                            {user.name || 'Sem nome'}
                          </h3>
                          {isNewUser && (
                            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                              Novo
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 text-body-small text-muted-foreground truncate">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity aurora-focus"
                        >
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="z-50 aurora-glass border-aurora-primary/20 backdrop-blur-xl">
                        {canEditRoles && (
                          <DropdownMenuItem onClick={() => onEditRole(user)} className="cursor-pointer">
                            <UserCog className="mr-2 h-4 w-4" />
                            Editar papel
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onManageCourses(user)} className="cursor-pointer">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Gerenciar Cursos
                        </DropdownMenuItem>
                        {canResetPasswords && (
                          <DropdownMenuItem onClick={() => onResetPassword(user)} className="cursor-pointer">
                            <Key className="mr-2 h-4 w-4" />
                            Redefinir senha
                          </DropdownMenuItem>
                        )}
                        {canResetUsers && (
                          <DropdownMenuItem onClick={() => handleResetUser(user)} className="cursor-pointer">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Resetar usuário
                          </DropdownMenuItem>
                        )}
                        {canToggleStatus && (
                          <DropdownMenuItem onClick={() => handleToggleStatus(user)} className="cursor-pointer">
                            {isActive ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Desativar usuário
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Reativar usuário
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        {canDeleteUsers && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDeleteUser(user)}
                              className="text-destructive cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir usuário
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Status and Role */}
                  <div className="flex items-center justify-between">
                  <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline"
                          className={
                            roleName === 'admin' 
                              ? 'bg-aurora-primary/10 text-aurora-primary border-aurora-primary/30' 
                              : 'bg-muted/50 text-foreground border-border'
                          }
                        >
                          {roleName}
                        </Badge>
                        
                        <Badge 
                          variant="outline"
                          className={
                            isActive 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                              : 'bg-destructive/10 text-destructive border-destructive/30'
                          }
                        >
                          {isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-2 text-body-small">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Criado em {createdDate.toLocaleDateString('pt-BR')}</span>
                    </div>
                    
                    {user.onboarding_completed && (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="h-3 w-3" />
                        <span className="text-xs">Onboarding completo</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    {canEditRoles && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onEditRole(user)}
                        className="flex-1 h-8 text-xs aurora-focus"
                      >
                        <UserCog className="h-3 w-3 mr-1" />
                        Papel
                      </Button>
                    )}
                    
                    {canResetPasswords && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onResetPassword(user)}
                        className="flex-1 h-8 text-xs aurora-focus"
                      >
                        <Key className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    )}
                    
                    {canDeleteUsers && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteUser(user)}
                        className="flex-1 h-8 text-xs aurora-focus hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Deletar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </AuroraCard>
            </motion.div>
          );
        })}
      </div>

      <UserResetDialog 
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        user={selectedUser}
        onSuccess={handleResetSuccess}
      />

      <ToggleUserStatusDialog 
        open={toggleStatusDialogOpen}
        onOpenChange={setToggleStatusDialogOpen}
        user={selectedUser}
        onSuccess={handleResetSuccess}
      />

      <DeleteUserDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={userToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
};