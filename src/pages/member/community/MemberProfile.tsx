
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ForumHeader } from '@/components/community/ForumHeader';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { Profile } from '@/types/forumTypes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, MessageSquare } from 'lucide-react';

const MemberProfilePage = () => {
  const { memberId } = useParams<{ memberId: string }>();

  const { data: member, isLoading } = useQuery({
    queryKey: ['forum-member', memberId],
    queryFn: async () => {
      if (!memberId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', memberId)
        .single();
        
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!memberId
  });

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        section="membro"
        sectionTitle={member?.name || 'Perfil de Membro'}
      />
      
      <ForumHeader
        title={member?.name || 'Carregando...'}
        description={`Membro da comunidade VIVER DE IA`}
      />
      
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-neutral-800 rounded"></div>
          <div className="h-24 bg-neutral-800 rounded"></div>
        </div>
      ) : member ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center p-6 bg-card rounded-lg border">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={member.avatar_url || ''} alt={member.name || 'Usuário'} />
              <AvatarFallback>
                {member.name?.charAt(0) || <User />}
              </AvatarFallback>
            </Avatar>
            
            <h2 className="text-xl font-bold">{member.name}</h2>
            
            {member.current_position && (
              <p className="text-muted-foreground mb-2">{member.current_position}</p>
            )}
            
            {member.company_name && (
              <p className="text-muted-foreground">{member.company_name}</p>
            )}
            
            <div className="mt-4">
              <Button variant="outline" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                Enviar Mensagem
              </Button>
            </div>
          </div>
          
          <div className="md:col-span-2 p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Sobre</h3>
            {member.professional_bio ? (
              <p>{member.professional_bio}</p>
            ) : (
              <p className="text-muted-foreground">Sem biografia disponível.</p>
            )}
            
            {member.skills && member.skills.length > 0 && (
              <>
                <h3 className="text-lg font-medium mt-6 mb-2">Habilidades</h3>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium">Membro não encontrado</h3>
          <p className="text-muted-foreground">
            O perfil que você está procurando não existe ou foi removido.
          </p>
        </div>
      )}
    </div>
  );
};

export default MemberProfilePage;
