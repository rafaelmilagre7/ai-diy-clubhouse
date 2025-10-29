
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { manualCompleteUserCleanup, ManualCleanupResult } from "@/utils/manualUserCleanup";
import { Badge } from "@/components/ui/badge";
import { AuroraCard } from "@/components/ui/AuroraCard";
import { CheckCircle, AlertTriangle, Trash2, XCircle } from "lucide-react";

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
      <AlertDialogContent className="max-w-2xl aurora-glass">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 aurora-text-gradient">
            <Trash2 className="h-5 w-5 text-destructive" />
            Limpeza Manual Completa
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
              <AuroraCard 
                variant="glass" 
                className={`p-4 ${
                  result.success 
                    ? 'border-emerald-500/30' 
                    : 'border-destructive/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500 aurora-glow" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                  <p className={`text-sm font-medium ${
                    result.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
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
                  <Badge 
                    variant="outline" 
                    className={`text-xs flex items-center gap-1 ${
                      result.details.emailLiberated 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-destructive/10 border-destructive/30 text-destructive'
                    }`}
                  >
                    {result.details.emailLiberated ? (
                      <><CheckCircle className="h-3 w-3" /> Email liberado</>
                    ) : (
                      <><XCircle className="h-3 w-3" /> Email não liberado</>
                    )}
                  </Badge>
                </div>
              </AuroraCard>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AdminButton
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancelar
          </AdminButton>
          <AdminButton
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              handleCleanup();
            }}
            disabled={isProcessing || !email.trim()}
            icon={<Trash2 />}
            loading={isProcessing}
            loadingText="Processando..."
          >
            Limpar Completamente
          </AdminButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
