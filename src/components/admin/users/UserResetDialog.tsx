
import { useState } from "react";
import { UserProfile } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  onSuccess?: () => void;
}

export const UserResetDialog = ({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserResetDialogProps) => {
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (!user?.email) return;
    
    try {
      setIsResetting(true);
      
      console.log(`🔄 Iniciando reset completo para usuário: ${user.email}`);
      
      // Chamar a função de reset no banco
      const { data, error } = await supabase.rpc('admin_reset_user', {
        user_email: user.email
      });
      
      if (error) {
        console.error('❌ Erro ao resetar usuário:', error);
        throw error;
      }
      
      if (!data?.success) {
        throw new Error(data?.message || 'Erro desconhecido no reset');
      }
      
      console.log('✅ Reset realizado com sucesso:', data);
      
      toast.success(`Usuário ${user.email} foi resetado com sucesso!`, {
        description: `${data.backup_records} registros foram salvos em backup.`
      });
      
      onOpenChange(false);
      onSuccess?.();
      
    } catch (error: any) {
      console.error('❌ Erro durante reset:', error);
      toast.error('Erro ao resetar usuário', {
        description: error.message || 'Não foi possível resetar o usuário.'
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Reset Completo do Usuário
          </DialogTitle>
          <DialogDescription>
            Esta ação irá resetar completamente os dados do usuário{" "}
            <span className="font-medium">{user?.name || user?.email}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <div className="font-medium">O que será removido:</div>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Dados de onboarding e progresso</li>
                <li>Trilhas de implementação</li>
                <li>Histórico de atividades</li>
                <li>Notificações relacionadas</li>
                <li>Progresso de aprendizado</li>
                <li>Analytics do usuário</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertDescription className="space-y-2">
              <div className="font-medium text-green-600">O que será preservado:</div>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Email e informações de login</li>
                <li>Papel e permissões administrativas</li>
                <li>Data de criação da conta</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertDescription>
              <div className="font-medium">Backup Automático:</div>
              <p className="text-sm mt-1">
                Todos os dados atuais serão salvos automaticamente em tabelas de backup 
                antes da remoção.
              </p>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isResetting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleReset}
            disabled={isResetting}
          >
            {isResetting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetando...
              </>
            ) : (
              'Confirmar Reset'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
