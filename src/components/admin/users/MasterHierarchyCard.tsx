import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  ChevronDown, 
  Mail, 
  Building2,
  Calendar,
  User,
  Loader2,
  Settings
} from 'lucide-react';
import { UserProfile } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMasterTeamMembers } from '@/hooks/admin/useMasterTeamMembers';
import { cn } from '@/lib/utils';

interface MasterHierarchyCardProps {
  master: UserProfile;
  memberCount?: number;
  onEditUser?: (user: UserProfile) => void;
  onManageTeam?: (master: UserProfile) => void;
}

export const MasterHierarchyCard = ({ 
  master, 
  memberCount,
  onEditUser,
  onManageTeam 
}: MasterHierarchyCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Buscar membros sob demanda quando expandir
  const { data: teamMembers = [], isLoading: isLoadingMembers } = useMasterTeamMembers({
    masterUserId: master.id,
    organizationId: master.organization_id || '',
    enabled: isExpanded && !!master.organization_id
  });

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || 'U';
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'Data inválida';
    }
  };

  const handleManageTeam = (e: React.MouseEvent) => {
    e.stopPropagation();
    onManageTeam?.(master);
  };

  return (
    <Card className="border-2 border-border hover:border-aurora-primary/30 transition-all duration-200 shadow-sm hover:shadow-md">
      <CardHeader className="pb-4">
        {/* Cabeçalho com informações do master e badge de membros */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src={master.avatar_url || undefined} />
              <AvatarFallback className="bg-aurora-primary/10 text-aurora-primary">
                {master.name?.substring(0, 2).toUpperCase() || 'M'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">
                  {master.name}
                </h3>
                <Badge variant="secondary" className="text-xs shrink-0 bg-aurora-primary/10 text-aurora-primary border-aurora-primary/20">
                  Master
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3 shrink-0" />
                  {master.email}
                </span>
                {master.company_name && (
                  <span className="flex items-center gap-1 truncate">
                    <Building2 className="h-3 w-3 shrink-0" />
                    {master.company_name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Badge com contador de membros e botão de expansão - UI melhorada */}
          <div className="flex items-center gap-3 shrink-0">
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-border bg-surface-elevated hover:bg-aurora-primary/5 hover:border-aurora-primary/50 cursor-pointer transition-all duration-200 group"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              <Users className="h-4 w-4 text-aurora-primary group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-foreground">
                {memberCount}
              </span>
              <span className="text-sm text-muted-foreground">
                {memberCount === 1 ? 'membro' : 'membros'}
              </span>
              <ChevronDown 
                className={cn(
                  "h-5 w-5 text-aurora-primary transition-all duration-300 ml-1",
                  isExpanded && "rotate-180",
                  "group-hover:scale-110"
                )}
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageTeam}
              className="gap-2 hover:bg-aurora-primary/10 hover:text-aurora-primary hover:border-aurora-primary/50 transition-all"
            >
              <Settings className="h-4 w-4" />
              Gerenciar Equipe
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Informações do Master */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {master.company_name && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-3 w-3 text-muted-foreground" />
              <span className="truncate">{master.company_name}</span>
            </div>
          )}
          {master.industry && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">•</span>
              <span className="truncate">{master.industry}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Criado {formatDate(master.created_at)}</span>
          </div>
        </div>

        {/* Ações do Master */}
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEditUser?.(master)}
            className="flex-1"
          >
            <User className="h-3 w-3 mr-1" />
            Editar Master
          </Button>
        </div>

        {/* Lista de Membros da Equipe (Expansível) */}
        {isExpanded && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Membros da Equipe ({isLoadingMembers ? '...' : teamMembers.length})
            </h4>
            {isLoadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Carregando membros...</span>
              </div>
            ) : teamMembers.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {teamMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-accent/10 hover:bg-surface-accent/20 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar_url || ''} alt={member.name || member.email} />
                      <AvatarFallback className="text-xs">
                        {getInitials(member.name || '', member.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">
                        {member.name || 'Sem nome'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {member.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {member.user_roles?.name || 'Membro'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEditUser?.(member)}
                      className="h-6 w-6 p-0"
                    >
                      <User className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Este master não possui membros de equipe</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};