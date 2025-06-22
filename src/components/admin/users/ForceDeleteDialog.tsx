
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
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Trash2, Users, Database, RotateCcw, Mail } from "lucide-react";
import { parseEmailPattern, findRelatedEmails } from "@/utils/emailUtils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ForceDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ExtendedDeleteResult {
  success: boolean;
  message: string;
  details: {
    primary_email: string;
    related_emails: string[];
    backup_records: number;
    affected_tables: string[];
    auth_users_deleted: number;
    profiles_deleted: number;
    invites_deleted: number;
    error_count: number;
    error_messages: string[];
    operation_timestamp: string;
    total_records_deleted: number;
  };
}

export const ForceDeleteDialog: React.FC<ForceDeleteDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ExtendedDeleteResult | null>(null);
  const [relatedEmails, setRelatedEmails] = useState<string[]>([]);

  const searchRelatedEmails = async (targetEmail: string) => {
    try {
      const { baseEmail } = parseEmailPattern(targetEmail);
      
      // Buscar em profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('email')
        .or(`email.like.${baseEmail.replace('@', '+%@')},email.eq.${baseEmail}`);
      
      // Buscar em invites
      const { data: invites } = await supabase
        .from('invites')
        .select('email')
        .or(`email.like.${baseEmail.replace('@', '+%@')},email.eq.${baseEmail}`);
      
      // Buscar em auth.users (se possível)
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      
      const allEmails = [
        ...(profiles?.map(p => p.email) || []),
        ...(invites?.map(i => i.email) || []),
        ...(authUsers.data?.users?.map(u => u.email) || [])
      ].filter(Boolean);
      
      const uniqueEmails = [...new Set(allEmails)];
      const related = findRelatedEmails(uniqueEmails, targetEmail);
      
      setRelatedEmails(related);
      return related;
    } catch (error) {
      console.error('Erro ao buscar emails relacionados:', error);
      return [];
    }
  };

  const handleEmailChange = async (newEmail: string) => {
    setEmail(newEmail);
    if (newEmail.includes('@')) {
      await searchRelatedEmails(newEmail);
    } else {
      setRelatedEmails([]);
    }
  };

  const executeCompleteCleanup = async (targetEmail: string): Promise<ExtendedDeleteResult> => {
    const { baseEmail } = parseEmailPattern(targetEmail);
    
    try {
      // Primeiro, buscar todos os emails relacionados
      const relatedEmailsList = await searchRelatedEmails(targetEmail);
      
      let totalDeleted = 0;
      let authUsersDeleted = 0;
      let profilesDeleted = 0;
      let invitesDeleted = 0;
      const errors: string[] = [];
      const affectedTables: string[] = [];
      
      // Para cada email relacionado, fazer exclusão completa
      for (const emailToDelete of relatedEmailsList) {
        try {
          // Buscar usuário por email
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', emailToDelete)
            .maybeSingle();
          
          if (profile) {
            // Usar a função de exclusão total existente
            const { data, error } = await supabase.rpc('admin_force_delete_auth_user', {
              user_email: emailToDelete
            });
            
            if (error) {
              errors.push(`Erro ao deletar ${emailToDelete}: ${error.message}`);
            } else if (data?.success) {
              totalDeleted += data.details.total_records_deleted || 0;
              if (data.details.auth_user_deleted) authUsersDeleted++;
              profilesDeleted++;
              affectedTables.push(...(data.details.affected_tables || []));
            }
          }
          
          // Limpar convites
          const { error: inviteError } = await supabase
            .from('invites')
            .delete()
            .eq('email', emailToDelete);
          
          if (inviteError) {
            errors.push(`Erro ao deletar convites de ${emailToDelete}: ${inviteError.message}`);
          } else {
            invitesDeleted++;
            if (!affectedTables.includes('invites')) {
              affectedTables.push('invites');
            }
          }
        } catch (error: any) {
          errors.push(`Erro ao processar ${emailToDelete}: ${error.message}`);
        }
      }
      
      return {
        success: errors.length === 0 || totalDeleted > 0,
        message: `Limpeza completa realizada para ${relatedEmailsList.length} emails relacionados`,
        details: {
          primary_email: targetEmail,
          related_emails: relatedEmailsList,
          backup_records: 0, // A função SQL já faz backup
          affected_tables: [...new Set(affectedTables)],
          auth_users_deleted: authUsersDeleted,
          profiles_deleted: profilesDeleted,
          invites_deleted: invitesDeleted,
          error_count: errors.length,
          error_messages: errors,
          operation_timestamp: new Date().toISOString(),
          total_records_deleted: totalDeleted
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Erro na limpeza completa: ${error.message}`,
        details: {
          primary_email: targetEmail,
          related_emails: [],
          backup_records: 0,
          affected_tables: [],
          auth_users_deleted: 0,
          profiles_deleted: 0,
          invites_deleted: 0,
          error_count: 1,
          error_messages: [error.message],
          operation_timestamp: new Date().toISOString(),
          total_records_deleted: 0
        }
      };
    }
  };

  const handleForceDelete = async () => {
    if (!email.trim()) return;
    
    setIsProcessing(true);
    setResult(null);
    
    try {
      const deleteResult = await executeCompleteCleanup(email.trim());
      setResult(deleteResult);
      
      if (deleteResult.success) {
        toast.success('🗑️ LIMPEZA COMPLETA realizada', {
          description: `${deleteResult.details.related_emails.length} emails relacionados limpos`,
          duration: 8000
        });
        
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
            onOpenChange(false);
            setEmail('');
            setResult(null);
            setRelatedEmails([]);
          }, 4000);
        }
      } else {
        toast.error('❌ Erro na limpeza completa', {
          description: deleteResult.message,
          duration: 10000
        });
      }
    } catch (error) {
      console.error('Erro na exclusão total:', error);
      toast.error('❌ Erro inesperado na limpeza');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onOpenChange(false);
      setEmail('');
      setResult(null);
      setRelatedEmails([]);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            🚨 LIMPEZA COMPLETA DE EMAILS RELACIONADOS
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  ⚠️ ATENÇÃO: Limpeza TOTAL com detecção de emails relacionados
                </p>
              </div>
              <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                <li>• Detecta automaticamente emails com sufixos (+123456)</li>
                <li>• Remove de TODAS as tabelas do sistema</li>
                <li>• Exclui DEFINITIVAMENTE da auth.users</li>
                <li>• Libera email base COMPLETAMENTE para novos convites</li>
                <li>• Backup automático antes da exclusão</li>
                <li>• IRREVERSÍVEL - não há como desfazer</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email para LIMPEZA COMPLETA:</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            {relatedEmails.length > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    📧 Emails relacionados encontrados ({relatedEmails.length})
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {relatedEmails.map((relatedEmail, index) => {
                    const { hasSuffix } = parseEmailPattern(relatedEmail);
                    return (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className={`text-xs ${hasSuffix ? 'bg-orange-100 border-orange-300' : 'bg-blue-100 border-blue-300'}`}
                      >
                        {hasSuffix ? '🔄' : '📧'} {relatedEmail}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

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
                        <Mail className="h-3 w-3 mr-1" />
                        📧 {result.details.related_emails.length} emails
                      </Badge>
                      
                      <Badge variant="outline" className="text-xs bg-green-100">
                        <Users className="h-3 w-3 mr-1" />
                        👤 {result.details.auth_users_deleted} auth
                      </Badge>
                      
                      <Badge variant="outline" className="text-xs bg-purple-100">
                        <Database className="h-3 w-3 mr-1" />
                        🗂️ {result.details.profiles_deleted} perfis
                      </Badge>

                      <Badge variant="outline" className="text-xs bg-orange-100">
                        <RotateCcw className="h-3 w-3 mr-1" />
                        📨 {result.details.invites_deleted} convites
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      📊 Tabelas afetadas ({result.details.affected_tables.length}): {result.details.affected_tables.join(', ')}
                    </div>

                    {result.details.related_emails.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        🔗 Emails processados: {result.details.related_emails.join(', ')}
                      </div>
                    )}
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
                🗑️ LIMPANDO COMPLETAMENTE...
              </>
            ) : (
              `🚨 LIMPAR ${relatedEmails.length > 0 ? `${relatedEmails.length} EMAILS` : 'COMPLETAMENTE'}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
