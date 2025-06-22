
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
import { CheckCircle, AlertTriangle, Trash2, Users, Database, RotateCcw } from "lucide-react";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ForceDeleteResult | null>(null);

  const handleForceDelete = async () => {
    if (!email.trim()) return;
    
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
          setResult(null);
        }, 4000);
      }
    } catch (error) {
      console.error('Erro na exclusão total:', error);
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
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            🚨 EXCLUSÃO TOTAL E IRREVERSÍVEL
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  ⚠️ ATENÇÃO: Exclusão TOTAL com Força Bruta
                </p>
              </div>
              <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                <li>• Remove de TODAS as 47 tabelas do sistema</li>
                <li>• Exclui DEFINITIVAMENTE da auth.users</li>
                <li>• Libera email COMPLETAMENTE para novos convites</li>
                <li>• Backup automático antes da exclusão</li>
                <li>• IRREVERSÍVEL - não há como desfazer</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email do usuário para EXCLUSÃO TOTAL:</Label>
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
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs bg-blue-100">
                        <Database className="h-3 w-3 mr-1" />
                        📦 {result.details.backup_records} backup(s)
                      </Badge>
                      
                      {result.details.auth_user_deleted && (
                        <Badge variant="outline" className="text-xs bg-green-100">
                          <Users className="h-3 w-3 mr-1" />
                          🗑️ Auth removido
                        </Badge>
                      )}
                      
                      <Badge variant="outline" className="text-xs bg-purple-100">
                        <RotateCcw className="h-3 w-3 mr-1" />
                        🔢 {result.details.total_records_deleted} registros
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      📊 Tabelas afetadas ({result.details.affected_tables.length}): {result.details.affected_tables.join(', ')}
                    </div>
                  </div>
                )}

                {result.details.error_messages.length > 0 && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                    ⚠️ Erros ({result.details.error_count}): {result.details.error_messages.join(', ')}
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
            disabled={isProcessing || !email.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {isProcessing ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                🗑️ EXCLUINDO TOTALMENTE...
              </>
            ) : (
              "🚨 EXCLUIR TOTALMENTE"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
