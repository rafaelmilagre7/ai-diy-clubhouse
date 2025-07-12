import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Calendar, CheckCircle2, Clock, Building2, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnections } from '@/hooks/useConnections';
import LoadingScreen from '@/components/common/LoadingScreen';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChatWindow } from './ChatWindow';
import { MeetingScheduler } from './MeetingScheduler';
import { useState } from 'react';

export const ConnectionsGrid = () => {
  const { connections, isLoading } = useConnections();
  const [activeChat, setActiveChat] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingScreen message="Carregando conexões..." />;
  }

  const acceptedConnections = connections.filter(c => c.status === 'accepted');
  const pendingConnections = connections.filter(c => c.status === 'pending');

  if (!acceptedConnections.length) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="flex justify-center">
          <div className="bg-viverblue/10 rounded-full p-4">
            <Users className="h-8 w-8 text-viverblue" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-textPrimary mb-2">Nenhuma conexão ainda</h3>
          <p className="text-textSecondary">
            Suas conexões aceitas aparecerão aqui. Vá para a aba Matches para encontrar novas oportunidades!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-textPrimary">Suas Conexões</h2>
          <p className="text-sm text-textSecondary">
            Gerencie e acompanhe suas conexões de networking
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
            {acceptedConnections.length} ativas
          </Badge>
          {pendingConnections.length > 0 && (
            <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
              {pendingConnections.length} pendentes
            </Badge>
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
              onOpenChat={() => setActiveChat(connection.id)}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeChat && (
          <ChatWindow
            connection={acceptedConnections.find(c => c.id === activeChat)!}
            onClose={() => setActiveChat(null)}
          />
        )}
      </AnimatePresence>
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
    <Card className="h-full overflow-hidden hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 border-neutral-800/50 bg-[#151823]">
      <CardHeader className="pb-4 pt-6 px-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <img 
              src={avatar} 
              alt={otherUser.name}
              className="h-12 w-12 rounded-full object-cover border-2 border-neutral-700"
            />
            <div>
              <h3 className="font-semibold text-white line-clamp-1">{otherUser.name}</h3>
              <p className="text-sm text-neutral-400 line-clamp-1">{otherUser.current_position || 'Profissional'}</p>
            </div>
          </div>
          <Badge className={`text-xs ${statusConfig.color}`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-neutral-300">
          <Building2 className="h-4 w-4" />
          <span className="line-clamp-1">{otherUser.company_name || 'Empresa'}</span>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 space-y-4">
        <div className="space-y-2">
          <div className="text-xs text-neutral-400">
            Conectados: <span className="text-neutral-300">{timeAgo}</span>
          </div>
          <div className="text-xs">
            <span className="text-neutral-400">Status:</span>
            <p className="text-neutral-300 mt-1">
              {connection.status === 'accepted' ? 'Parceria ativa' : 'Aguardando confirmação'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex-1 bg-viverblue hover:bg-viverblue/90 text-white text-xs"
            onClick={onOpenChat}
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Mensagem
          </Button>
          <MeetingScheduler
            participantId={otherUser.id}
            participantName={otherUser.name}
            connectionId={connection.id}
          />
        </div>
      </CardContent>
    </Card>
  );
};