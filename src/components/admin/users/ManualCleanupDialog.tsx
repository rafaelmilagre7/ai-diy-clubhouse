
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
import { resetUserByEmail } from "@/utils/adminUserReset";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Trash2 } from "lucide-react";

interface ManualCleanupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ResetResult {
  success: boolean;
  message: string;
  backup_records?: number;
  user_id?: string;
  reset_timestamp?: string;
}

export const ManualCleanupDialog: React.FC<ManualCleanupDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ResetResult | null>(null);

  const handleCleanup = async () => {
    if (!email.trim()) return;
    
    setIsProcessing(true);
    setResult(null);
    
    try {
      const cleanupResult = await resetUserByEmail(email.trim());
      setResult(cleanupResult);
      
      if (cleanupResult.success && onSuccess) {
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
          setEmail('');
          setResult(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Erro na limpeza:', error);
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
            🧹 Limpeza Manual Completa
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Esta ferramenta faz a limpeza completa de um usuário específico por email, 
              liberando o email para novos convites.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email do usuário:</Label>
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
                
                {result.success && result.backup_records && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      ✅ {result.backup_records} registro(s) salvos em backup
                    </Badge>
                    {result.user_id && (
                      <Badge variant="outline" className="text-xs">
                        ID: {result.user_id.substring(0, 8)}...
                      </Badge>
                    )}
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
              handleCleanup();
            }}
            disabled={isProcessing || !email.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {isProcessing ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Processando...
              </>
            ) : (
              "🧹 Limpar Completamente"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
