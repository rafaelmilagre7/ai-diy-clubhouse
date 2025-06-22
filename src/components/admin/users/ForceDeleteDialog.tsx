
import React, { useState } from "react";
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
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, AlertTriangle, Trash2 } from "lucide-react";
import { findRelatedEmails, parseEmailPattern } from "@/utils/emailUtils";

interface ForceDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ForceDeleteDialog: React.FC<ForceDeleteDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [relatedEmailsFound, setRelatedEmailsFound] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeRelatedEmails = async () => {
    setIsAnalyzing(true);
    setRelatedEmailsFound([]);

    try {
      // Buscar todos os usuários
      const { data: usersData, error: usersError } = await supabase.rpc('get_users_with_roles', {
        limit_count: 1000,
        offset_count: 0,
        search_query: null
      });

      if (usersError) {
        console.error('Erro ao buscar usuários:', usersError);
        toast.error("Erro ao analisar usuários");
        return;
      }

      // Buscar todos os convites
      const { data: invitesData, error: invitesError } = await supabase
        .from('invites')
        .select('email');

      if (invitesError) {
        console.error('Erro ao buscar convites:', invitesError);
        toast.error("Erro ao analisar convites");
        return;
      }

      // Combinar todos os emails
      const allEmails = [
        ...(usersData || []).map((user: any) => user.email).filter(Boolean),
        ...(invitesData || []).map((invite: any) => invite.email).filter(Boolean)
      ];

      console.log('📧 Emails encontrados para análise:', allEmails.length);

      // Encontrar emails relacionados (com sufixos)
      const emailGroups = new Map<string, string[]>();
      
      allEmails.forEach(email => {
        const { baseEmail } = parseEmailPattern(email);
        if (!emailGroups.has(baseEmail)) {
          emailGroups.set(baseEmail, []);
        }
        emailGroups.get(baseEmail)!.push(email);
      });

      // Filtrar apenas grupos com múltiplos emails (duplicados)
      const duplicatedEmails: string[] = [];
      emailGroups.forEach((emails, baseEmail) => {
        if (emails.length > 1) {
          duplicatedEmails.push(...emails);
          console.log(`🔍 Base ${baseEmail} tem ${emails.length} variações:`, emails);
        }
      });

      setRelatedEmailsFound(duplicatedEmails);
      
      if (duplicatedEmails.length > 0) {
        toast.info(`Encontrados ${duplicatedEmails.length} emails duplicados/relacionados`);
      } else {
        toast.success("Nenhum email duplicado encontrado");
      }

    } catch (error: any) {
      console.error('Erro na análise de emails:', error);
      toast.error("Erro inesperado na análise");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleForceDelete = async () => {
    if (relatedEmailsFound.length === 0) {
      toast.error("Nenhum email duplicado foi encontrado para limpar");
      return;
    }

    setIsDeleting(true);

    try {
      console.log('🗑️ Iniciando limpeza TOTAL de emails duplicados:', relatedEmailsFound);

      // 1. Deletar todos os convites relacionados
      for (const email of relatedEmailsFound) {
        const { error: inviteError } = await supabase
          .from('invites')
          .delete()
          .eq('email', email);

        if (inviteError) {
          console.error(`Erro ao deletar convite ${email}:`, inviteError);
        } else {
          console.log(`✅ Convite deletado: ${email}`);
        }
      }

      // 2. Deletar usuários relacionados (via função admin)
      for (const email of relatedEmailsFound) {
        try {
          const { error: deleteError } = await supabase.rpc('admin_delete_user_by_email', {
            user_email: email
          });

          if (deleteError) {
            console.error(`Erro ao deletar usuário ${email}:`, deleteError);
          } else {
            console.log(`✅ Usuário deletado: ${email}`);
          }
        } catch (error) {
          console.error(`Erro inesperado ao deletar usuário ${email}:`, error);
        }
      }

      // 3. Limpeza adicional de dados órfãos
      try {
        const { error: cleanupError } = await supabase.rpc('cleanup_orphaned_data');
        if (cleanupError) {
          console.warn('Aviso na limpeza de dados órfãos:', cleanupError);
        }
      } catch (error) {
        console.warn('Limpeza de dados órfãos não disponível:', error);
      }

      toast.success(`✅ Limpeza concluída! ${relatedEmailsFound.length} emails duplicados removidos.`);
      setRelatedEmailsFound([]);
      onSuccess?.();
      onOpenChange(false);

    } catch (error: any) {
      console.error('❌ Erro na limpeza TOTAL:', error);
      toast.error(`Erro na limpeza: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            🚨 LIMPEZA TOTAL - EMAILS DUPLICADOS
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Esta ação irá detectar e remover TODOS os emails duplicados (com sufixos) do sistema:
              </p>
              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
                <li>Usuários com emails como: email+123@domain.com</li>
                <li>Convites pendentes relacionados</li>
                <li>Dados órfãos no sistema</li>
              </ul>
            </div>

            {!isAnalyzing && relatedEmailsFound.length === 0 && (
              <div className="flex justify-center">
                <Button 
                  onClick={analyzeRelatedEmails}
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  🔍 Analisar Sistema (Encontrar Duplicados)
                </Button>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-blue-700">Analisando sistema...</span>
              </div>
            )}

            {relatedEmailsFound.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-2">
                  📋 {relatedEmailsFound.length} emails duplicados encontrados:
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {relatedEmailsFound.slice(0, 10).map((email, index) => (
                    <div key={index} className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                      {email}
                    </div>
                  ))}
                  {relatedEmailsFound.length > 10 && (
                    <div className="text-xs text-red-600 font-medium">
                      ... e mais {relatedEmailsFound.length - 10} emails
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-sm font-bold text-red-800">
                ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          
          {relatedEmailsFound.length > 0 && (
            <AlertDialogAction
              onClick={handleForceDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Limpando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  🗑️ LIMPAR TUDO ({relatedEmailsFound.length})
                </>
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
