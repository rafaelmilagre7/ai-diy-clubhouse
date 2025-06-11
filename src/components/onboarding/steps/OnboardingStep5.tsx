
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, Clock, BookOpen, Users, Calendar, Sparkles } from 'lucide-react';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { AIMessageDisplay } from '../components/AIMessageDisplay';
import { useAIMessageGeneration } from '../hooks/useAIMessageGeneration';

const OnboardingStep5: React.FC<OnboardingStepProps> = ({
  data,
  onUpdateData,
  memberType,
  getFieldError
}) => {
  const { generateMessage, isGenerating, generatedMessage } = useAIMessageGeneration();
  const [shouldGenerateMessage, setShouldGenerateMessage] = useState(false);

  const temposAprendizado = [
    '1-2 horas por semana',
    '3-5 horas por semana',
    '6-10 horas por semana',
    'Mais de 10 horas por semana',
    'Ainda não sei'
  ];

  const tiposConteudo = [
    'Vídeos curtos (até 10 min)',
    'Vídeos longos (mais de 30 min)',
    'Artigos e textos',
    'Podcasts',
    'Lives e webinars',
    'Exercícios práticos',
    'Cases e estudos'
  ];

  const diasSemana = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo'
  ];

  const periodosDia = [
    'Manhã (6h-12h)',
    'Tarde (12h-18h)',
    'Noite (18h-22h)',
    'Madrugada (22h-6h)'
  ];

  // Gerar mensagem quando preferências estiverem preenchidas
  useEffect(() => {
    const hasPreferences = data.weeklyLearningTime && 
                          data.contentPreference && 
                          data.wantsNetworking === 'sim';
    
    if (hasPreferences && !generatedMessage && !isGenerating && !shouldGenerateMessage) {
      setShouldGenerateMessage(true);
      generateMessage(data, memberType);
    }
  }, [data.weeklyLearningTime, data.contentPreference, data.wantsNetworking, generatedMessage, isGenerating, shouldGenerateMessage, generateMessage, data, memberType]);

  const handleInputChange = (field: string, value: string | string[]) => {
    onUpdateData({ [field]: value });
  };

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    const currentValues = (data[field as keyof typeof data] as string[]) || [];
    let newValues;
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(item => item !== value);
    }
    
    onUpdateData({ [field]: newValues });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 mx-auto bg-viverblue/20 rounded-full flex items-center justify-center">
          <Settings className="w-8 h-8 text-viverblue" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Personalização da Experiência
        </h2>
        <p className="text-slate-300">
          Configure sua jornada de aprendizado ideal
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Coluna Esquerda - Tempo e Conteúdo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Preferências de Aprendizado */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Tempo de Aprendizado</h3>
              </div>

              <div>
                <Label htmlFor="weeklyLearningTime" className="text-slate-200">
                  Quanto tempo por semana você pode dedicar ao aprendizado? *
                </Label>
                <Select value={data.weeklyLearningTime || ''} onValueChange={(value) => handleInputChange('weeklyLearningTime', value)}>
                  <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                    <SelectValue placeholder="Selecione o tempo disponível" />
                  </SelectTrigger>
                  <SelectContent>
                    {temposAprendizado.map((tempo) => (
                      <SelectItem key={tempo} value={tempo}>{tempo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError?.('weeklyLearningTime') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('weeklyLearningTime')}</p>
                )}
              </div>

              <div>
                <Label htmlFor="contentPreference" className="text-slate-200">
                  Que tipo de conteúdo você prefere? *
                </Label>
                <Select value={data.contentPreference || ''} onValueChange={(value) => handleInputChange('contentPreference', value)}>
                  <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                    <SelectValue placeholder="Selecione seu tipo preferido" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposConteudo.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError?.('contentPreference') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('contentPreference')}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Networking */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Networking</h3>
              </div>

              <div>
                <Label htmlFor="wantsNetworking" className="text-slate-200">
                  Gostaria de fazer networking com outros membros? *
                </Label>
                <RadioGroup 
                  value={data.wantsNetworking || ''} 
                  onValueChange={(value) => handleInputChange('wantsNetworking', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sim" id="networking-sim" />
                    <Label htmlFor="networking-sim" className="text-slate-200">Sim, quero conectar com outros membros</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nao" id="networking-nao" />
                    <Label htmlFor="networking-nao" className="text-slate-200">Não, prefiro focar só no conteúdo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="talvez" id="networking-talvez" />
                    <Label htmlFor="networking-talvez" className="text-slate-200">Talvez no futuro</Label>
                  </div>
                </RadioGroup>
                {getFieldError?.('wantsNetworking') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('wantsNetworking')}</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Coluna Direita - Horários e Estudos de Caso */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Horários Preferenciais */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Horários Preferenciais</h3>
              </div>

              <div>
                <Label className="text-slate-200 mb-3 block">
                  Quais os melhores dias para você estudar? (selecione todos)
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {diasSemana.map((dia) => (
                    <div key={dia} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${dia}`}
                        checked={(data.bestDays || []).includes(dia)}
                        onCheckedChange={(checked) => handleCheckboxChange('bestDays', dia, checked === true)}
                      />
                      <Label htmlFor={`day-${dia}`} className="text-slate-200 text-sm">
                        {dia}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-slate-200 mb-3 block">
                  Quais os melhores períodos do dia? (selecione todos)
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {periodosDia.map((periodo) => (
                    <div key={periodo} className="flex items-center space-x-2">
                      <Checkbox
                        id={`period-${periodo}`}
                        checked={(data.bestPeriods || []).includes(periodo)}
                        onCheckedChange={(checked) => handleCheckboxChange('bestPeriods', periodo, checked === true)}
                      />
                      <Label htmlFor={`period-${periodo}`} className="text-slate-200 text-sm">
                        {periodo}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Estudo de Caso */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Participação em Estudos</h3>
              </div>

              <div>
                <Label htmlFor="acceptsCaseStudy" className="text-slate-200">
                  Aceita participar de estudos de caso sobre implementação de IA?
                </Label>
                <RadioGroup 
                  value={data.acceptsCaseStudy || ''} 
                  onValueChange={(value) => handleInputChange('acceptsCaseStudy', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sim" id="case-sim" />
                    <Label htmlFor="case-sim" className="text-slate-200">Sim, posso compartilhar minha experiência</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nao" id="case-nao" />
                    <Label htmlFor="case-nao" className="text-slate-200">Não, prefiro manter privacidade</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="anonimo" id="case-anonimo" />
                    <Label htmlFor="case-anonimo" className="text-slate-200">Sim, mas de forma anônima</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </Card>

          {/* Mensagem da IA */}
          {(generatedMessage || isGenerating) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Plano Personalizado</h3>
              </div>
              <AIMessageDisplay 
                message={generatedMessage || ''} 
                isLoading={isGenerating}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingStep5;
