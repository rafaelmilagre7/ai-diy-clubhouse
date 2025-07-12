import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageCircle, Sparkles, TrendingUp, Users, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data - Em produção virá da API/banco
const mockMatches = [
  {
    id: '1',
    name: 'Carlos Mendes',
    company: 'TechFlow Solutions',
    role: 'CEO',
    industry: 'Tecnologia',
    compatibility: 92,
    type: 'Parceria Estratégica',
    aiReason: 'Complementaridade perfeita: sua expertise em e-commerce + experiência dele em automação',
    strengths: ['Visão estratégica', 'Network consolidado', 'Inovação'],
    location: 'São Paulo, SP',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Ana Costa',
    company: 'Growth Marketing Pro',
    role: 'Diretora de Marketing',
    industry: 'Marketing Digital',
    compatibility: 87,
    type: 'Potencial Cliente',
    aiReason: 'Alto potencial de conversão: procura soluções de IA para otimizar campanhas',
    strengths: ['Performance Marketing', 'Growth Hacking', 'Dados'],
    location: 'Rio de Janeiro, RJ',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b85-4e45?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Pedro Silva',
    company: 'InnovaCorp',
    role: 'CTO',
    industry: 'Fintech',
    compatibility: 84,
    type: 'Mentorship',
    aiReason: 'Mentor ideal: 15 anos implementando IA em fintechs, pode acelerar seu crescimento',
    strengths: ['IA Aplicada', 'Escalabilidade', 'Liderança'],
    location: 'Florianópolis, SC',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  }
];

export const MatchesGrid = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-textPrimary flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-viverblue" />
            Matches desta semana
          </h2>
          <p className="text-sm text-textSecondary">
            Conexões estratégicas selecionadas pela IA baseadas no seu perfil
          </p>
        </div>
        <Badge className="bg-viverblue/10 text-viverblue border-viverblue/30">
          {mockMatches.length} novos matches
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockMatches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MatchCard match={match} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

interface MatchCardProps {
  match: typeof mockMatches[0];
}

const MatchCard = ({ match }: MatchCardProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Parceria Estratégica': return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'Potencial Cliente': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Mentorship': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default: return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Parceria Estratégica': return TrendingUp;
      case 'Potencial Cliente': return Users;
      case 'Mentorship': return Brain;
      default: return Users;
    }
  };

  const TypeIcon = getTypeIcon(match.type);

  return (
    <Card className="h-full overflow-hidden hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 border-neutral-800/50 bg-[#151823] group">
      <CardHeader className="pb-4 pt-6 px-6">
        {/* Header com foto e compatibility */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={match.avatar} 
                alt={match.name}
                className="h-12 w-12 rounded-full object-cover border-2 border-neutral-700"
              />
              <div className="absolute -bottom-1 -right-1 bg-viverblue rounded-full p-1">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white line-clamp-1">{match.name}</h3>
              <p className="text-sm text-neutral-400 line-clamp-1">{match.role}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-xs text-viverblue bg-viverblue/10 px-2 py-1 rounded-full">
              <Brain className="h-3 w-3" />
              {match.compatibility}%
            </div>
          </div>
        </div>

        {/* Company e Type */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-neutral-300">
            <Building2 className="h-4 w-4" />
            <span className="line-clamp-1">{match.company}</span>
          </div>
          <Badge className={`w-fit text-xs ${getTypeColor(match.type)}`}>
            <TypeIcon className="h-3 w-3 mr-1" />
            {match.type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 space-y-4">
        {/* AI Analysis */}
        <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700/50">
          <p className="text-xs text-neutral-300 leading-relaxed">
            <span className="text-viverblue font-medium">IA diz:</span> {match.aiReason}
          </p>
        </div>

        {/* Strengths */}
        <div>
          <p className="text-xs text-neutral-400 mb-2">Pontos fortes:</p>
          <div className="flex flex-wrap gap-1">
            {match.strengths.map((strength, i) => (
              <Badge 
                key={i} 
                variant="outline" 
                className="text-xs bg-neutral-800 text-neutral-300 border-neutral-700"
              >
                {strength}
              </Badge>
            ))}
          </div>
        </div>

        {/* Location */}
        <p className="text-xs text-neutral-500">{match.location}</p>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex-1 bg-viverblue hover:bg-viverblue/90 text-white text-xs"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Conectar
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800/50 text-xs"
          >
            Ver perfil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};