import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useOrganization } from '@/hooks/useOrganization';
import { Users, UserPlus, Search, MoreHorizontal, UserMinus, Crown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useToast } from '@/hooks/use-toast';

const TeamManagement = () => {
  const { organization, teamMembers, removeMember, canAddMoreMembers } = useOrganization();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  const filteredMembers = teamMembers.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await removeMember(memberToRemove);
      toast({
        title: "Membro removido",
        description: "O membro foi removido da equipe com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover membro",
        description: "Não foi possível remover o membro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setMemberToRemove(null);
    }
  };

  const getRoleBadgeVariant = (roleName: string, isMaster: boolean) => {
    if (isMaster) return "default";
    switch (roleName) {
      case 'admin': return "destructive";
      case 'moderator': return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gerenciar Equipe
          </h1>
          <p className="text-muted-foreground mt-1">
            {organization?.name} • {teamMembers.length}/{organization?.max_users} membros
          </p>
        </div>
        <Button 
          disabled={!canAddMoreMembers()}
          className="gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Convidar Membro
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar membros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Users className="w-3 h-3" />
            {teamMembers.length} membros
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Crown className="w-3 h-3" />
            {teamMembers.filter(m => m.is_master_user).length} master
          </Badge>
        </div>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Membros da Equipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? 'Nenhum membro encontrado' : 'Equipe vazia'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca'
                  : 'Comece convidando membros para sua equipe'
                }
              </p>
              {!searchTerm && (
                <Button className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Convidar Primeiro Membro
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {member.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">
                          {member.name || 'Sem nome'}
                        </h4>
                        {member.is_master_user && (
                          <Crown className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={getRoleBadgeVariant(
                        member.user_roles?.name || 'member', 
                        member.is_master_user
                      )}
                    >
                      {member.is_master_user 
                        ? 'Master' 
                        : member.user_roles?.name || 'Membro'
                      }
                    </Badge>

                    {!member.is_master_user && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            Editar Papel
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Enviar Mensagem
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setMemberToRemove(member.id)}
                            className="text-destructive"
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            Remover da Equipe
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro da equipe?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá o membro da organização. Ele perderá acesso a todos os recursos da equipe.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-destructive text-destructive-foreground">
              Remover Membro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamManagement;