import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Calendar, CheckCircle2, Clock, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data
const mockConnections = [
  {
    id: '1',
    name: 'Maria Santos',
    company: 'DataDriven Co.',
    role: 'Head of Sales',
    status: 'active',
    lastContact: '2 dias atrás',
    nextAction: 'Agendar reunião de follow-up',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    industry: 'SaaS'
  },
  {
    id: '2',
    name: 'João Oliveira',
    company: 'StartupXYZ',
    role: 'Founder',
    status: 'pending',
    lastContact: '1 semana atrás',
    nextAction: 'Aguardando resposta da proposta',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    industry: 'E-commerce'
  },
  {
    id: '3',
    name: 'Laura Costa',
    company: 'TechBoost',
    role: 'COO',
    status: 'completed',
    lastContact: '3 dias atrás',
    nextAction: 'Parceria finalizada ✅',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b85-4e45?w=100&h=100&fit=crop&crop=face',
    industry: 'Consultoria'
  }
];

export const ConnectionsGrid = () => {
  const activeConnections = mockConnections.filter(c => c.status === 'active').length;
  const pendingConnections = mockConnections.filter(c => c.status === 'pending').length;

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
            {activeConnections} ativas
          </Badge>
          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
            {pendingConnections} pendentes
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockConnections.map((connection, index) => (
          <motion.div
            key={connection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ConnectionCard connection={connection} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

interface ConnectionCardProps {
  connection: typeof mockConnections[0];
}

const ConnectionCard = ({ connection }: ConnectionCardProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': 
        return { 
          color: 'bg-green-500/10 text-green-400 border-green-500/30',
          icon: CheckCircle2,
          label: 'Ativa'
        };
      case 'pending': 
        return { 
          color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
          icon: Clock,
          label: 'Pendente'
        };
      case 'completed': 
        return { 
          color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          icon: CheckCircle2,
          label: 'Concluída'
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

  return (
    <Card className="h-full overflow-hidden hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 border-neutral-800/50 bg-[#151823]">
      <CardHeader className="pb-4 pt-6 px-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <img 
              src={connection.avatar} 
              alt={connection.name}
              className="h-12 w-12 rounded-full object-cover border-2 border-neutral-700"
            />
            <div>
              <h3 className="font-semibold text-white line-clamp-1">{connection.name}</h3>
              <p className="text-sm text-neutral-400 line-clamp-1">{connection.role}</p>
            </div>
          </div>
          <Badge className={`text-xs ${statusConfig.color}`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-neutral-300">
          <Building2 className="h-4 w-4" />
          <span className="line-clamp-1">{connection.company}</span>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 space-y-4">
        <div className="space-y-2">
          <div className="text-xs text-neutral-400">
            Último contato: <span className="text-neutral-300">{connection.lastContact}</span>
          </div>
          <div className="text-xs">
            <span className="text-neutral-400">Próxima ação:</span>
            <p className="text-neutral-300 mt-1">{connection.nextAction}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex-1 bg-viverblue hover:bg-viverblue/90 text-white text-xs"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Mensagem
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800/50 text-xs"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Agendar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};