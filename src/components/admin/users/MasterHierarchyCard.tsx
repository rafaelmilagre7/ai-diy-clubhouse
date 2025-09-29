import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Crown, 
  Users, 
  ChevronDown, 
  ChevronRight, 
  Mail, 
  Building2,
  Calendar,
  User
} from 'lucide-react';
import { UserProfile } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MasterHierarchyCardProps {
  master: UserProfile;
  teamMembers?: UserProfile[];
  memberCount?: number;
  onEditUser?: (user: UserProfile) => void;
  onManageTeam?: (master: UserProfile) => void;
}

export const MasterHierarchyCard = ({ 
  master, 
  teamMembers = [],
  memberCount,
  onEditUser,
  onManageTeam 
}: MasterHierarchyCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <Card className="surface-elevated border-0 shadow-aurora">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={master.avatar_url || ''} alt={master.name || master.email} />
              <AvatarFallback className="bg-gradient-to-br from-yellow-100 to-orange-100 text-yellow-800">
                <Crown className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {master.name || 'Sem nome'}
                <Crown className="h-4 w-4 text-yellow-600" />
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Master
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                {master.email}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {memberCount !== undefined ? memberCount : teamMembers.length} membro{(memberCount !== undefined ? memberCount : teamMembers.length) !== 1 ? 's' : ''}
            </Badge>
            {teamMembers.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
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
          {teamMembers.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onManageTeam?.(master)}
              className="flex-1"
            >
              <Users className="h-3 w-3 mr-1" />
              Gerenciar Equipe
            </Button>
          )}
        </div>

        {/* Lista de Membros da Equipe (Expansível) */}
        {isExpanded && teamMembers.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Membros da Equipe ({teamMembers.length})
            </h4>
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
          </div>
        )}

        {/* Estado vazio para Masters sem equipe */}
        {teamMembers.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Este master não possui membros de equipe</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};