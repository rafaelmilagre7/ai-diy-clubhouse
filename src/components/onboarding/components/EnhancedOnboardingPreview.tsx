import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building, Brain, Target, Clock, CheckCircle, ChevronDown, ChevronRight, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OnboardingData } from '../types/onboardingTypes';

interface EnhancedOnboardingPreviewProps {
  data: OnboardingData;
  onEdit?: (step: number) => void;
  className?: string;
}

export const EnhancedOnboardingPreview: React.FC<EnhancedOnboardingPreviewProps> = ({ 
  data, 
  onEdit,
  className = '' 
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    business: true,
    ai: true,
    objectives: true,
    preferences: true
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'personal': return User;
      case 'business': return Building;
      case 'ai': return Brain;
      case 'objectives': return Target;
      case 'preferences': return Clock;
      default: return CheckCircle;
    }
  };

  const getDisplayValue = (value: any, type?: string): string => {
    if (!value) return '';
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }

    // Mapear valores específicos para exibição amigável
    const valueMap: Record<string, string> = {
      // AI Experience
      'yes': 'Sim',
      'no': 'Não',
      'tried-failed': 'Tentou mas falhou',
      
      // Implementation
      'myself': 'Eu mesmo',
      'team': 'Minha equipe',
      'outsource': 'Contratar terceiros',
      
      // Knowledge levels
      'beginner': 'Iniciante',
      'intermediate': 'Intermediário',
      'advanced': 'Avançado',
      
      // Objectives
      'reduce-costs': 'Reduzir custos',
      'increase-sales': 'Aumentar vendas',
      'automate-processes': 'Automatizar processos',
      'innovate-products': 'Inovar produtos',
      
      // Content preferences
      'theoretical': 'Mais teórico',
      'hands-on': 'Mais prático',
      'videos': 'Vídeos',
      'texts': 'Textos e artigos',
      'interactive': 'Conteúdo interativo',
      
      // Time preferences
      'weekly-1-2': '1-2 horas por semana',
      'weekly-3-5': '3-5 horas por semana',
      'weekly-6-10': '6-10 horas por semana',
      'weekly-more-10': 'Mais de 10 horas por semana',
      
      // Budget
      'under-10k': 'Até R$ 10.000',
      '10k-50k': 'R$ 10.000 - R$ 50.000',
      '50k-100k': 'R$ 50.000 - R$ 100.000',
      'over-100k': 'Acima de R$ 100.000',
      
      // Urgency
      'immediate': 'Imediato',
      'this-quarter': 'Este trimestre',
      'this-year': 'Este ano',
      'next-year': 'Próximo ano',
      
      // Case study
      'accepts': 'Aceita compartilhar',
      'prefers-privacy': 'Prefere privacidade'
    };

    return valueMap[value] || value;
  };

  const sections = [
    {
      id: 'personal',
      title: 'Informações Pessoais',
      step: 1,
      items: [
        { label: 'Nome', value: data.name },
        { label: 'E-mail', value: data.email },
        { label: 'Telefone', value: data.phone },
        { label: 'Instagram', value: data.instagram },
        { label: 'LinkedIn', value: data.linkedin },
        { label: 'Localização', value: data.city && data.state ? `${data.city}/${data.state}` : '' },
        { label: 'Data de Nascimento', value: data.birthDate },
        { label: 'Curiosidade', value: data.curiosity }
      ]
    },
    {
      id: 'business',
      title: 'Perfil Empresarial',
      step: 2,
      items: [
        { label: 'Empresa', value: data.companyName },
        { label: 'Site da empresa', value: data.companyWebsite },
        { label: 'Setor', value: data.businessSector },
        { label: 'Tamanho', value: getDisplayValue(data.companySize) },
        { label: 'Faturamento anual', value: getDisplayValue(data.annualRevenue) },
        { label: 'Cargo', value: data.position }
      ]
    },
    {
      id: 'ai',
      title: 'Maturidade em IA',
      step: 3,
      items: [
        { label: 'Já implementou IA', value: getDisplayValue(data.hasImplementedAI) },
        { label: 'Ferramentas de IA usadas', value: data.aiToolsUsed?.join(', ') || '' },
        { label: 'Nível de conhecimento', value: getDisplayValue(data.aiKnowledgeLevel) },
        { label: 'Ferramentas diárias', value: data.dailyTools?.join(', ') || '' },
        { label: 'Quem implementará', value: getDisplayValue(data.whoWillImplement) },
        { label: 'Objetivo da implementação', value: data.aiImplementationObjective },
        { label: 'Urgência', value: getDisplayValue(data.aiImplementationUrgency) },
        { label: 'Principal desafio', value: data.aiMainChallenge }
      ]
    },
    {
      id: 'objectives',
      title: 'Objetivos e Expectativas',
      step: 4,
      items: [
        { label: 'Objetivo principal', value: getDisplayValue(data.mainObjective) },
        { label: 'Área para impactar', value: data.areaToImpact },
        { label: 'Resultado esperado (90 dias)', value: data.expectedResult90Days },
        { label: 'Nível de urgência', value: getDisplayValue(data.urgencyLevel) },
        { label: 'Métrica de sucesso', value: data.successMetric },
        { label: 'Principal obstáculo', value: data.mainObstacle },
        { label: 'Suporte preferido', value: data.preferredSupport },
        { label: 'Orçamento para IA', value: getDisplayValue(data.aiImplementationBudget) }
      ]
    },
    {
      id: 'preferences',
      title: 'Preferências de Aprendizado',
      step: 5,
      items: [
        { label: 'Tempo semanal', value: getDisplayValue(data.weeklyLearningTime) },
        { label: 'Preferência de conteúdo', value: data.contentPreference?.map(p => getDisplayValue(p)).join(', ') || '' },
        { label: 'Frequência de conteúdo', value: getDisplayValue(data.contentFrequency) },
        { label: 'Interesse em networking', value: getDisplayValue(data.wantsNetworking) },
        { label: 'Estilo de interação', value: getDisplayValue(data.communityInteractionStyle) },
        { label: 'Canal preferido', value: getDisplayValue(data.preferredCommunicationChannel) },
        { label: 'Tipo de acompanhamento', value: getDisplayValue(data.followUpType) },
        { label: 'Motivadores', value: data.learningMotivators?.join(', ') || '' },
        { label: 'Melhores dias', value: data.bestDays?.join(', ') || '' },
        { label: 'Melhores períodos', value: data.bestPeriods?.join(', ') || '' },
        { label: 'Compartilhar case', value: getDisplayValue(data.acceptsCaseStudy) }
      ]
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-2xl font-heading font-bold text-white">
          Seu Perfil Completo
        </h3>
        <p className="text-neutral-300">
          Revise todas as informações coletadas durante o processo
        </p>
      </div>

      <div className="space-y-3">
        {sections.map((section, sectionIndex) => {
          const Icon = getSectionIcon(section.id);
          const filledItems = section.items.filter(item => item.value && item.value.toString().trim() !== '');
          const isExpanded = expandedSections[section.id];
          const completionPercentage = Math.round((filledItems.length / section.items.length) * 100);

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <Card className="bg-[#151823] border-white/10 overflow-hidden">
                {/* Header */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-viverblue/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-viverblue" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{section.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 bg-neutral-700 rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full bg-viverblue transition-all duration-300"
                            style={{ width: `${completionPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-400">
                          {filledItems.length}/{section.items.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        completionPercentage === 100 
                          ? 'text-green-400 border-green-400' 
                          : completionPercentage >= 50 
                            ? 'text-yellow-400 border-yellow-400'
                            : 'text-red-400 border-red-400'
                      }`}
                    >
                      {completionPercentage}%
                    </Badge>

                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(section.step);
                        }}
                        className="h-8 w-8 p-0 hover:bg-viverblue/20 text-neutral-400 hover:text-viverblue"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}

                    <div className="text-neutral-400">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-4 space-y-3">
                        {section.items.map((item, itemIndex) => (
                          <motion.div
                            key={itemIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: itemIndex * 0.05 }}
                            className="flex justify-between items-start"
                          >
                            <span className="text-sm text-neutral-400 min-w-0 flex-1">
                              {item.label}:
                            </span>
                            <span className="text-sm text-white ml-3 text-right min-w-0 flex-2">
                              {item.value ? (
                                <span className="font-medium">{item.value}</span>
                              ) : (
                                <span className="text-neutral-500 italic">Não informado</span>
                              )}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};