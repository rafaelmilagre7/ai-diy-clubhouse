
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
  const [isCompleteDelete, setIsCompleteDelete] = useState(true); // Exclusão completa por padrão

  const handleDeleteUser = async () => {
    if (!user) return;
    
    console.log('🔥 Iniciando exclusão com configurações:', {
      userId: user.id,
      email: user.email,
      softDelete,
      isCompleteDelete
    });
    
    const success = await deleteUser(user.id, user.email, softDelete, isCompleteDelete);
    
    if (success) {
      onOpenChange(false);
      if (onSuccess) {
        // Aguardar um pouco para garantir que a exclusão foi processada
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            🔥 EXCLUSÃO COMPLETA DO USUÁRIO DA PLATAFORMA
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-md border border-red-200 dark:border-red-800">
              <p className="text-red-800 dark:text-red-200 font-medium mb-2">
                ⚠️ ATENÇÃO: Esta ação irá excluir COMPLETAMENTE o usuário da plataforma!
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                Usuário: <strong>{user?.name || user?.email}</strong>
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-3 bg-red-100 dark:bg-red-950/30 rounded-md border">
                <Switch
                  id="complete-delete"
                  checked={isCompleteDelete}
                  onCheckedChange={setIsCompleteDelete}
                />
                <Label htmlFor="complete-delete" className="text-sm font-medium text-red-800 dark:text-red-200">
                  Exclusão completa e irreversível (RECOMENDADO)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border">
                <Switch
                  id="soft-delete"
                  checked={softDelete}
                  onCheckedChange={setSoftDelete}
                />
                <Label htmlFor="soft-delete" className="text-sm font-medium">
                  Usar soft delete (apenas para desenvolvimento)
                </Label>
              </div>
            </div>

            {isCompleteDelete && (
              <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-md border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    🔥 EXCLUSÃO COMPLETA E IRREVERSÍVEL
                  </p>
                </div>
                <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                  <li>• 💥 Remove completamente do sistema de autenticação Supabase</li>
                  <li>• 🗑️ Exclui TODOS os dados relacionados ao usuário</li>
                  <li>• 📧 Libera o email para reutilização imediata</li>
                  <li>• 🔥 Remove de TODAS as tabelas da plataforma</li>
                  <li>• ⚡ Ação 100% irreversível</li>
                  <li>• ✅ Solução definitiva para limpeza total</li>
                </ul>
              </div>
            )}

            {softDelete && (
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                    🧹 Soft Delete - Apenas Desenvolvimento
                  </p>
                </div>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• 🧹 Limpa dados pessoais e de progresso</li>
                  <li>• 👤 Mantém o usuário no sistema de autenticação</li>
                  <li>• 📧 Permite reenvio de convites</li>
                  <li>• ⚡ Mais seguro para testes</li>
                </ul>
              </div>
            )}
            
            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-md border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    ⚠️ O QUE SERÁ REMOVIDO:
                </p>
              </div>
              <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                <li>• Perfil do usuário</li>
                <li>• Dados de onboarding</li>
                <li>• Progresso de implementação</li>
                <li>• Mensagens e conversas</li>
                <li>• Posts no fórum</li>
                <li>• Certificados</li>
                <li>• Preferências de comunicação</li>
                <li>• {isCompleteDelete ? "✅ Conta de autenticação (email liberado)" : "❌ Conta de autenticação (email ainda ocupado)"}</li>
              </ul>
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
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                <span>Excluindo da plataforma...</span>
              </>
            ) : (
              isCompleteDelete ? "🔥 EXCLUIR COMPLETAMENTE DA PLATAFORMA" : "🧹 Limpar dados do usuário"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
