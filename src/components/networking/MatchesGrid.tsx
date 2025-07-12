import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageCircle, Sparkles, TrendingUp, Users, Building2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNetworkMatches } from '@/hooks/useNetworkMatches';
import { useAIMatches } from '@/hooks/useAIMatches';
import { useAuth } from '@/contexts/auth';
import LoadingScreen from '@/components/common/LoadingScreen';
import { ConnectionButton } from './ConnectionButton';

// Função para traduzir tipos de match
const translateMatchType = (type: string) => {
  const translations = {
    'customer': 'Potencial Cliente',
    'supplier': 'Fornecedor',
    'partner': 'Parceria Estratégica',
    'mentor': 'Mentorship',
    'ai_generated': 'Match IA',
    'strategic': 'Estratégico'
  };
  return translations[type] || type;
};

export const MatchesGrid = () => {
  const { matches, isLoading, error, refetch } = useNetworkMatches();
  const { generateMatches, isGenerating } = useAIMatches();
  const { user } = useAuth();

  const handleGenerateMatches = async () => {
    if (user?.id) {
      try {
        await generateMatches(user.id);
        refetch(); // Atualizar a lista de matches
      } catch (error) {
        console.error('Erro ao gerar matches:', error);
      }
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando matches..." />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">Erro ao carregar matches de networking</p>
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="flex justify-center">
          <div className="bg-viverblue/10 rounded-full p-4">
            <Sparkles className="h-8 w-8 text-viverblue" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-textPrimary mb-2">Nenhum match encontrado</h3>
          <p className="text-textSecondary mb-4">
            Gere matches personalizados com nossa IA para encontrar as melhores oportunidades de networking
          </p>
          <Button 
            onClick={handleGenerateMatches}
            disabled={isGenerating || !user?.id}
            className="bg-viverblue hover:bg-viverblue/90 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando Matches...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Matches IA
              </>
            )}
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
            <Sparkles className="h-5 w-5 text-viverblue" />
            Matches IA
          </h2>
          <p className="text-sm text-textSecondary">
            Conexões estratégicas personalizadas pela IA baseadas no seu perfil
          </p>
        </div>
        <Button 
          size="sm" 
          className="bg-viverblue hover:bg-viverblue/90 text-white"
          onClick={handleGenerateMatches}
          disabled={isGenerating || !user?.id}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-1" />
              Gerar Matches IA
            </>
          )}
        </Button>
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
    user_id: string;
    matched_user_id: string;
    match_type: string;
    compatibility_score: number;
    match_reason: string;
    ai_analysis: {
      strengths: string[];
      opportunities: string[];
      recommended_approach: string;
    };
    matched_user: {
      id: string;
      name: string;
      company_name?: string;
      current_position?: string;
      industry?: string;
      avatar_url?: string;
    };
  };
}

const MatchCard = ({ match }: MatchCardProps) => {
  const translatedType = translateMatchType(match.match_type);
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Parceria Estratégica': return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'Potencial Cliente': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Mentorship': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Fornecedor': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      default: return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Parceria Estratégica': return TrendingUp;
      case 'Potencial Cliente': return Users;
      case 'Mentorship': return Brain;
      case 'Fornecedor': return Building2;
      default: return Users;
    }
  };

  const TypeIcon = getTypeIcon(translatedType);
  const avatar = match.matched_user.avatar_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(match.matched_user.name)}&background=0D8ABC&color=fff`;

  return (
    <Card className="h-full overflow-hidden hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 border-neutral-800/50 bg-[#151823] group">
      <CardHeader className="pb-4 pt-6 px-6">
        {/* Header com foto maior e compatibility */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={avatar} 
                alt={match.matched_user.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-neutral-700 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 bg-viverblue rounded-full p-1.5">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white line-clamp-1 text-base">{match.matched_user.name}</h3>
              <p className="text-sm text-neutral-400 line-clamp-1">{match.matched_user.current_position || 'Profissional'}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-xs text-viverblue bg-viverblue/10 px-2 py-1 rounded-full">
              <Brain className="h-3 w-3" />
              {Math.round(match.compatibility_score)}%
            </div>
          </div>
        </div>

        {/* Company e Type */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-neutral-300">
            <Building2 className="h-4 w-4" />
            <span className="line-clamp-1">{match.matched_user.company_name || 'Empresa'}</span>
          </div>
          <Badge className={`w-fit text-xs ${getTypeColor(translatedType)}`}>
            <TypeIcon className="h-3 w-3 mr-1" />
            {translatedType}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 space-y-4">
        {/* AI Analysis */}
        <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700/50">
          <p className="text-xs text-neutral-300 leading-relaxed">
            <span className="text-viverblue font-medium">IA diz:</span> {match.match_reason}
          </p>
        </div>

        {/* Strengths */}
        <div>
          <p className="text-xs text-neutral-400 mb-2">Pontos fortes:</p>
          <div className="flex flex-wrap gap-1">
            {match.ai_analysis.strengths.map((strength, i) => (
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

        {/* Industry */}
        <p className="text-xs text-neutral-500">{match.matched_user.industry || 'Tecnologia'}</p>

        {/* Actions */}
        <div className="flex gap-2">
          <ConnectionButton 
            userId={match.matched_user_id}
            className="flex-1 text-xs"
          />
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