
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingData } from '../types/onboardingTypes';
import { EnhancedFieldIndicator } from '../components/EnhancedFieldIndicator';
import { ChevronRight, Brain, Target, TrendingUp, Clock, Users, DollarSign } from 'lucide-react';

interface OnboardingStep3Props {
  data: OnboardingData;
  onUpdateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  memberType: 'club' | 'formacao';
  validationErrors: any;
  getFieldError: (field: string) => string | undefined;
}

const OnboardingStep3: React.FC<OnboardingStep3Props> = ({
  data,
  onUpdateData,
  onNext,
  onPrev,
  memberType,
  validationErrors,
  getFieldError
}) => {
  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    onUpdateData({ [field]: value });
  };

  const handleCheckboxChange = (field: keyof OnboardingData, option: string, checked: boolean) => {
    const currentValues = data[field] as string[] || [];
    let newValues: string[];
    
    if (checked) {
      newValues = [...currentValues, option];
    } else {
      newValues = currentValues.filter(item => item !== option);
    }
    
    onUpdateData({ [field]: newValues });
  };

  const aiToolsOptions = [
    'ChatGPT',
    'Claude',
    'Gemini',
    'Copilot',
    'Midjourney',
    'DALL-E',
    'Notion AI',
    'Jasper',
    'Copy.ai',
    'Writesonic',
    'Grammarly',
    'Loom AI',
    'Otter.ai',
    'Synthesia',
    'Runway',
    'Stable Diffusion',
    'Make.com (Integromat)',
    'Zapier',
    'Monday.com AI',
    'Salesforce Einstein',
    'HubSpot AI',
    'Intercom AI',
    'Zendesk AI',
    'Canva AI',
    'Adobe Firefly',
    'Figma AI',
    'GitHub Copilot',
    'Cursor',
    'Replit AI',
    'Perplexity',
    'You.com',
    'Bing AI',
    'Google Bard',
    'Character.AI',
    'Poe',
    'Replika',
    'Outro'
  ];

  const dailyToolsOptions = [
    'Google Workspace',
    'Microsoft Office',
    'Slack',
    'Teams',
    'Zoom',
    'Notion',
    'Trello',
    'Asana',
    'Monday.com',
    'Salesforce',
    'HubSpot',
    'Mailchimp',
    'Canva',
    'Adobe Creative Suite',
    'Figma',
    'WhatsApp Business',
    'Instagram',
    'Facebook',
    'LinkedIn',
    'TikTok',
    'YouTube',
    'WordPress',
    'Shopify',
    'WooCommerce',
    'Google Analytics',
    'Google Ads',
    'Facebook Ads',
    'Outro'
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-viverblue/20 rounded-full flex items-center justify-center">
          <Brain className="w-8 h-8 text-viverblue" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Seu Perfil com IA</h2>
        <p className="text-slate-300">Vamos entender sua experiência e objetivos com inteligência artificial</p>
      </motion.div>

      <div className="grid gap-6">
        {/* Experiência com IA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-viverblue" />
            <h3 className="text-lg font-semibold text-white">Experiência com IA</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="hasImplementedAI" className="text-white mb-2 block">
                Sua empresa já implementou alguma solução de IA? *
              </Label>
              <EnhancedFieldIndicator
                isRequired={true}
                isValid={!!data.hasImplementedAI}
                message={getFieldError('hasImplementedAI')}
              />
              <Select value={data.hasImplementedAI} onValueChange={(value) => handleInputChange('hasImplementedAI', value)}>
                <SelectTrigger className="bg-[#1A1E2E] border-white/20 text-white">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1E2E] border-white/20">
                  <SelectItem value="nao">Não, ainda não implementamos</SelectItem>
                  <SelectItem value="parcial">Sim, implementações pontuais</SelectItem>
                  <SelectItem value="ampla">Sim, uso amplo e estratégico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white mb-2 block">
                Quais ferramentas de IA você já utilizou? *
              </Label>
              <EnhancedFieldIndicator
                isRequired={true}
                isValid={data.aiToolsUsed && data.aiToolsUsed.length > 0}
                message={getFieldError('aiToolsUsed')}
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto bg-[#1A1E2E] p-4 rounded-lg border border-white/20">
                {aiToolsOptions.map((tool) => (
                  <div key={tool} className="flex items-center space-x-2">
                    <Checkbox
                      id={`aitool-${tool}`}
                      checked={data.aiToolsUsed?.includes(tool) || false}
                      onCheckedChange={(checked) => handleCheckboxChange('aiToolsUsed', tool, checked as boolean)}
                      className="border-white/30"
                    />
                    <Label htmlFor={`aitool-${tool}`} className="text-sm text-white cursor-pointer">
                      {tool}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="aiKnowledgeLevel" className="text-white mb-2 block">
                Como você avalia seu nível de conhecimento em IA? *
              </Label>
              <EnhancedFieldIndicator
                isRequired={true}
                isValid={!!data.aiKnowledgeLevel}
                message={getFieldError('aiKnowledgeLevel')}
              />
              <Select value={data.aiKnowledgeLevel} onValueChange={(value) => handleInputChange('aiKnowledgeLevel', value)}>
                <SelectTrigger className="bg-[#1A1E2E] border-white/20 text-white">
                  <SelectValue placeholder="Selecione seu nível" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1E2E] border-white/20">
                  <SelectItem value="iniciante">Iniciante - Pouco ou nenhum conhecimento</SelectItem>
                  <SelectItem value="basico">Básico - Já usei algumas ferramentas</SelectItem>
                  <SelectItem value="intermediario">Intermediário - Uso regularmente</SelectItem>
                  <SelectItem value="avancado">Avançado - Domino bem as ferramentas</SelectItem>
                  <SelectItem value="especialista">Especialista - Implemento soluções complexas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Ferramentas Diárias */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-viverblue" />
            <h3 className="text-lg font-semibold text-white">Ferramentas do Dia a Dia</h3>
          </div>

          <div>
            <Label className="text-white mb-2 block">
              Quais ferramentas você usa diariamente no trabalho? *
            </Label>
            <EnhancedFieldIndicator
              isRequired={true}
              isValid={data.dailyTools && data.dailyTools.length > 0}
              message={getFieldError('dailyTools')}
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto bg-[#1A1E2E] p-4 rounded-lg border border-white/20">
              {dailyToolsOptions.map((tool) => (
                <div key={tool} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dailytool-${tool}`}
                    checked={data.dailyTools?.includes(tool) || false}
                    onCheckedChange={(checked) => handleCheckboxChange('dailyTools', tool, checked as boolean)}
                    className="border-white/30"
                  />
                  <Label htmlFor={`dailytool-${tool}`} className="text-sm text-white cursor-pointer">
                    {tool}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Objetivos de Implementação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-viverblue" />
            <h3 className="text-lg font-semibold text-white">Seus Objetivos</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="whoWillImplement" className="text-white mb-2 block">
                Quem implementará as soluções de IA? *
              </Label>
              <EnhancedFieldIndicator
                isRequired={true}
                isValid={!!data.whoWillImplement}
                message={getFieldError('whoWillImplement')}
              />
              <Select value={data.whoWillImplement} onValueChange={(value) => handleInputChange('whoWillImplement', value)}>
                <SelectTrigger className="bg-[#1A1E2E] border-white/20 text-white">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1E2E] border-white/20">
                  <SelectItem value="eu">Eu mesmo(a)</SelectItem>
                  <SelectItem value="equipe">Nossa equipe interna</SelectItem>
                  <SelectItem value="terceiros">Empresa terceirizada</SelectItem>
                  <SelectItem value="consultoria">Consultoria especializada</SelectItem>
                  <SelectItem value="ainda_indefinido">Ainda não definimos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mainObjective" className="text-white mb-2 block">
                Principal objetivo com IA *
              </Label>
              <Select value={data.mainObjective} onValueChange={(value) => handleInputChange('mainObjective', value)}>
                <SelectTrigger className="bg-[#1A1E2E] border-white/20 text-white">
                  <SelectValue placeholder="Selecione seu objetivo" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1E2E] border-white/20">
                  <SelectItem value="reduzir_custos">Reduzir custos operacionais</SelectItem>
                  <SelectItem value="aumentar_receita">Aumentar receita</SelectItem>
                  <SelectItem value="melhorar_eficiencia">Melhorar eficiência</SelectItem>
                  <SelectItem value="inovar_produtos">Inovar produtos/serviços</SelectItem>
                  <SelectItem value="melhorar_experiencia">Melhorar experiência do cliente</SelectItem>
                  <SelectItem value="automatizar_processos">Automatizar processos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="areaToImpact" className="text-white mb-2 block">
              Principal área que deseja impactar *
            </Label>
            <Select value={data.areaToImpact} onValueChange={(value) => handleInputChange('areaToImpact', value)}>
              <SelectTrigger className="bg-[#1A1E2E] border-white/20 text-white">
                <SelectValue placeholder="Selecione a área" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1E2E] border-white/20">
                <SelectItem value="vendas">Vendas e Marketing</SelectItem>
                <SelectItem value="atendimento">Atendimento ao Cliente</SelectItem>
                <SelectItem value="operacoes">Operações</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="rh">Recursos Humanos</SelectItem>
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                <SelectItem value="producao">Produção</SelectItem>
                <SelectItem value="logistica">Logística</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="expectedResult90Days" className="text-white mb-2 block">
              Resultado esperado em 90 dias *
            </Label>
            <Textarea
              id="expectedResult90Days"
              value={data.expectedResult90Days}
              onChange={(e) => handleInputChange('expectedResult90Days', e.target.value)}
              placeholder="Descreva o resultado específico que espera alcançar..."
              className="bg-[#1A1E2E] border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
            />
          </div>
        </motion.div>

        {/* Investimento e Capacitação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-viverblue" />
            <h3 className="text-lg font-semibold text-white">Investimento e Capacitação</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="aiImplementationBudget" className="text-white mb-2 block">
                Orçamento mensal para IA *
              </Label>
              <Select value={data.aiImplementationBudget} onValueChange={(value) => handleInputChange('aiImplementationBudget', value)}>
                <SelectTrigger className="bg-[#1A1E2E] border-white/20 text-white">
                  <SelectValue placeholder="Selecione a faixa" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1E2E] border-white/20">
                  <SelectItem value="ate_500">Até R$ 500</SelectItem>
                  <SelectItem value="500_1500">R$ 500 - R$ 1.500</SelectItem>
                  <SelectItem value="1500_5000">R$ 1.500 - R$ 5.000</SelectItem>
                  <SelectItem value="5000_15000">R$ 5.000 - R$ 15.000</SelectItem>
                  <SelectItem value="acima_15000">Acima de R$ 15.000</SelectItem>
                  <SelectItem value="ainda_nao_definido">Ainda não definido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="weeklyLearningTime" className="text-white mb-2 block">
                Tempo semanal para aprendizado *
              </Label>
              <Select value={data.weeklyLearningTime} onValueChange={(value) => handleInputChange('weeklyLearningTime', value)}>
                <SelectTrigger className="bg-[#1A1E2E] border-white/20 text-white">
                  <SelectValue placeholder="Selecione o tempo" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1E2E] border-white/20">
                  <SelectItem value="1_2_horas">1-2 horas</SelectItem>
                  <SelectItem value="3_5_horas">3-5 horas</SelectItem>
                  <SelectItem value="6_10_horas">6-10 horas</SelectItem>
                  <SelectItem value="mais_10_horas">Mais de 10 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="contentPreference" className="text-white mb-2 block">
              Preferência de formato de conteúdo *
            </Label>
            <Select value={data.contentPreference} onValueChange={(value) => handleInputChange('contentPreference', value)}>
              <SelectTrigger className="bg-[#1A1E2E] border-white/20 text-white">
                <SelectValue placeholder="Selecione sua preferência" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1E2E] border-white/20">
                <SelectItem value="videos">Vídeos explicativos</SelectItem>
                <SelectItem value="textos">Textos e guias</SelectItem>
                <SelectItem value="praticos">Exercícios práticos</SelectItem>
                <SelectItem value="webinars">Webinars ao vivo</SelectItem>
                <SelectItem value="mentoria">Mentoria personalizada</SelectItem>
                <SelectItem value="comunidade">Discussões em comunidade</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingStep3;
