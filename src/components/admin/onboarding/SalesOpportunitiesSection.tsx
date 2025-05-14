
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from '@/components/ui/scroll-area';
import { OnboardingProgress } from '@/types/onboarding';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  isLoading: boolean;
  onboardingData: OnboardingProgress[];
}

export const SalesOpportunitiesSection: React.FC<Props> = ({ isLoading, onboardingData }) => {
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [knowledgeFilter, setKnowledgeFilter] = useState('all');
  const [completionFilter, setCompletionFilter] = useState('all');
  
  // Extrair leads qualificados (com informações completas e relevantes)
  const qualifiedLeads = useMemo(() => {
    if (!onboardingData?.length) return [];
    
    // Filtrar por campos importantes
    return onboardingData
      .filter(item => {
        // Filtro por conclusão
        if (completionFilter === 'completed' && !item.is_completed) return false;
        if (completionFilter === 'incomplete' && item.is_completed) return false;
        
        // Filtro por nível de conhecimento
        const knowledgeLevel = item.ai_experience?.knowledge_level?.toLowerCase() || '';
        if (knowledgeFilter !== 'all') {
          if (knowledgeFilter === 'beginner' && 
              !(knowledgeLevel.includes('iniciante') || knowledgeLevel.includes('beginner') || 
                knowledgeLevel.includes('básico') || knowledgeLevel.includes('basic'))) {
            return false;
          }
          if (knowledgeFilter === 'intermediate' && 
              !(knowledgeLevel.includes('intermediário') || knowledgeLevel.includes('intermediate'))) {
            return false;
          }
          if (knowledgeFilter === 'advanced' && 
              !(knowledgeLevel.includes('avançado') || knowledgeLevel.includes('advanced') || 
                knowledgeLevel.includes('expert') || knowledgeLevel.includes('especialista'))) {
            return false;
          }
        }
        
        // Filtro por termo de pesquisa
        if (searchTerm) {
          const searchTermLower = searchTerm.toLowerCase();
          const personalInfo = item.personal_info || {};
          const professionalInfo = item.professional_info || {};
          
          // Verificar em vários campos
          const nameMatch = personalInfo.name?.toLowerCase().includes(searchTermLower) || false;
          const emailMatch = personalInfo.email?.toLowerCase().includes(searchTermLower) || false;
          const companyMatch = professionalInfo.company_name?.toLowerCase().includes(searchTermLower) || 
                              item.company_name?.toLowerCase().includes(searchTermLower) || false;
          const sectorMatch = professionalInfo.company_sector?.toLowerCase().includes(searchTermLower) || 
                             item.company_sector?.toLowerCase().includes(searchTermLower) || false;
          
          if (!(nameMatch || emailMatch || companyMatch || sectorMatch)) {
            return false;
          }
        }
        
        return true;
      })
      // Classificar leads por potencial (completados primeiro, depois por data)
      .sort((a, b) => {
        // Priorizar onboardings completados
        if (a.is_completed && !b.is_completed) return -1;
        if (!a.is_completed && b.is_completed) return 1;
        
        // Depois ordenar por data de atualização (mais recente primeiro)
        const dateA = new Date(a.updated_at || '').getTime();
        const dateB = new Date(b.updated_at || '').getTime();
        return dateB - dateA;
      });
  }, [onboardingData, searchTerm, knowledgeFilter, completionFilter]);
  
  // Calcular interesse principal para cada lead
  const getPrimaryInterest = (lead: OnboardingProgress): string => {
    // Verificar primeiramente o objetivo declarado
    const primaryGoal = lead.business_goals?.primary_goal;
    if (primaryGoal) return primaryGoal;
    
    // Segundo, verificar desafios de negócio
    const challenges = lead.business_context?.business_challenges;
    if (Array.isArray(challenges) && challenges.length > 0) {
      return challenges[0];
    }
    
    // Terceiro, verificar áreas de interesse em IA
    const aiAreas = lead.ai_experience?.desired_ai_areas;
    if (Array.isArray(aiAreas) && aiAreas.length > 0) {
      return aiAreas[0];
    }
    
    // Sem informação específica
    return 'Não especificado';
  };
  
  // Calcular nível de interesse/oportunidade (1-5)
  const getOpportunityScore = (lead: OnboardingProgress): number => {
    let score = 0;
    
    // Onboarding completo
    if (lead.is_completed) score += 2;
    
    // Tem informações de contato completas
    if (lead.personal_info?.name && lead.personal_info?.email && lead.personal_info?.phone) score += 1;
    
    // Tem informações da empresa
    if (lead.company_name || lead.professional_info?.company_name) score += 1;
    
    // Tem interesse declarado em lives ou mentorias (interesse em conteúdo)
    const liveInterest = lead.business_goals?.live_interest;
    if (typeof liveInterest === 'number' && liveInterest >= 4) score += 1;
    
    // Ajuste para ficar na escala 1-5
    return Math.max(1, Math.min(5, score));
  };
  
  // Obter nome legível para o nível de conhecimento
  const getKnowledgeLevelLabel = (lead: OnboardingProgress): string => {
    const level = lead.ai_experience?.knowledge_level?.toLowerCase() || '';
    
    if (level.includes('iniciante') || level.includes('beginner') || 
        level.includes('básico') || level.includes('basic')) {
      return 'Iniciante';
    }
    if (level.includes('intermediário') || level.includes('intermediate')) {
      return 'Intermediário';
    }
    if (level.includes('avançado') || level.includes('advanced')) {
      return 'Avançado';
    }
    if (level.includes('expert') || level.includes('especialista')) {
      return 'Especialista';
    }
    
    return 'Não especificado';
  };

  // Formatar nome da empresa
  const getCompanyName = (lead: OnboardingProgress): string => {
    return lead.company_name || 
           lead.professional_info?.company_name || 
           'N/A';
  };
  
  // Formatar setor da empresa
  const getCompanySector = (lead: OnboardingProgress): string => {
    return lead.company_sector || 
           lead.professional_info?.company_sector || 
           'N/A';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gray-800">
          <CardHeader>
            <Skeleton className="h-5 w-48 bg-gray-700" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full bg-gray-700 mb-4" />
            <Skeleton className="h-64 w-full bg-gray-700" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Oportunidades de Vendas */}
      <Card className="bg-gray-800">
        <CardHeader>
          <CardTitle>Oportunidades de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex relative flex-1">
              <Input
                placeholder="Buscar por nome, email ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            
            <Select value={knowledgeFilter} onValueChange={setKnowledgeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Nível de conhecimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                <SelectItem value="beginner">Iniciantes</SelectItem>
                <SelectItem value="intermediate">Intermediários</SelectItem>
                <SelectItem value="advanced">Avançados</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={completionFilter} onValueChange={setCompletionFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status de conclusão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
                <SelectItem value="incomplete">Incompletos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {qualifiedLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum lead qualificado encontrado com os filtros atuais
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Conhecimento</TableHead>
                    <TableHead>Interesse Principal</TableHead>
                    <TableHead className="text-center">Oportunidade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qualifiedLeads.map((lead, index) => {
                    // @ts-ignore - Acessando dados relacionados
                    const profile = lead.profiles || {};
                    const opportunityScore = getOpportunityScore(lead);
                    
                    return (
                      <TableRow key={lead.id || index}>
                        <TableCell>
                          <div className="font-medium">
                            {/* @ts-ignore */}
                            {lead.personal_info?.name || profile.name || 'Sem nome'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {/* @ts-ignore */}
                            {lead.personal_info?.email || profile.email || 'Sem email'}
                          </div>
                        </TableCell>
                        <TableCell>{getCompanyName(lead)}</TableCell>
                        <TableCell>{getCompanySector(lead)}</TableCell>
                        <TableCell>{getKnowledgeLevelLabel(lead)}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate">
                            {getPrimaryInterest(lead)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                            {'⭐'.repeat(opportunityScore)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
