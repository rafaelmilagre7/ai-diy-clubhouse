import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Mail, UserPlus } from 'lucide-react';

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  masterUserId: string;
  organizationId: string;
  onSuccess?: () => void;
}

export function AddMemberDialog({
  open,
  onOpenChange,
  masterUserId,
  organizationId,
  onSuccess
}: AddMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddMember = async () => {
    if (!email.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, informe o email do membro.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_add_team_member', {
        p_master_user_id: masterUserId,
        p_member_email: email.trim(),
        p_organization_id: organizationId
      });

      if (error) {
        console.error('Erro RPC:', error);
        toast({
          title: "Erro ao adicionar membro",
          description: "Ocorreu um erro ao processar a solicitação.",
          variant: "destructive"
        });
        return;
      }

      if (!data.success) {
        toast({
          title: "Não foi possível adicionar",
          description: data.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Membro adicionado!",
        description: `${data.member_name || email} foi adicionado à equipe com sucesso.`,
      });

      setEmail('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      toast({
        title: "Erro ao adicionar membro",
        description: "Ocorreu um erro ao adicionar o membro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Adicionar Membro à Equipe
          </DialogTitle>
          <DialogDescription>
            Informe o email do usuário que deseja adicionar à equipe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email do Membro</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="membro@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddMember}
            disabled={isLoading}
          >
            {isLoading ? 'Adicionando...' : 'Adicionar Membro'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
