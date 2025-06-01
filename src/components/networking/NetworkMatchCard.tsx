
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, ChevronRight, MessageCircle, MessagesSquare, PieChart, Target, Trophy, UserCheck, UserX, Zap } from 'lucide-react';
import { NetworkMatch, useUpdateMatchStatus } from '@/hooks/networking/useNetworkMatches';

interface NetworkMatchCardProps {
  match: NetworkMatch;
  matchType: 'customer' | 'supplier';
}

export const NetworkMatchCard: React.FC<NetworkMatchCardProps> = ({
  match,
  matchType
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('perfil');
  const [isUpdating, setIsUpdating] = useState(false);
  const updateMatchStatus = useUpdateMatchStatus();

  const handleStatusUpdate = async (status: 'pending' | 'viewed' | 'contacted' | 'dismissed') => {
    try {
      setIsUpdating(true);
      await updateMatchStatus(match.id, status);
      setIsUpdating(false);
      
      if (status === 'dismissed') {
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar status do match:', error);
      setIsUpdating(false);
    }
  };

  // Formatar score como inteiro e garantir que está entre 0-100
  const compatibilityScore = Math.max(0, Math.min(100, Math.round(match.compatibility_score)));
  
  // Determina a cor do badge baseado na pontuação
  const getScoreBadgeColor = (score: number): string => {
    if (score >= 90) return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
    if (score >= 75) return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
    if (score >= 60) return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
    return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20";
  };
  
  // Determina o texto do badge baseado na pontuação
  const getScoreText = (score: number): string => {
    if (score >= 90) return "Match Excelente";
    if (score >= 75) return "Match Forte";
    if (score >= 60) return "Match Bom";
    return "Match Moderado";
  };

  // Label do tipo de match
  const matchTypeLabel = matchType === 'customer' ? 'Potencial Cliente' : 'Potencial Fornecedor';

  // Ícones para os pontos fortes
  const strengthIcons: Record<string, React.ReactNode> = {
    'Setor de atuação': <Target className="h-4 w-4" />,
    'Tamanho': <PieChart className="h-4 w-4" />,
    'Complementaridade': <Zap className="h-4 w-4" />,
    'Sinergia': <Trophy className="h-4 w-4" />,
    'Objetivos': <Target className="h-4 w-4" />,
    'Desafios': <ChevronRight className="h-4 w-4" />
  };

  // Função para obter o ícone com fallback
  const getStrengthIcon = (factor: string) => {
    const key = Object.keys(strengthIcons).find(k => factor.toLowerCase().includes(k.toLowerCase()));
    return key ? strengthIcons[key] : <Zap className="h-4 w-4" />;
  };

  // Renderizar conteúdo principal do card
  return (
    <Card className="overflow-hidden border-neutral-800 bg-neutral-900/60 backdrop-blur-sm hover:bg-neutral-900/80 transition-all h-full flex flex-col">
      <CardHeader className="pb-3 relative">
        {/* Badge de compatibilidade */}
        <Badge className={`absolute top-3 right-3 ${getScoreBadgeColor(compatibilityScore)}`}>
          {compatibilityScore}% • {getScoreText(compatibilityScore)}
        </Badge>

        {/* Avatar e nome */}
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12 border border-neutral-700">
            <AvatarImage 
              src={match.matched_user?.avatar_url || ''} 
              alt={match.matched_user?.name || 'Usuário'}
            />
            <AvatarFallback>
              {(match.matched_user?.name || 'U').substring(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{match.matched_user?.name}</CardTitle>
            <CardDescription className="text-sm">
              {match.matched_user?.current_position || ''}
              {match.matched_user?.current_position && match.matched_user?.company_name && ' • '}
              {match.matched_user?.company_name || ''}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 flex-1">
        {/* Tipo de match */}
        <div className="mb-3">
          <Badge variant="outline" className="bg-viverblue/10 text-viverblue border-viverblue/20">
            {matchTypeLabel}
          </Badge>
        </div>

        {/* Match reason */}
        <p className="text-sm text-neutral-300 mb-4">
          {match.match_reason || "Match com base em perfis complementares."}
        </p>

        {/* Pontos fortes */}
        {match.match_strengths && match.match_strengths.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {match.match_strengths.slice(0, 2).map((strength, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded-full bg-viverblue/10 flex items-center justify-center text-viverblue">
                  {getStrengthIcon(strength.factor)}
                </div>
                <div className="flex-1 text-neutral-300">
                  <span className="font-medium">{strength.factor}</span>: {strength.description}
                </div>
              </div>
            ))}
            
            {match.match_strengths.length > 2 && (
              <div className="text-xs text-neutral-400 ml-8">
                +{match.match_strengths.length - 2} outros pontos fortes
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex justify-between items-center">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="default" 
              className="w-full bg-viverblue hover:bg-viverblue/90"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Ver Detalhes
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-3xl w-full">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border border-neutral-700">
                    <AvatarImage 
                      src={match.matched_user?.avatar_url || ''} 
                      alt={match.matched_user?.name || 'Usuário'}
                    />
                    <AvatarFallback>
                      {(match.matched_user?.name || 'U').substring(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      {match.matched_user?.name}
                      <Badge className={`ml-2 ${getScoreBadgeColor(compatibilityScore)}`}>
                        {compatibilityScore}%
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-2">
                      {match.matched_user?.current_position || ''}
                      {match.matched_user?.current_position && match.matched_user?.company_name && ' • '}
                      {match.matched_user?.company_name || ''}
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Conteúdo detalhado */}
            <Tabs 
              defaultValue="perfil" 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="mt-4"
            >
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="perfil">Perfil</TabsTrigger>
                <TabsTrigger value="oportunidades">Oportunidades</TabsTrigger>
                <TabsTrigger value="contato">Conectar</TabsTrigger>
              </TabsList>

              {/* Tab de Perfil */}
              <TabsContent value="perfil" className="space-y-6 py-4">
                {/* Razão do match */}
                <div className="bg-viverblue/10 border border-viverblue/20 rounded-md p-4">
                  <h4 className="text-viverblue font-medium text-sm mb-2">Por que este match?</h4>
                  <p className="text-sm text-neutral-300">{match.match_reason}</p>
                </div>
                
                {/* Pontos fortes */}
                <div className="space-y-4">
                  <h4 className="font-medium">Pontos fortes de compatibilidade</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {match.match_strengths?.map((strength, index) => (
                      <div key={index} className="flex items-center gap-3 bg-neutral-800/50 rounded-md p-3 border border-neutral-700/50">
                        <div className="w-8 h-8 rounded-full bg-viverblue/10 flex items-center justify-center text-viverblue">
                          {getStrengthIcon(strength.factor)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{strength.factor}</span>
                            <Badge variant="outline" className="bg-viverblue/5">
                              {strength.strength}/10
                            </Badge>
                          </div>
                          <p className="text-xs text-neutral-400 mt-1">{strength.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Tópicos sugeridos */}
                {match.suggested_topics && match.suggested_topics.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Tópicos sugeridos para conversa</h4>
                    <div className="space-y-2">
                      {match.suggested_topics.map((topic, index) => (
                        <div key={index} className="flex items-center gap-2 bg-neutral-800/50 rounded-md p-3 border border-neutral-700/50">
                          <MessagesSquare className="h-5 w-5 text-viverblue" />
                          <span className="text-sm">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Informações da empresa */}
                <div className="bg-neutral-800/50 rounded-md p-4 border border-neutral-700/50">
                  <h4 className="font-medium mb-3">Informações profissionais</h4>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <div>
                      <span className="text-neutral-400">Empresa:</span>
                      <p>{match.matched_user?.company_name || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400">Cargo:</span>
                      <p>{match.matched_user?.current_position || 'Não informado'}</p>
                    </div>
                    {match.matched_user?.whatsapp_number && (
                      <div className="col-span-2">
                        <span className="text-neutral-400">WhatsApp:</span>
                        <p>{match.matched_user?.whatsapp_number}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Tab de Oportunidades de Negócio */}
              <TabsContent value="oportunidades" className="space-y-6 py-4">
                {/* Oportunidades de Negócio */}
                <div className="bg-viverblue/10 border border-viverblue/20 rounded-md p-4">
                  <h4 className="text-viverblue font-medium flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4" />
                    Análise IA de Oportunidades de Negócio
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Oportunidades */}
                    {match.ai_analysis?.opportunities && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">Oportunidades Identificadas</h5>
                        <ul className="space-y-2">
                          {match.ai_analysis.opportunities.map((opportunity: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <span>{opportunity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Abordagem Recomendada */}
                    {match.ai_analysis?.recommendedApproach && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">Abordagem Recomendada</h5>
                        <p className="text-sm bg-neutral-800/50 p-3 rounded border border-neutral-700/50">
                          {match.ai_analysis.recommendedApproach}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Tab de Contato */}
              <TabsContent value="contato" className="py-4">
                <div className="space-y-6">
                  {/* Como iniciar a conversa */}
                  <div className="bg-neutral-800/50 rounded-md p-4 border border-neutral-700/50 space-y-3">
                    <h4 className="font-medium">Como iniciar a conversa</h4>
                    <p className="text-sm">
                      Este potencial {matchType === 'customer' ? 'cliente' : 'fornecedor'} foi 
                      identificado com {compatibilityScore}% de compatibilidade com seu perfil. 
                      Você pode utilizar os tópicos sugeridos como base para iniciar uma conversa.
                    </p>
                    
                    {match.matched_user?.whatsapp_number && (
                      <div className="pt-2">
                        <a 
                          href={`https://wa.me/${match.matched_user.whatsapp_number.replace(/\D/g, '')}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-md"
                          onClick={() => handleStatusUpdate('contacted')}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.6 6.31999C16.8 5.49999 15.8 4.89999 14.7 4.49999C13.6 4.09999 12.5 3.99999 11.3 4.09999C10.1 4.19999 8.99999 4.59999 7.99999 5.19999C6.99999 5.79999 6.09999 6.59999 5.49999 7.49999C4.79999 8.49999 4.39999 9.59999 4.19999 10.8C3.99999 12 4.09999 13.2 4.39999 14.4C4.69999 15.6 5.19999 16.7 5.99999 17.6L4.79999 20.7C4.69999 21 4.79999 21.3 4.99999 21.5C5.19999 21.7 5.49999 21.8 5.79999 21.7L8.99999 20.4C9.89999 21 10.9 21.4 11.9 21.6C12.9 21.8 14 21.8 15 21.6C16.1 21.4 17.1 21 18 20.4C18.9 19.8 19.7 19 20.3 18.1C20.9 17.1 21.3 16.1 21.5 14.9C21.7 13.7 21.6 12.5 21.3 11.3C21 10.1 20.4 9.09999 19.6 8.09999C18.8 7.19999 17.9 6.49999 16.8 5.99999" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
                            <path d="M16.4 13.3C16.4 13.5 16.4 13.8 16.3 14C16.2 14.2 16 14.4 15.8 14.6C15.7 14.7 15.5 14.8 15.3 14.9C15.1 15 14.9 15 14.7 15C14.4 15 14.1 14.9 13.8 14.8C13.5 14.7 13.2 14.5 12.9 14.3C12.6 14.1 12.3 13.9 12 13.7C11.7 13.4 11.5 13.2 11.2 12.9C10.9 12.6 10.7 12.3 10.5 12C10.3 11.7 10.1 11.4 10 11.1C9.9 10.8 9.79999 10.5 9.79999 10.2C9.79999 10 9.79999 9.8 9.89999 9.6C9.99999 9.4 10.1 9.2 10.2 9.1C10.4 8.9 10.6 8.8 10.8 8.8C10.9 8.8 11 8.8 11.1 8.8C11.2 8.8 11.3 8.9 11.4 9.1L12 10.2C12 10.3 12.1 10.4 12.1 10.5C12.1 10.6 12.1 10.6 12 10.7C11.9 10.8 11.9 10.9 11.8 10.9C11.7 11 11.7 11 11.6 11.1C11.5 11.2 11.5 11.2 11.5 11.3C11.5 11.4 11.6 11.5 11.6 11.5C11.7 11.7 11.8 11.8 12 12C12.2 12.2 12.3 12.3 12.5 12.4C12.6 12.5 12.7 12.6 12.9 12.7C13 12.8 13.1 12.8 13.2 12.7C13.3 12.7 13.3 12.6 13.4 12.6C13.5 12.5 13.5 12.5 13.6 12.4C13.7 12.3 13.7 12.3 13.8 12.3C13.9 12.3 13.9 12.3 14 12.3C14.1 12.3 14.2 12.4 14.3 12.5L15.4 13.1C15.5 13.2 15.6 13.2 15.6 13.3C16.3 13.2 16.4 13.2 16.4 13.3Z" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" />
                          </svg>
                          Iniciar conversa no WhatsApp
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Botões de ação */}
                  <div className="space-y-3 pt-4">
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => handleStatusUpdate('contacted')}
                      disabled={isUpdating}
                    >
                      <UserCheck className="h-4 w-4" />
                      Marcar como contatado
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full text-neutral-400 hover:text-neutral-300"
                      onClick={() => handleStatusUpdate('dismissed')}
                      disabled={isUpdating}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Ignorar este match
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};
