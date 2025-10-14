import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageCircle, Search, Users, Clock, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnections } from '@/hooks/useConnections';
import { useAuth } from '@/contexts/auth';
import LoadingScreen from '@/components/common/LoadingScreen';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { InboxDrawer } from './chat/InboxDrawer';

export const MessagesGrid = () => {
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { connections, isLoading } = useConnections();
  const { user } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Carregando conversas..." />;
  }

  const acceptedConnections = connections.filter(c => c.status === 'accepted');
  
  // Filtrar conexões baseado na busca
  const filteredConnections = acceptedConnections.filter(connection => {
    const otherUser = connection.requester || connection.recipient;
    if (!otherUser) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      otherUser.name.toLowerCase().includes(searchLower) ||
      otherUser.company_name?.toLowerCase().includes(searchLower) ||
      otherUser.current_position?.toLowerCase().includes(searchLower)
    );
  });

  if (!acceptedConnections.length) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="flex justify-center">
          <div className="bg-viverblue/10 rounded-full p-4">
            <MessageCircle className="h-8 w-8 text-viverblue" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-textPrimary mb-2">Nenhuma conversa ainda</h3>
          <p className="text-textSecondary mb-4">
            Você precisa ter conexões aceitas para iniciar conversas.
          </p>
          <Button 
            onClick={() => {
              const headerElement = document.querySelector('[data-tab="connections"]') as HTMLElement;
              if (headerElement) headerElement.click();
            }}
            className="bg-viverblue hover:bg-viverblue/90 text-white"
          >
            <Users className="h-4 w-4 mr-2" />
            Ver Conexões
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-textPrimary flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-viverblue" />
            Mensagens
          </h2>
          <p className="text-sm text-textSecondary">
            Converse com suas conexões e construa relacionamentos
          </p>
        </div>
        <Badge className="bg-viverblue/10 text-viverblue border-viverblue/30">
          {acceptedConnections.length} conversas disponíveis
        </Badge>
      </div>

      {/* Barra de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Buscar conversas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-400"
        />
      </div>

      {/* Grid de conversas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConnections.map((connection, index) => (
          <motion.div
            key={connection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ConversationCard 
              connection={connection}
              onOpenChat={() => setIsInboxOpen(true)}
            />
          </motion.div>
        ))}
      </div>

      {filteredConnections.length === 0 && searchTerm && (
        <div className="text-center py-12 text-neutral-400">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Nenhuma conversa encontrada</h3>
          <p className="text-sm">Tente buscar por um nome ou empresa diferente</p>
        </div>
      )}

      <InboxDrawer
        open={isInboxOpen}
        onOpenChange={setIsInboxOpen}
      />
    </div>
  );
};

interface ConversationCardProps {
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

const ConversationCard = ({ connection, onOpenChat }: ConversationCardProps) => {
  const { user } = useAuth();
  
  // Determinar o outro usuário na conexão
  const otherUser = user?.id === connection.requester_id 
    ? connection.recipient 
    : connection.requester;
    
  if (!otherUser) return null;

  const avatar = otherUser.avatar_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=0D8ABC&color=fff`;
  
  const timeAgo = formatDistanceToNow(new Date(connection.created_at), { 
    addSuffix: true, 
    locale: ptBR 
  });

  return (
    <Card className="h-full overflow-hidden hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 border-neutral-800/50 bg-[#151823] cursor-pointer group">
      <CardHeader className="pb-4 pt-6 px-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <img 
              src={avatar} 
              alt={otherUser.name}
              className="h-12 w-12 rounded-full object-cover border-2 border-neutral-700"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-4 h-4 border-2 border-[#151823]"></div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white line-clamp-1">{otherUser.name}</h3>
            <p className="text-sm text-neutral-400 line-clamp-1">{otherUser.current_position || 'Profissional'}</p>
          </div>
        </div>

        <div className="text-sm text-neutral-300">
          <p className="line-clamp-1">{otherUser.company_name || 'Empresa'}</p>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 space-y-4">
        <div className="bg-neutral-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
            <Clock className="h-3 w-3" />
            Conectados {timeAgo}
          </div>
          <p className="text-sm text-neutral-300">
            Última atividade: {timeAgo}
          </p>
        </div>

        <Button 
          onClick={onOpenChat}
          className="w-full bg-viverblue hover:bg-viverblue/90 text-white group-hover:bg-viverblue/80"
        >
          <Send className="h-4 w-4 mr-2" />
          Abrir Conversa
        </Button>
      </CardContent>
    </Card>
  );
};