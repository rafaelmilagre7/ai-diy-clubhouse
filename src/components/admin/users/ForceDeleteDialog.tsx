
import React, { useState, useEffect } from 'react';
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useAdminUserDelete } from "@/hooks/admin/users/useAdminUserDelete";
import { AlertTriangle, Trash2, Shield, Database, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ForceDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToDelete?: {
    id: string;
    email: string;
    name?: string;
  };
  onSuccess?: () => void;
}

export const ForceDeleteDialog: React.FC<ForceDeleteDialogProps> = ({
  open,
  onOpenChange,
  userToDelete,
  onSuccess
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [secondConfirmation, setSecondConfirmation] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [canProceed, setCanProceed] = useState(false);
  
  const { deleteUser, isDeleting } = useAdminUserDelete();

  const expectedConfirmation = userToDelete?.email || '';
  const expectedSecondConfirmation = 'EXCLUIR PERMANENTEMENTE';
  
  const isConfirmationValid = confirmationText === expectedConfirmation;
  const isSecondConfirmationValid = secondConfirmation === expectedSecondConfirmation;
  const isReadyToDelete = isConfirmationValid && isSecondConfirmationValid && agreedToTerms && canProceed;

  // Countdown de segurança
  useEffect(() => {
    if (open && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanProceed(true);
    }
  }, [open, countdown]);

  // Reset quando dialog abre/fecha
  useEffect(() => {
    if (open) {
      setConfirmationText('');
      setSecondConfirmation('');
      setAgreedToTerms(false);
      setCountdown(5);
      setCanProceed(false);
    }
  }, [open]);

  const handleDelete = async () => {
    if (!userToDelete || !isReadyToDelete) return;
    
    try {
      const success = await deleteUser(userToDelete.id, userToDelete.email);
      
      if (success && onSuccess) {
        onSuccess();
        onOpenChange(false);
        // Reset form
        setConfirmationText('');
        setSecondConfirmation('');
        setAgreedToTerms(false);
      }
    } catch (error) {
      console.error('Erro na exclusão:', error);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            🗑️ EXCLUSÃO TOTAL DE USUÁRIO
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            {/* Warning principal */}
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL
                </p>
              </div>
              <ul className="text-xs text-red-700 dark:text-red-300 space-y-1 ml-7">
                <li>• Remove COMPLETAMENTE o usuário do sistema</li>
                <li>• Exclui de TODAS as tabelas do banco</li>
                <li>• Tenta remover da auth.users (requer permissões especiais)</li>
                <li>• Backup automático é criado antes da exclusão</li>
                <li>• Libera o email para novos registros</li>
              </ul>
            </div>
            
            {/* Informações do usuário */}
            {userToDelete && (
              <div className="space-y-3">
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    <strong>Usuário selecionado:</strong>
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>Nome:</strong> {userToDelete.name || 'Sem nome'}
                    </p>
                    <p className="text-sm">
                      <strong>Email:</strong> {userToDelete.email}
                    </p>
                    <p className="text-sm">
                      <strong>ID:</strong> {userToDelete.id}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Processo de exclusão */}
            <div className="space-y-3">
              <Separator />
              <div className="flex items-center gap-2 text-blue-600">
                <Database className="h-4 w-4" />
                <p className="text-sm font-medium">Processo de exclusão:</p>
              </div>
              <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-6">
                <li>1. Backup automático de todos os dados</li>
                <li>2. Exclusão de todas as tabelas relacionadas</li>
                <li>3. Remoção do perfil público</li>
                <li>4. Tentativa de exclusão da auth.users</li>
                <li>5. Log detalhado da operação</li>
              </ol>
            </div>

            {/* Countdown de segurança */}
            {countdown > 0 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Aguarde {countdown} segundos antes de continuar...
                </p>
              </div>
            )}

            {/* Formulário de confirmação */}
            {canProceed && (
              <div className="space-y-4">
                <Separator />
                
                {/* Primeira confirmação - email */}
                <div className="space-y-2">
                  <Label htmlFor="confirmation" className="text-sm font-medium">
                    1. Digite o email do usuário para confirmar:
                  </Label>
                  <Input
                    id="confirmation"
                    type="email"
                    placeholder={expectedConfirmation}
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    disabled={isDeleting}
                    className={isConfirmationValid && confirmationText ? 'border-green-300' : ''}
                  />
                  {confirmationText && !isConfirmationValid && (
                    <p className="text-xs text-red-600">
                      O email deve corresponder exatamente
                    </p>
                  )}
                </div>

                {/* Segunda confirmação */}
                <div className="space-y-2">
                  <Label htmlFor="second-confirmation" className="text-sm font-medium">
                    2. Digite "EXCLUIR PERMANENTEMENTE" para confirmar:
                  </Label>
                  <Input
                    id="second-confirmation"
                    type="text"
                    placeholder="EXCLUIR PERMANENTEMENTE"
                    value={secondConfirmation}
                    onChange={(e) => setSecondConfirmation(e.target.value)}
                    disabled={isDeleting}
                    className={isSecondConfirmationValid && secondConfirmation ? 'border-green-300' : ''}
                  />
                  {secondConfirmation && !isSecondConfirmationValid && (
                    <p className="text-xs text-red-600">
                      Digite exatamente "EXCLUIR PERMANENTEMENTE"
                    </p>
                  )}
                </div>

                {/* Checkbox de acordo */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    disabled={isDeleting}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-600 dark:text-gray-400">
                    Eu entendo que esta ação é irreversível e aceito total responsabilidade pela exclusão permanente deste usuário do sistema.
                  </label>
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting || !isReadyToDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Excluindo...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                🗑️ EXCLUIR COMPLETAMENTE
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
