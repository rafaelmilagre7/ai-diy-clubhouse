import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Users, Calendar, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data
const mockGoals = [
  {
    id: '1',
    title: 'Fechar 3 parcerias estratégicas',
    description: 'Estabelecer parcerias comerciais para expansão do mercado',
    deadline: '30 Junho 2024',
    progress: 66,
    current: 2,
    target: 3,
    type: 'partnerships',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Conectar com 10 CEOs de startups',
    description: 'Ampliar network executivo no ecossistema de inovação',
    deadline: '15 Julho 2024',
    progress: 40,
    current: 4,
    target: 10,
    type: 'networking',
    priority: 'medium'
  }
];

export const GoalsGrid = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-textPrimary flex items-center gap-2">
            <Target className="h-5 w-5 text-viverblue" />
            Metas de Networking
          </h2>
          <p className="text-sm text-textSecondary">
            Acompanhe seus objetivos e conquistas em networking
          </p>
        </div>
        <Button 
          size="sm" 
          className="bg-viverblue hover:bg-viverblue/90 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Nova Meta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockGoals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GoalCard goal={goal} />
          </motion.div>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <StatsCard 
          title="Conexões este mês"
          value="8"
          change="+25%"
          icon={Users}
          positive
        />
        <StatsCard 
          title="Taxa de conversão"
          value="73%"
          change="+12%"
          icon={TrendingUp}
          positive
        />
        <StatsCard 
          title="Reuniões agendadas"
          value="5"
          change="+67%"
          icon={Calendar}
          positive
        />
      </div>
    </div>
  );
};

interface GoalCardProps {
  goal: typeof mockGoals[0];
}

const GoalCard = ({ goal }: GoalCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/10 text-green-400 border-green-500/30';
      default: return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'partnerships': return TrendingUp;
      case 'networking': return Users;
      default: return Target;
    }
  };

  const TypeIcon = getTypeIcon(goal.type);

  return (
    <Card className="h-full overflow-hidden hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 border-neutral-800/50 bg-[#151823]">
      <CardHeader className="pb-4 pt-6 px-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-viverblue/10 rounded-lg">
              <TypeIcon className="h-4 w-4 text-viverblue" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white line-clamp-2 text-sm">{goal.title}</h3>
            </div>
          </div>
          <Badge className={`text-xs ${getPriorityColor(goal.priority)}`}>
            {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Média' : 'Baixa'}
          </Badge>
        </div>
        
        <p className="text-xs text-neutral-400 line-clamp-2">{goal.description}</p>
      </CardHeader>

      <CardContent className="px-6 pb-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400">Progresso</span>
            <span className="text-viverblue font-medium">{goal.current}/{goal.target}</span>
          </div>
          <Progress value={goal.progress} className="h-2" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">{goal.progress}% concluído</span>
            <span className="text-neutral-500">📅 {goal.deadline}</span>
          </div>
        </div>

        <Button 
          size="sm" 
          className="w-full bg-viverblue hover:bg-viverblue/90 text-white text-xs"
        >
          Ver detalhes
        </Button>
      </CardContent>
    </Card>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: any;
  positive: boolean;
}

const StatsCard = ({ title, value, change, icon: Icon, positive }: StatsCardProps) => {
  return (
    <Card className="border-neutral-800/50 bg-[#151823]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            <p className={`text-xs mt-1 ${positive ? 'text-green-400' : 'text-red-400'}`}>
              {change} vs mês anterior
            </p>
          </div>
          <div className="p-2 bg-viverblue/10 rounded-lg">
            <Icon className="h-5 w-5 text-viverblue" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};