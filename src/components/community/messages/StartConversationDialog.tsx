
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Search, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getInitials } from '@/utils/user';
import { useAuth } from '@/contexts/auth';

interface Member {
  id: string;
  name: string;
  avatar_url?: string;
  company_name?: string;
  current_position?: string;
}

interface StartConversationDialogProps {
  onSelectMember: (memberId: string) => void;
}

export const StartConversationDialog: React.FC<StartConversationDialogProps> = ({
  onSelectMember
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['community-members-search', searchTerm],
    queryFn: async (): Promise<Member[]> => {
      if (!user?.id) return [];

      let query = supabase
        .from('profiles')
        .select('id, name, avatar_url, company_name, current_position')
        .neq('id', user.id)
        .limit(10);

      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: open
  });

  const handleSelectMember = (memberId: string) => {
    onSelectMember(memberId);
    setOpen(false);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <MessageSquare className="h-4 w-4 mr-2" />
          Nova Conversa
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar Nova Conversa</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar membros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3 animate-pulse">
                      <div className="h-10 w-10 bg-muted rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum membro encontrado' : 'Digite para buscar membros'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {members.map((member) => (
                <Card 
                  key={member.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSelectMember(member.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{member.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {member.current_position}
                          {member.current_position && member.company_name && ' • '}
                          {member.company_name}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
