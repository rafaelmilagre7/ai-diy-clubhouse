
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserProfile } from "@/lib/supabase";
import { useDeleteUser } from "@/hooks/admin/useDeleteUser";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  onSuccess?: () => void;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onOpenChange,
  user,
  onSuccess
}) => {
  const { deleteUser, isDeleting, deleteResult } = useDeleteUser();
  const [softDelete, setSoftDelete] = useState(false); // Hard delete por padrão

  const handleDeleteUser = async () => {
    if (!user) return;
    
    const success = await deleteUser(user.id, user.email, softDelete);
    
    if (success) {
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {softDelete ? '🧹 Limpar dados do usuário' : '💥 Excluir usuário completamente'}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Tem certeza que deseja {softDelete ? 'limpar os dados' : 'excluir permanentemente'} do usuário <strong>{user?.name || user?.email}</strong>?
            </p>
            
            <div className="flex items-center space-x-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-md border">
              <Switch
                id="soft-delete"
                checked={softDelete}
                onCheckedChange={setSoftDelete}
              />
              <Label htmlFor="soft-delete" className="text-sm font-medium">
                Usar soft delete (apenas para testes)
              </Label>
            </div>

            {softDelete ? (
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-md border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    ✨ Soft Delete - Ideal para Testes
                  </p>
                </div>
                <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                  <li>• 🧹 Limpa todos os dados pessoais e de progresso</li>
                  <li>• 👤 Mantém o usuário no sistema de autenticação</li>
                  <li>• 📧 Permite reenvio de convites imediatamente</li>
                  <li>• ⚡ Mais rápido e seguro para desenvolvimento</li>
                  <li>• 🔄 Perfeito para resolver "emails esgotados"</li>
                </ul>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-md border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    💥 Exclusão Completa (Hard Delete) - RECOMENDADO
                  </p>
                </div>
                <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                  <li>• 💥 Remove completamente do sistema de autenticação</li>
                  <li>• 🗑️ Limpa todos os dados associados</li>
                  <li>• 📧 Permite reutilizar o email para novos convites</li>
                  <li>• ⚡ Ação irreversível</li>
                  <li>• ✅ Solução definitiva para reutilizar emails</li>
                </ul>
              </div>
            )}
            
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    💡 Recomendação
                </p>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Use hard delete</strong> se você quer poder convidar este email novamente. 
                É a única forma de liberar completamente o email para reutilização.
              </p>
            </div>

            {/* Mostrar resultado da última exclusão se houver */}
            {deleteResult && (
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border">
                <p className="text-sm font-medium mb-2">📊 Resultado da Última Operação:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    {deleteResult.details.relatedDataCleared ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                    )}
                    <span>Dados Limpos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {deleteResult.details.profileDeleted ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                    )}
                    <span>Perfil Removido</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {deleteResult.details.authUserDeleted ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                    )}
                    <span>Auth Removido</span>
                  </div>
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {deleteResult.details.tablesAffected.length} tabelas
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDeleteUser();
            }}
            disabled={isDeleting}
            className={softDelete ? "bg-blue-600 hover:bg-blue-700" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
          >
            {isDeleting ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                <span>Processando...</span>
              </>
            ) : (
              softDelete ? "🧹 Limpar dados" : "💥 Excluir completamente"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
