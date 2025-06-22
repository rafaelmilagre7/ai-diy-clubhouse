
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { forceDeleteUser, type ForceDeleteResult } from "@/utils/adminForceDeleteUser";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Trash2, Users, Database, Shield } from "lucide-react";

interface ForceDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ForceDeleteDialog: React.FC<ForceDeleteDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ForceDeleteResult | null>(null);

  const handleForceDelete = async () => {
    if (!email.trim() || email !== confirmEmail) return;
    
    setIsProcessing(true);
    setResult(null);
    
    try {
      const deleteResult = await forceDeleteUser(email.trim());
      setResult(deleteResult);
      
      if (deleteResult.success && onSuccess) {
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
          setEmail('');
          setConfirmEmail('');
          setResult(null);
        }, 5000);
      }
    } catch (error) {
      console.error('Erro na exclusão completa:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onOpenChange(false);
      setEmail('');
      setConfirmEmail('');
      setResult(null);
    }
  };

  const isEmailConfirmed = email.trim() && email === confirmEmail;

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            🚨 EXCLUSÃO TOTAL E DEFINITIVA
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  ⚠️ OPERAÇÃO IRREVERSÍVEL E PERIGOSA
                </p>
              </div>
              <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                <li>• Remove COMPLETAMENTE o usuário da auth.users</li>
                <li>• Apaga TODOS os dados em TODAS as tabelas</li>
                <li>• Libera o email para novos registros</li>
                <li>• NÃO PODE SER DESFEITA mesmo com backup</li>
                <li>• USE APENAS em casos de emergência</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email do usuário para EXCLUSÃO TOTAL:
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isProcessing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="confirmEmail" className="text-sm font-medium">
                  Confirme o email para prosseguir:
                </Label>
                <Input
                  id="confirmEmail"
                  type="email"
                  placeholder="Confirme o email acima"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  disabled={isProcessing}
                  className={`mt-1 ${
                    confirmEmail && email !== confirmEmail 
                      ? 'border-red-500 focus:border-red-500' 
                      : ''
                  }`}
                />
                {confirmEmail && email !== confirmEmail && (
                  <p className="text-xs text-red-600 mt-1">
                    Os emails não coincidem
                  </p>
                )}
              </div>
            </div>

            {result && (
              <div className={`p-4 rounded-md border ${
                result.success 
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <p className={`text-sm font-medium ${
                    result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                  }`}>
                    {result.message}
                  </p>
                </div>
                
                {result.success && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Database className="h-3 w-3" />
                      <Badge variant="outline" className="text-xs">
                        📦 {result.details.backup_records} backup(s)
                      </Badge>
                      {result.details.auth_user_deleted && (
                        <Badge variant="outline" className="text-xs bg-green-100">
                          <Users className="h-3 w-3 mr-1" />
                          Auth removido
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        🗑️ {result.details.affected_tables.length} tabelas
                      </Badge>
                    </div>
                    
                    {result.details.affected_tables.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        📊 Tabelas afetadas: {result.details.affected_tables.join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {result.details.error_messages.length > 0 && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                    ⚠️ Erros: {result.details.error_messages.join(', ')}
                  </div>
                )}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleForceDelete();
            }}
            disabled={isProcessing || !isEmailConfirmed}
            className="bg-red-600 hover:bg-red-700"
          >
            {isProcessing ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Excluindo PERMANENTEMENTE...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                🚨 EXCLUIR PERMANENTEMENTE
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
