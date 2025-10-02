import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Building2, Briefcase, Calendar, Trash2, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMasterTeamMembers } from "@/hooks/admin/useMasterTeamMembers";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getUserRoleName } from "@/lib/supabase/types/members";
import { AddMemberDialog } from "./AddMemberDialog";
import { adminRemoveTeamMember } from "@/lib/supabase/rpc";
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

interface ManageTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  master: UserProfile;
}

export function ManageTeamDialog({ open, onOpenChange, master }: ManageTeamDialogProps) {
  const { toast } = useToast();
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<UserProfile | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  
  const { data: members, isLoading, refetch } = useMasterTeamMembers({
    masterUserId: master.id,
    organizationId: master.organization_id || '',
    enabled: open && !!master.organization_id
  });

  const handleRemoveMember = async () => {
    if (!memberToRemove || !master.organization_id) return;
    
    setIsRemoving(true);
    try {
      const result = await adminRemoveTeamMember(memberToRemove.id, master.organization_id);
      
      if (result.success) {
        toast({
          title: "Membro removido",
          description: `${memberToRemove.name} foi removido da equipe com sucesso.`,
        });
        refetch();
      } else {
        toast({
          title: "Erro ao remover membro",
          description: result.error || "Ocorreu um erro ao remover o membro.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('[REMOVE_MEMBER] Erro:', error);
      toast({
        title: "Erro ao remover membro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
      setMemberToRemove(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-viverblue" />
            Gerenciar Equipe - {master.name}
          </DialogTitle>
          <DialogDescription>
            Visualize e gerencie os membros da organização {master.company_name || 'desta equipe'}
          </DialogDescription>
        </DialogHeader>

        {/* Estatísticas da equipe */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-surface-elevated rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-viverblue/10 rounded-lg">
              <Users className="h-5 w-5 text-viverblue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Membros</p>
              <p className="text-2xl font-bold text-foreground">{members?.length || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-viverblue/10 rounded-lg">
              <Building2 className="h-5 w-5 text-viverblue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Organização</p>
              <p className="text-sm font-semibold text-foreground truncate">
                {master.company_name || 'Sem empresa'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-viverblue/10 rounded-lg">
              <Briefcase className="h-5 w-5 text-viverblue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Setor</p>
              <p className="text-sm font-semibold text-foreground truncate">
                {master.industry || 'Não informado'}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de membros */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Membros da Equipe</h3>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setShowAddMember(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Membro
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : members && members.length > 0 ? (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 bg-surface-elevated border border-border rounded-lg hover:border-viverblue/50 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback className="bg-viverblue/10 text-viverblue">
                      {member.name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground truncate">{member.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {getUserRoleName(member as any)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </span>
                      {member.created_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(member.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMemberToRemove(member)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum membro encontrado nesta equipe.</p>
            </div>
          )}
        </div>
      </DialogContent>

      <AddMemberDialog
        open={showAddMember}
        onOpenChange={setShowAddMember}
        masterUserId={master.id}
        organizationId={master.organization_id || ''}
        onSuccess={() => refetch()}
      />

      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro da equipe?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{memberToRemove?.name}</strong> desta equipe? 
              Esta ação removerá o membro da organização e todas as conexões relacionadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
