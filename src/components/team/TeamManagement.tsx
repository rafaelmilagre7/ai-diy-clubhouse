import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Trash2, 
  Calendar,
  AlertCircle,
  Crown
} from 'lucide-react';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { getInitials } from '@/utils/user';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const TeamManagement: React.FC = () => {
  const {
    teamMembers,
    teamInvites,
    teamStats,
    loading,
    inviteMember,
    removeMember,
    cancelInvite
  } = useTeamManagement();

  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setInviting(true);
    const success = await inviteMember(newMemberEmail.trim());
    if (success) {
      setNewMemberEmail('');
    }
    setInviting(false);
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (confirm(`Tem certeza que deseja remover ${memberName || 'este membro'} da equipe?`)) {
      await removeMember(memberId);
    }
  };

  const handleCancelInvite = async (inviteId: string, email: string) => {
    if (confirm(`Tem certeza que deseja cancelar o convite para ${email}?`)) {
      await cancelInvite(inviteId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-muted-foreground">Carregando dados da equipe...</p>
      </div>
    );
  }

  if (!teamStats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Gestão de Equipe Indisponível</h3>
            <p className="text-muted-foreground">
              Esta funcionalidade está disponível apenas para usuários com papel master_user ou membro_club.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se não tem membros e nem convites, mostrar mensagem de boas-vindas
  const isFirstTimeSetup = teamStats.current_members === 0 && teamStats.pending_invites === 0;

  const usagePercentage = (teamStats.current_members / teamStats.max_members) * 100;

  return (
    <div className="space-y-6">
      {/* Mensagem de boas-vindas para primeira configuração */}
      {isFirstTimeSetup && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <Crown className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Bem-vindo à Gestão de Equipe!</h3>
              <p className="text-muted-foreground mb-4">
                Como usuário master, você pode convidar membros para sua equipe e gerenciar o acesso deles.
                Comece enviando o primeiro convite abaixo.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas da Equipe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Gestão da Equipe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{teamStats.current_members}</div>
              <p className="text-sm text-muted-foreground">Membros Ativos</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{teamStats.pending_invites}</div>
              <p className="text-sm text-muted-foreground">Convites Pendentes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{teamStats.max_members}</div>
              <p className="text-sm text-muted-foreground">Limite do Plano</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uso da equipe</span>
              <span>{teamStats.current_members} / {teamStats.max_members}</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>

          {usagePercentage >= 100 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Você atingiu o limite do seu plano. Para adicionar mais membros, faça upgrade.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adicionar Novo Membro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Convidar Novo Membro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInviteMember} className="flex gap-3">
            <Input
              type="email"
              placeholder="email@exemplo.com"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              disabled={inviting || usagePercentage >= 100}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={inviting || !newMemberEmail.trim() || usagePercentage >= 100}
            >
              {inviting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Convidar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Membros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membros da Equipe ({teamMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Nenhum membro na equipe ainda.
              </p>
            ) : (
              teamMembers.map((member, index) => (
                <div key={member.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback>
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name || 'Nome não informado'}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(member.created_at).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id, member.name || member.email)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {index < teamMembers.length - 1 && <Separator className="mt-4" />}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Convites Pendentes */}
      {teamInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Convites Pendentes ({teamInvites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamInvites.map((invite, index) => (
                <div key={invite.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{invite.email}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary">
                            {invite.status === 'pending' ? 'Pendente' : invite.status}
                          </Badge>
                          <span>•</span>
                          <span>
                            Expira em: {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelInvite(invite.id, invite.email)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {index < teamInvites.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};