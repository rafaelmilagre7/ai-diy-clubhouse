
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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { parseEmailPattern, findRelatedEmails } from '@/utils/emailUtils';
import { adminForceDeleteUser } from '@/utils/adminForceDeleteUser';

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [duplicates, setDuplicates] = useState<{
    users: string[];
    invites: string[];
  }>({ users: [], invites: [] });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleAnalyzeSystem = async () => {
    try {
      setIsAnalyzing(true);
      console.log('🔍 Analisando sistema para emails duplicados...');

      // 1. Buscar todos os usuários
      const { data: usersData, error: usersError } = await supabase.rpc('get_users_with_roles', {
        limit_count: 1000,
        offset_count: 0
      });

      if (usersError) {
        console.error('Erro ao buscar usuários:', usersError);
        throw usersError;
      }

      // 2. Buscar todos os convites
      const { data: invitesData, error: invitesError } = await supabase
        .from('invites')
        .select('email');

      if (invitesError) {
        console.error('Erro ao buscar convites:', invitesError);
        throw invitesError;
      }

      // 3. Analisar duplicados
      const allUserEmails = usersData?.users || [];
      const allInviteEmails = invitesData?.map(i => i.email) || [];

      const userEmailsSet = new Set<string>();
      const inviteEmailsSet = new Set<string>();
      const duplicateUsers: string[] = [];
      const duplicateInvites: string[] = [];

      // Analisar emails de usuários
      allUserEmails.forEach((user: any) => {
        if (user.email) {
          const { baseEmail } = parseEmailPattern(user.email);
          
          // Se já temos este email base, é um duplicado
          const existingEmails = Array.from(userEmailsSet).filter(existingEmail => {
            const { baseEmail: existingBase } = parseEmailPattern(existingEmail);
            return existingBase === baseEmail;
          });

          if (existingEmails.length > 0) {
            // Adicionar todos os relacionados como duplicados
            duplicateUsers.push(user.email);
            existingEmails.forEach(existing => {
              if (!duplicateUsers.includes(existing)) {
                duplicateUsers.push(existing);
              }
            });
          } else {
            userEmailsSet.add(user.email);
          }
        }
      });

      // Analisar emails de convites
      allInviteEmails.forEach((inviteEmail) => {
        if (inviteEmail) {
          const { baseEmail } = parseEmailPattern(inviteEmail);
          
          const existingEmails = Array.from(inviteEmailsSet).filter(existingEmail => {
            const { baseEmail: existingBase } = parseEmailPattern(existingEmail);
            return existingBase === baseEmail;
          });

          if (existingEmails.length > 0) {
            duplicateInvites.push(inviteEmail);
            existingEmails.forEach(existing => {
              if (!duplicateInvites.includes(existing)) {
                duplicateInvites.push(existing);
              }
            });
          } else {
            inviteEmailsSet.add(inviteEmail);
          }
        }
      });

      setDuplicates({
        users: duplicateUsers,
        invites: duplicateInvites
      });

      console.log('📊 Análise concluída:', {
        duplicateUsers: duplicateUsers.length,
        duplicateInvites: duplicateInvites.length
      });

      if (duplicateUsers.length === 0 && duplicateInvites.length === 0) {
        toast.success('✅ Nenhum email duplicado encontrado no sistema');
      } else {
        setShowConfirmation(true);
      }

    } catch (error: any) {
      console.error('❌ Erro na análise:', error);
      toast.error('Erro ao analisar sistema: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCleanupAll = async () => {
    try {
      setIsDeleting(true);
      console.log('🗑️ Iniciando limpeza TOTAL de emails duplicados...');

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // 1. Limpar usuários duplicados
      for (const userEmail of duplicates.users) {
        try {
          console.log(`🧹 Limpando usuário: ${userEmail}`);
          
          // Usar a função correta que existe no sistema
          const result = await adminForceDeleteUser(userEmail);
          
          if (result.success) {
            console.log(`✅ Usuário ${userEmail} removido com sucesso`);
            successCount++;
          } else {
            console.error(`❌ Falha ao remover usuário ${userEmail}:`, result.message);
            errorCount++;
            errors.push(`${userEmail}: ${result.message}`);
          }
        } catch (error: any) {
          console.error(`❌ Erro ao remover usuário ${userEmail}:`, error);
          errorCount++;
          errors.push(`${userEmail}: ${error.message}`);
        }
      }

      // 2. Limpar convites duplicados
      for (const inviteEmail of duplicates.invites) {
        try {
          console.log(`🧹 Limpando convites para: ${inviteEmail}`);
          
          const { error } = await supabase
            .from('invites')
            .delete()
            .eq('email', inviteEmail);

          if (error) {
            throw error;
          }

          console.log(`✅ Convites para ${inviteEmail} removidos com sucesso`);
          successCount++;
        } catch (error: any) {
          console.error(`❌ Erro ao remover convites para ${inviteEmail}:`, error);
          errorCount++;
          errors.push(`Convites ${inviteEmail}: ${error.message}`);
        }
      }

      // 3. Resultado final
      const totalProcessed = duplicates.users.length + duplicates.invites.length;
      
      if (errorCount === 0) {
        toast.success(`🎉 Limpeza TOTAL concluída com sucesso!`, {
          description: `${successCount} emails duplicados removidos`,
          duration: 5000
        });
      } else {
        toast.warning(`⚠️ Limpeza parcial realizada`, {
          description: `${successCount} removidos, ${errorCount} erros`,
          duration: 8000
        });
        
        if (errors.length > 0) {
          console.error('📋 Erros detalhados:', errors);
        }
      }

      // Resetar estado
      setDuplicates({ users: [], invites: [] });
      setShowConfirmation(false);
      onSuccess?.();

    } catch (error: any) {
      console.error('💥 Erro na limpeza total:', error);
      toast.error('Erro na limpeza total: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSingleUserDelete = async () => {
    if (!email.trim()) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    try {
      setIsDeleting(true);
      console.log(`🗑️ Executando exclusão TOTAL para: ${email}`);

      const result = await adminForceDeleteUser(email);

      if (result.success) {
        toast.success('✅ Usuário removido COMPLETAMENTE do sistema', {
          description: `${result.details.total_records_deleted} registros removidos`,
          duration: 5000
        });
        setEmail('');
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error('❌ Erro na exclusão', {
          description: result.message,
          duration: 8000
        });
      }

    } catch (error: any) {
      console.error('❌ Erro na exclusão:', error);
      toast.error('Erro na exclusão: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600 text-xl">
            🚨 EXCLUSÃO TOTAL - Gerenciar Emails Duplicados
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm space-y-2">
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <p className="font-medium text-red-800">⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!</p>
              <p className="text-red-700">Remove COMPLETAMENTE todos os dados do usuário, incluindo:</p>
              <ul className="text-red-600 text-xs mt-1 ml-4">
                <li>• Perfil do usuário</li>
                <li>• Dados de onboarding</li>
                <li>• Progresso de implementações</li>
                <li>• Posts e comentários no fórum</li>
                <li>• Notificações e analytics</li>
                <li>• Conta na tabela auth.users</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6">
          {/* Análise do Sistema */}
          <div className="space-y-3">
            <h3 className="font-medium text-lg">📊 Análise do Sistema</h3>
            <p className="text-sm text-gray-600">
              Detectar automaticamente emails duplicados (com sufixos como +teste) em todo o sistema:
            </p>
            
            <Button 
              onClick={handleAnalyzeSystem}
              disabled={isAnalyzing}
              variant="outline"
              className="w-full"
            >
              {isAnalyzing ? '🔍 Analisando...' : '🔍 Analisar Sistema'}
            </Button>

            {showConfirmation && (
              <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">
                  🚨 LIMPEZA TOTAL - EMAILS DUPLICADOS
                </h4>
                <p className="text-yellow-700 text-sm mb-3">
                  ⚠️ Esta ação irá detectar e remover TODOS os emails duplicados (com sufixos) do sistema:
                </p>
                <ul className="text-yellow-600 text-xs mb-3 ml-4">
                  <li>• Usuários com emails como: email+123@domain.com</li>
                  <li>• Convites pendentes relacionados</li>
                  <li>• Dados órfãos no sistema</li>
                </ul>

                {(duplicates.users.length > 0 || duplicates.invites.length > 0) && (
                  <div className="bg-white p-3 rounded border">
                    <p className="font-medium text-sm mb-2">
                      📋 {duplicates.users.length + duplicates.invites.length} emails duplicados encontrados:
                    </p>
                    
                    {duplicates.users.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-700">Usuários:</p>
                        <ul className="text-xs text-gray-600 ml-2">
                          {duplicates.users.map(email => (
                            <li key={email}>• {email}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {duplicates.invites.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700">Convites:</p>
                        <ul className="text-xs text-gray-600 ml-2">
                          {duplicates.invites.map(email => (
                            <li key={email}>• {email}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-yellow-800 font-medium text-sm mt-3">
                  ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!
                </p>

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => setShowConfirmation(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCleanupAll}
                    disabled={isDeleting}
                    variant="destructive"
                    size="sm"
                  >
                    {isDeleting 
                      ? '🗑️ Limpando...' 
                      : `🗑️ LIMPAR TUDO (${duplicates.users.length + duplicates.invites.length})`
                    }
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Exclusão Individual */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-medium text-lg">👤 Exclusão Individual</h3>
            <p className="text-sm text-gray-600">
              Remover um usuário específico e todos os seus dados:
            </p>
            
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email do usuário:
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@exemplo.com"
                className="mt-1"
              />
            </div>

            <Button 
              onClick={handleSingleUserDelete}
              disabled={isDeleting || !email.trim()}
              variant="destructive"
              className="w-full"
            >
              {isDeleting ? '🗑️ Excluindo...' : '🗑️ EXCLUIR USUÁRIO COMPLETAMENTE'}
            </Button>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Fechar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
