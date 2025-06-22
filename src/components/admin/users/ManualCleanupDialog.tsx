
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
import { completeUserCleanup, type CompleteCleanupResult } from "@/utils/adminCompleteUserCleanup";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Trash2, Users, Database } from "lucide-react";

interface ManualCleanupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ManualCleanupDialog: React.FC<ManualCleanupDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CompleteCleanupResult | null>(null);

  const handleCompleteCleanup = async () => {
    if (!email.trim()) return;
    
    setIsProcessing(true);
    setResult(null);
    
    try {
      const cleanupResult = await completeUserCleanup(email.trim());
      setResult(cleanupResult);
      
      if (cleanupResult.success && onSuccess) {
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
          setEmail('');
          setResult(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Erro na limpeza completa:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onOpenChange(false);
      setEmail('');
      setResult(null);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            🗑️ Limpeza Completa de Usuário
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  ⚠️ ATENÇÃO: Exclusão Total e Irreversível
                </p>
              </div>
              <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                <li>• Remove COMPLETAMENTE o usuário do sistema</li>
                <li>• Exclui da tabela auth.users (não pode fazer login)</li>
                <li>• Libera o email para novos convites</li>
                <li>• Backup automático antes da exclusão</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email do usuário para exclusão total:</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isProcessing}
              />
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
                    <div className="flex items-center gap-2">
                      <Database className="h-3 w-3" />
                      <Badge variant="outline" className="text-xs">
                        📦 {result.details.backupRecords} backup(s) criado(s)
                      </Badge>
                      {result.details.authUserDeleted && (
                        <Badge variant="outline" className="text-xs bg-green-100">
                          <Users className="h-3 w-3 mr-1" />
                          Auth removido
                        </Badge>
                      )}
                    </div>
                    
                    {result.details.tablesAffected.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        📊 Tabelas afetadas: {result.details.tablesAffected.join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {result.details.errors.length > 0 && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                    ⚠️ Erros: {result.details.errors.map(e => e.operation).join(', ')}
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
              handleCompleteCleanup();
            }}
            disabled={isProcessing || !email.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {isProcessing ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Removendo Completamente...
              </>
            ) : (
              "🗑️ EXCLUIR COMPLETAMENTE"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
