import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Calendar, CheckCircle2, Clock, Building2, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnections } from '@/hooks/useConnections';
import LoadingScreen from '@/components/common/LoadingScreen';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { InboxDrawer } from './chat/InboxDrawer';
import { MeetingScheduler } from './MeetingScheduler';
import { useState } from 'react';

export const ConnectionsGrid = () => {
  const { connections, isLoading } = useConnections();
  const [isInboxOpen, setIsInboxOpen] = useState(false);

  if (isLoading) {
    return <LoadingScreen message="Carregando conexões..." />;
  }

  const acceptedConnections = connections.filter(c => c.status === 'accepted');
  const pendingConnections = connections.filter(c => c.status === 'pending');

  if (!acceptedConnections.length) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/50 to-muted/30 border border-dashed border-border/50 p-12">
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="relative flex flex-col items-center text-center space-y-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-primary/10 rounded-full p-6">
              <Users className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Nenhuma conexão ainda
            </h3>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Suas conexões aceitas aparecerão aqui. Vá para a aba Matches para encontrar novas oportunidades!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-heading font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Suas Conexões
          </h2>
          <p className="text-muted-foreground">
            Gerencie e acompanhe suas conexões de networking
          </p>
        </div>
        <div className="flex gap-3">
          <div className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/30 rounded-full text-sm font-medium">
            {acceptedConnections.length} ativas
          </div>
          {pendingConnections.length > 0 && (
            <div className="px-3 py-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full text-sm font-medium">
              {pendingConnections.length} pendentes
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {acceptedConnections.map((connection, index) => (
          <motion.div
            key={connection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ConnectionCard 
              connection={connection} 
              onOpenChat={() => setIsInboxOpen(true)}
            />
          </motion.div>
        ))}
      </div>

      <InboxDrawer
        open={isInboxOpen}
        onOpenChange={setIsInboxOpen}
      />
    </div>
  );
};

interface ConnectionCardProps {
  connection: {
    id: string;
    requester_id: string;
    recipient_id: string;
    status: string;
    created_at: string;
    updated_at: string | null;
    requester?: {
      id: string;
      name: string;
      company_name?: string;
      current_position?: string;
      avatar_url?: string;
    };
    recipient?: {
      id: string;
      name: string;
      company_name?: string;
      current_position?: string;
      avatar_url?: string;
    };
  };
  onOpenChat: () => void;
}

const ConnectionCard = ({ connection, onOpenChat }: ConnectionCardProps) => {
  // Determinar o outro usuário na conexão
  const otherUser = connection.requester || connection.recipient;
  
  if (!otherUser) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'accepted': 
        return { 
          color: 'bg-green-500/10 text-green-400 border-green-500/30',
          icon: CheckCircle2,
          label: 'Conectado'
        };
      case 'pending': 
        return { 
          color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
          icon: Clock,
          label: 'Pendente'
        };
      default: 
        return { 
          color: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30',
          icon: Clock,
          label: 'Status'
        };
    }
  };

  const statusConfig = getStatusConfig(connection.status);
  const StatusIcon = statusConfig.icon;
  
  const avatar = otherUser.avatar_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=0D8ABC&color=fff`;
  
  const timeAgo = formatDistanceToNow(new Date(connection.created_at), { 
    addSuffix: true, 
    locale: ptBR 
  });

  return (
    <div className="group relative">
      {/* Efeito de glow no hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <Card className="relative h-full overflow-hidden bg-card/95 backdrop-blur-sm border border-border/50 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.02] hover:-translate-y-2 transition-all duration-500 transform-gpu will-change-transform">
        <CardHeader className="pb-4 pt-6 px-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative group/avatar">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 to-transparent rounded-full blur opacity-75 group-hover/avatar:opacity-100 transition duration-300"></div>
                <div className="relative h-12 w-12 rounded-full border-2 border-border/50 overflow-hidden bg-muted flex-shrink-0">
                  <img 
                    src={avatar} 
                    alt={otherUser.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=0D8ABC&color=fff&size=48`;
                    }}
                  />
                </div>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground line-clamp-1">{otherUser.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{otherUser.current_position || 'Profissional'}</p>
              </div>
            </div>
            <div className={`text-xs px-3 py-1.5 rounded-full border ${statusConfig.color}`}>
              <div className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span className="line-clamp-1">{otherUser.company_name || 'Empresa'}</span>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 space-y-4">
          <div className="space-y-3">
            <div className="text-xs">
              <span className="text-muted-foreground">Conectados:</span>
              <span className="text-foreground ml-1">{timeAgo}</span>
            </div>
            <div className="relative overflow-hidden bg-muted/50 backdrop-blur rounded-lg p-3 border border-border/30">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
              <div className="relative text-xs">
                <span className="text-muted-foreground">Status:</span>
                <p className="text-foreground mt-1">
                  {connection.status === 'accepted' ? 'Parceria ativa' : 'Aguardando confirmação'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <div className="flex-1 relative group/message">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-75 group-hover/message:opacity-100 transition duration-300"></div>
              <button 
                onClick={onOpenChat}
                className="relative w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-2 rounded-lg font-medium shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300 text-xs"
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageCircle className="h-3 w-3" />
                  Mensagem
                </div>
              </button>
            </div>
            
            <div className="relative group/meeting">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-muted to-transparent rounded-lg blur opacity-0 group-hover/meeting:opacity-100 transition duration-300"></div>
              <div className="relative">
                <MeetingScheduler
                  participantId={otherUser.id}
                  participantName={otherUser.name}
                  connectionId={connection.id}
                />
              </div>
            </div>
          </div>
        </CardContent>

        {/* Indicador de hover */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      </Card>
    </div>
  );
};