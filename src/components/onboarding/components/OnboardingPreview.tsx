
import React from 'react';
import { motion } from 'framer-motion';
import { User, Building, Brain, Target, Clock, CheckCircle } from 'lucide-react';
import { OnboardingData } from '../types/onboardingTypes';

interface OnboardingPreviewProps {
  data: OnboardingData;
  className?: string;
}

export const OnboardingPreview = ({ data, className = '' }: OnboardingPreviewProps) => {
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

  const getContentPreferenceDisplay = (preferences: string[] | undefined) => {
    if (!preferences || preferences.length === 0) return '';
    
    const preferenceMap: Record<string, string> = {
      'theoretical': 'Mais teórico',
      'hands-on': 'Mais prático',
      'videos': 'Vídeos',
      'texts': 'Textos e artigos',
      'interactive': 'Conteúdo interativo'
    };
    
    return preferences.map(pref => preferenceMap[pref] || pref).join(', ');
  };

  const sections = [
    {
      id: 'personal',
      title: 'Informações Pessoais',
      items: [
        { label: 'Nome', value: data.name },
        { label: 'E-mail', value: data.email },
        { label: 'Localização', value: data.city && data.state ? `${data.city}/${data.state}` : '' },
        { label: 'Curiosidade', value: data.curiosity }
      ]
    },
    {
      id: 'business',
      title: 'Perfil Empresarial',
      items: [
        { label: 'Empresa', value: data.companyName },
        { label: 'Setor', value: data.businessSector },
        { label: 'Tamanho', value: data.companySize },
        { label: 'Faturamento', value: data.annualRevenue },
        { label: 'Cargo', value: data.position }
      ]
    },
    {
      id: 'ai',
      title: 'Maturidade em IA',
      items: [
        { label: 'Experiência', value: data.hasImplementedAI === 'yes' ? 'Já implementou' : data.hasImplementedAI === 'tried-failed' ? 'Tentou mas falhou' : 'Nunca implementou' },
        { label: 'Nível de conhecimento', value: data.aiKnowledgeLevel },
        { label: 'Quem vai implementar', value: data.whoWillImplement === 'myself' ? 'Eu mesmo' : data.whoWillImplement === 'team' ? 'Minha equipe' : 'Contratar terceiros' }
      ]
    },
    {
      id: 'objectives',
      title: 'Objetivos',
      items: [
        { label: 'Objetivo principal', value: data.mainObjective === 'reduce-costs' ? 'Reduzir custos' : data.mainObjective === 'increase-sales' ? 'Aumentar vendas' : data.mainObjective === 'automate-processes' ? 'Automatizar processos' : 'Inovar produtos' },
        { label: 'Área para impactar', value: data.areaToImpact },
        { label: 'Resultado esperado (90 dias)', value: data.expectedResult90Days },
        { label: 'Orçamento para IA', value: data.aiImplementationBudget }
      ]
    },
    {
      id: 'preferences',
      title: 'Preferências',
      items: [
        { label: 'Tempo semanal', value: data.weeklyLearningTime },
        { label: 'Tipo de conteúdo', value: getContentPreferenceDisplay(data.contentPreference) },
        { label: 'Networking', value: data.wantsNetworking === 'yes' ? 'Sim' : 'Não' },
        { label: 'Melhores dias', value: data.bestDays?.join(', ') },
        { label: 'Melhores períodos', value: data.bestPeriods?.join(', ') },
        { label: 'Case de sucesso', value: data.acceptsCaseStudy === 'yes' ? 'Aceita compartilhar' : 'Prefere privacidade' }
      ]
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-heading font-bold text-white">
          Resumo do seu perfil
        </h3>
        <p className="text-neutral-300">
          Revise as informações antes de finalizar
        </p>
      </div>

      <div className="grid gap-4">
        {sections.map((section, sectionIndex) => {
          const Icon = getSectionIcon(section.id);
          const filledItems = section.items.filter(item => item.value);
          
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="bg-[#151823] border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-viverblue/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-viverblue" />
                </div>
                <h4 className="font-semibold text-white">{section.title}</h4>
                <div className="flex items-center gap-1 ml-auto">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">
                    {filledItems.length}/{section.items.length}
                  </span>
                </div>
              </div>
              
              <div className="grid gap-2">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex justify-between items-start">
                    <span className="text-sm text-neutral-400 min-w-0 flex-1">
                      {item.label}:
                    </span>
                    <span className="text-sm text-white ml-3 text-right min-w-0 flex-1">
                      {item.value || (
                        <span className="text-neutral-500 italic">Não informado</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
