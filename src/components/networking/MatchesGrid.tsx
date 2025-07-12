import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageCircle, Sparkles, TrendingUp, Users, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNetworkingProfiles } from '@/hooks/useNetworkingProfiles';
import LoadingScreen from '@/components/common/LoadingScreen';

// Funções auxiliares para criar dados de match baseados em perfis reais
const getMatchType = (role: string, index: number) => {
  const types = ['Parceria Estratégica', 'Potencial Cliente', 'Mentorship', 'Fornecedor'];
  if (role === 'admin') return 'Mentorship';
  return types[index % types.length];
};

const getCompatibility = () => Math.floor(Math.random() * 20) + 80; // 80-100%

const getAiReason = (type: string, name: string, company: string) => {
  const reasons = {
    'Parceria Estratégica': `Complementaridade perfeita: ${name} em ${company || 'empresa'} pode ser parceiro estratégico`,
    'Potencial Cliente': `Alto potencial: ${name} busca soluções de IA para ${company || 'sua empresa'}`,
    'Mentorship': `Mentor ideal: ${name} tem experiência para acelerar seu crescimento`,
    'Fornecedor': `Expertise técnica: ${name} pode fornecer serviços especializados`
  };
  return reasons[type] || `Ótima oportunidade de networking com ${name}`;
};

const getStrengths = (role: string, industry?: string) => {
  const strengthsByRole = {
    'admin': ['Liderança', 'Visão estratégica', 'Inovação'],
    'formacao': ['Educação', 'Desenvolvimento', 'Capacitação'],
    'membro_club': ['Networking', 'Negócios', 'Crescimento']
  };
  return strengthsByRole[role] || ['Experiência', 'Networking', 'Inovação'];
};

export const MatchesGrid = () => {
  const { data: profiles, isLoading, error } = useNetworkingProfiles();

  if (isLoading) {
    return <LoadingScreen message="Carregando matches..." />;
  }

  if (error || !profiles) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">Erro ao carregar perfis para networking</p>
      </div>
    );
  }

  // Pegar apenas os primeiros 6 perfis como matches
  const matches = profiles.slice(0, 6).map((profile, index) => ({
    id: profile.id,
    name: profile.name,
    company: profile.company_name || 'Empresa',
    role: profile.current_position || 'Profissional',
    industry: profile.industry || 'Tecnologia',
    compatibility: getCompatibility(),
    type: getMatchType(profile.role, index),
    aiReason: getAiReason(getMatchType(profile.role, index), profile.name, profile.company_name || ''),
    strengths: getStrengths(profile.role, profile.industry),
    location: 'Brasil', // Por padrão
    avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0D8ABC&color=fff`
  }));

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
          {matches.length} novos matches
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match, index) => (
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
  match: {
    id: string;
    name: string;
    company: string;
    role: string;
    industry: string;
    compatibility: number;
    type: string;
    aiReason: string;
    strengths: string[];
    location: string;
    avatar: string;
  };
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
        {/* Header com foto maior e compatibility */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={match.avatar} 
                alt={match.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-neutral-700 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 bg-viverblue rounded-full p-1.5">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white line-clamp-1 text-base">{match.name}</h3>
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