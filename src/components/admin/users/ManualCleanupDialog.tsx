
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
import { manualCompleteUserCleanup, ManualCleanupResult } from "@/utils/manualUserCleanup";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Trash2 } from "lucide-react";

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
  const [result, setResult] = useState<ManualCleanupResult | null>(null);

  const handleCleanup = async () => {
    if (!email.trim()) return;
    
    setIsProcessing(true);
    setResult(null);
    
    try {
      const cleanupResult = await manualCompleteUserCleanup(email.trim());
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
            <Trash2 className="h-5 w-5 text-status-error" />
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
                  ? 'bg-operational/10 border-operational/30' 
                  : 'bg-status-error/10 border-status-error/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-operational" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-status-error" />
                  )}
                  <p className={`text-sm font-medium ${
                    result.success ? 'text-operational' : 'text-status-error'
                  }`}>
                    {result.message}
                  </p>
                </div>
                
                {result.details.tablesProcessed.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium mb-1">Tabelas processadas:</p>
                    <div className="flex flex-wrap gap-1">
                      {result.details.tablesProcessed.map((table) => (
                        <Badge key={table} variant="outline" className="text-xs">
                          {table}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {result.details.errors.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1">Avisos ({result.details.errors.length}):</p>
                    <div className="text-xs opacity-70">
                      {result.details.errors.slice(0, 3).map((error, i) => (
                        <div key={i}>• {error.table}: {error.error}</div>
                      ))}
                      {result.details.errors.length > 3 && (
                        <div>... e mais {result.details.errors.length - 3} avisos</div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={result.details.emailLiberated ? "default" : "destructive"} className="text-xs">
                    {result.details.emailLiberated ? "✅ Email liberado" : "❌ Email não liberado"}
                  </Badge>
                </div>
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
            className="bg-status-error hover:bg-status-error/90"
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
