import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageCircle, Sparkles, TrendingUp, Users, Building2, Loader2, UserCheck, Mail, Phone, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStrategicMatches } from '@/hooks/useStrategicMatches';
import { useAIMatches } from '@/hooks/useAIMatches';
import { useAuth } from '@/contexts/auth';
import LoadingScreen from '@/components/common/LoadingScreen';
import { ConnectionButton } from './ConnectionButton';
import { ChatWindow } from './ChatWindow';
import { ContactModal } from './ContactModal';
import { MatchFilters } from './MatchFilters';

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
  const [activeChatMatch, setActiveChatMatch] = useState<string | null>(null);
  const [contactModalUser, setContactModalUser] = useState<{id: string, name: string, email?: string, whatsapp_number?: string, linkedin_url?: string, avatar_url?: string, company_name?: string, current_position?: string} | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    matchType: 'all',
    minCompatibility: 0,
    sortBy: 'compatibility'
  });
  
  const { matches, isLoading, error, refetch } = useStrategicMatches();
  const { generateMatches, isGenerating } = useAIMatches();
  const { user } = useAuth();

  // Filtrar e ordenar matches
  const filteredMatches = useMemo(() => {
    let filtered = matches.filter(match => {
      // Filtro de busca
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          match.matched_user?.name?.toLowerCase().includes(searchTerm) ||
          match.matched_user?.company_name?.toLowerCase().includes(searchTerm) ||
          match.matched_user?.industry?.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Filtro de tipo
      if (filters.matchType !== 'all' && match.match_type !== filters.matchType) {
        return false;
      }

      // Filtro de compatibilidade
      if (match.compatibility_score < filters.minCompatibility) {
        return false;
      }

      return true;
    });

    // Ordenação
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'compatibility':
          return b.compatibility_score - a.compatibility_score;
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'name':
          return (a.matched_user?.name || '').localeCompare(b.matched_user?.name || '');
        case 'company':
          return (a.matched_user?.company_name || '').localeCompare(b.matched_user?.company_name || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [matches, filters]);

  const handleGenerateMatches = async () => {
    if (user?.id) {
      try {
        await generateMatches(user.id);
        // Aguardar um pouco e recarregar
        setTimeout(() => {
          refetch();
        }, 1000);
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/50 to-muted/30 border border-dashed border-border/50 p-12">
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="relative flex flex-col items-center text-center space-y-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-primary/10 rounded-full p-6">
              <Brain className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Nenhum match encontrado
            </h3>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Gere matches personalizados com nossa IA para encontrar as melhores oportunidades de networking
            </p>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <button 
              onClick={handleGenerateMatches}
              disabled={isGenerating || !user?.id}
              className="relative bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Gerando Matches...
                </div>
              ) : (
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Gerar Matches IA
              </div>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-heading font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg"></div>
              <Brain className="relative h-6 w-6 text-primary" />
            </div>
            Matches IA
          </h2>
          <p className="text-muted-foreground">
            Conexões estratégicas personalizadas pela IA baseadas no seu perfil
          </p>
        </div>
        
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
          <button 
            onClick={handleGenerateMatches}
            disabled={isGenerating || !user?.id}
            className="relative bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando...
              </div>
            ) : (
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Gerar Matches IA
            </div>
            )}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <MatchFilters 
        onFilterChange={setFilters}
        matchesCount={filteredMatches.length}
      />

      {/* Mensagem quando não há matches após filtro */}
      {matches.length > 0 && filteredMatches.length === 0 && (
        <div className="text-center py-10 space-y-4">
          <div className="text-muted-foreground">
            <p className="text-lg">Nenhum match encontrado com os filtros aplicados</p>
            <p className="text-sm">Tente ajustar os filtros para ver mais resultados</p>
          </div>
        </div>
      )}

      {/* Grid de Matches */}
      {filteredMatches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MatchCard 
              match={match} 
              onOpenChat={() => setActiveChatMatch(match.id)}
              onShowContact={() => setContactModalUser({
                id: match.matched_user_id,
                name: match.matched_user?.name || 'Usuário',
                email: match.matched_user?.email,
                whatsapp_number: match.matched_user?.whatsapp_number,
                linkedin_url: match.matched_user?.linkedin_url,
                avatar_url: match.matched_user?.avatar_url,
                company_name: match.matched_user?.company_name,
                current_position: match.matched_user?.current_position,
              })}
            />
          </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {activeChatMatch && (
          <ChatWindow
              connection={{
              id: activeChatMatch,
              requester_id: user?.id || '',
              recipient_id: matches.find(m => m.id === activeChatMatch)?.matched_user_id || '',
              recipient: {
                ...matches.find(m => m.id === activeChatMatch)?.matched_user,
                id: matches.find(m => m.id === activeChatMatch)?.matched_user_id || '',
                name: matches.find(m => m.id === activeChatMatch)?.matched_user?.name || 'Usuário'
              }
            }}
            onClose={() => setActiveChatMatch(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal de contato */}
      <ContactModal
        isOpen={!!contactModalUser}
        onClose={() => setContactModalUser(null)}
        userId={contactModalUser?.id || ''}
        userName={contactModalUser?.name || ''}
        initialData={{
          email: contactModalUser?.email,
          whatsapp_number: contactModalUser?.whatsapp_number,
          linkedin_url: contactModalUser?.linkedin_url,
          avatar_url: contactModalUser?.avatar_url,
          company_name: contactModalUser?.company_name,
          current_position: contactModalUser?.current_position,
        }}
      />
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
    match_reason?: string;
    why_connect?: string;
    opportunities?: string[];
    ice_breaker?: string;
    ai_analysis?: {
      strengths?: string[];
      opportunities?: string[];
      recommended_approach?: string;
      match_type?: string;
      persona_alignment?: number;
      strategic_fit?: number;
      networking_score_delta?: number;
    };
    matched_user?: {
      id: string;
      name?: string;
      email?: string;
      company_name?: string;
      current_position?: string;
      industry?: string;
      avatar_url?: string;
      linkedin_url?: string;
      whatsapp_number?: string;
      professional_bio?: string;
      phone?: string;
      full_company_name?: string;
      full_position?: string;
      full_industry?: string;
      company_size?: string;
      annual_revenue?: string;
    } | null;
  };
  onOpenChat: () => void;
  onShowContact: () => void;
}

const MatchCard = ({ match, onOpenChat, onShowContact }: MatchCardProps) => {
  // Proteção contra matched_user null
  if (!match.matched_user) {
    return (
      <Card className="h-full overflow-hidden bg-card/95 backdrop-blur-sm border border-border/50">
        <CardContent className="p-6 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Dados do usuário não disponíveis</p>
        </CardContent>
      </Card>
    );
  }

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
  const userName = match.matched_user.name || 'Usuário';
  const avatar = match.matched_user.avatar_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0D8ABC&color=fff`;

  return (
    <div className="group relative">
      {/* Efeito de glow no hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <Card className="relative h-full overflow-hidden bg-card/95 backdrop-blur-sm border border-border/50 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.02] hover:-translate-y-2 transition-all duration-500 transform-gpu will-change-transform">
        <CardHeader className="pb-4 pt-6 px-6">
          {/* Header com foto e compatibility */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative group/avatar">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 to-transparent rounded-full blur opacity-75 group-hover/avatar:opacity-100 transition duration-300"></div>
                <div className="relative h-16 w-16 rounded-full border-2 border-border/50 shadow-lg overflow-hidden bg-muted flex-shrink-0">
                  <img 
                    src={avatar} 
                    alt={userName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0D8ABC&color=fff&size=64`;
                    }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 shadow-lg">
                  <Brain className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-foreground line-clamp-1 text-base">{userName}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{match.matched_user.current_position || 'Profissional'}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                <Brain className="h-3 w-3" />
                {Math.round(match.compatibility_score)}%
              </div>
            </div>
          </div>

          {/* Company e Type */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="line-clamp-1">{match.matched_user.company_name || 'Empresa'}</span>
            </div>
            <div className={`w-fit text-xs px-3 py-1.5 rounded-full border ${getTypeColor(translatedType)}`}>
              <div className="flex items-center gap-1">
                <TypeIcon className="h-3 w-3" />
                {translatedType}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 space-y-4">
          {/* AI Analysis */}
          <div className="relative overflow-hidden bg-muted/50 backdrop-blur rounded-xl p-4 border border-border/30">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
            <p className="relative text-xs text-muted-foreground leading-relaxed">
              <span className="text-primary font-medium">IA diz:</span> {match.why_connect || match.match_reason || match.ai_analysis?.recommended_approach || `${userName} tem alta compatibilidade com seu perfil profissional. Recomendo iniciar uma conversa sobre ${match.match_type === 'customer' ? 'oportunidades de negócio' : match.match_type === 'partner' ? 'possíveis parcerias estratégicas' : 'colaboração mútua'}.`}
            </p>
          </div>

          {/* Opportunities or Strengths */}
          {((match.opportunities && match.opportunities.length > 0) || (match.ai_analysis?.strengths && match.ai_analysis.strengths.length > 0)) && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              {match.opportunities ? 'Oportunidades:' : 'Pontos fortes:'}
            </p>
            <div className="flex flex-wrap gap-1">
              {(match.opportunities || match.ai_analysis?.strengths || []).slice(0, 3).map((item, i) => (
                <div 
                  key={i} 
                  className="text-xs bg-muted/80 text-muted-foreground border border-border/50 px-2 py-1 rounded-lg"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Industry */}
          <p className="text-xs text-muted-foreground/80">{match.matched_user.industry || 'Tecnologia'}</p>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {match.matched_user.linkedin_url ? (
              <>
                <Button
                  onClick={() => window.open(match.matched_user.linkedin_url, '_blank')}
                  size="sm"
                  className="text-xs bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white flex-1"
                >
                  <Linkedin className="h-3 w-3 mr-1" />
                  LinkedIn
                </Button>
                <Button
                  onClick={onShowContact}
                  size="sm"
                  variant="outline"
                  className="text-xs flex-1"
                >
                  <UserCheck className="h-3 w-3 mr-1" />
                  Contato
                </Button>
              </>
            ) : (
              <Button
                onClick={onShowContact}
                className="w-full text-xs bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
              >
                <UserCheck className="h-3 w-3 mr-1" />
                Ver Contato
              </Button>
            )}
          </div>
        </CardContent>

        {/* Indicador de hover */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      </Card>
    </div>
  );
};