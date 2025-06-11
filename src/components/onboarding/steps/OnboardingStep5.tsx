
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Calendar, Clock, Users, BookOpen, Sparkles } from 'lucide-react';
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
    'Conforme disponibilidade'
  ];

  const tiposConteudo = [
    'Vídeos curtos (até 10 min)',
    'Vídeos longos (mais de 30 min)',
    'Artigos e textos',
    'Podcasts',
    'Webinars ao vivo',
    'Workshops práticos',
    'Cases de sucesso',
    'Templates e checklists'
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
    'Manhã (6h - 12h)',
    'Tarde (12h - 18h)',
    'Noite (18h - 22h)',
    'Madrugada (22h - 6h)'
  ];

  // Gerar mensagem quando preferências estiverem preenchidas
  useEffect(() => {
    const hasPreferences = data.weeklyLearningTime && data.contentPreference && data.wantsNetworking;
    const wantsNetworkingBool = data.wantsNetworking === 'sim' || data.wantsNetworking === true;
    
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
    if (checked) {
      handleInputChange(field, [...currentValues, value]);
    } else {
      handleInputChange(field, currentValues.filter(item => item !== value));
    }
  };

  // Converter string para boolean de forma segura
  const wantsNetworking = data.wantsNetworking === 'sim' || data.wantsNetworking === true;
  const acceptsCaseStudy = data.acceptsCaseStudy === 'sim' || data.acceptsCaseStudy === true;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 mx-auto bg-viverblue/20 rounded-full flex items-center justify-center">
          <Heart className="w-8 h-8 text-viverblue" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Personalização da Experiência
        </h2>
        <p className="text-slate-300">
          Vamos personalizar sua jornada de aprendizado em IA
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Coluna Esquerda - Preferências de Aprendizado */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Tempo de Aprendizado */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Tempo de Estudo</h3>
              </div>

              <div>
                <Label htmlFor="weeklyLearningTime" className="text-slate-200">
                  Quanto tempo você pode dedicar ao aprendizado por semana? *
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
                <div className="mt-2 grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-3 bg-[#151823] rounded-lg border border-white/20">
                  {tiposConteudo.map((tipo) => (
                    <div key={tipo} className="flex items-center space-x-2">
                      <Checkbox
                        id={`content-${tipo}`}
                        checked={(data.contentPreference || []).includes(tipo)}
                        onCheckedChange={(checked) => handleCheckboxChange('contentPreference', tipo, checked as boolean)}
                        className="border-white/20"
                      />
                      <Label htmlFor={`content-${tipo}`} className="text-slate-200 text-sm">
                        {tipo}
                      </Label>
                    </div>
                  ))}
                </div>
                {getFieldError?.('contentPreference') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('contentPreference')}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Networking e Comunidade */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Networking</h3>
              </div>

              <div>
                <Label htmlFor="wantsNetworking" className="text-slate-200">
                  Tem interesse em fazer networking com outros membros? *
                </Label>
                <RadioGroup 
                  value={data.wantsNetworking || ''} 
                  onValueChange={(value) => handleInputChange('wantsNetworking', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sim" id="networking-sim" className="border-white/20 text-viverblue" />
                    <Label htmlFor="networking-sim" className="text-slate-200">Sim, quero conhecer outros membros</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nao" id="networking-nao" className="border-white/20 text-viverblue" />
                    <Label htmlFor="networking-nao" className="text-slate-200">Não, prefiro estudar sozinho</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="talvez" id="networking-talvez" className="border-white/20 text-viverblue" />
                    <Label htmlFor="networking-talvez" className="text-slate-200">Talvez, depende da oportunidade</Label>
                  </div>
                </RadioGroup>
                {getFieldError?.('wantsNetworking') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('wantsNetworking')}</p>
                )}
              </div>

              <div>
                <Label htmlFor="acceptsCaseStudy" className="text-slate-200">
                  Gostaria de ter seu caso de sucesso divulgado como exemplo?
                </Label>
                <RadioGroup 
                  value={data.acceptsCaseStudy || ''} 
                  onValueChange={(value) => handleInputChange('acceptsCaseStudy', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sim" id="case-sim" className="border-white/20 text-viverblue" />
                    <Label htmlFor="case-sim" className="text-slate-200">Sim, quero inspirar outros</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nao" id="case-nao" className="border-white/20 text-viverblue" />
                    <Label htmlFor="case-nao" className="text-slate-200">Não, prefiro privacidade</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Coluna Direita - Horários e IA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Disponibilidade */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Sua Disponibilidade</h3>
              </div>

              <div>
                <Label htmlFor="bestDays" className="text-slate-200">
                  Quais são os melhores dias para você estudar? *
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-2 p-3 bg-[#151823] rounded-lg border border-white/20">
                  {diasSemana.map((dia) => (
                    <div key={dia} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${dia}`}
                        checked={(data.bestDays || []).includes(dia)}
                        onCheckedChange={(checked) => handleCheckboxChange('bestDays', dia, checked as boolean)}
                        className="border-white/20"
                      />
                      <Label htmlFor={`day-${dia}`} className="text-slate-200 text-sm">
                        {dia}
                      </Label>
                    </div>
                  ))}
                </div>
                {getFieldError?.('bestDays') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('bestDays')}</p>
                )}
              </div>

              <div>
                <Label htmlFor="bestPeriods" className="text-slate-200">
                  Quais são os melhores períodos do dia? *
                </Label>
                <div className="mt-2 grid grid-cols-1 gap-2 p-3 bg-[#151823] rounded-lg border border-white/20">
                  {periodosDia.map((periodo) => (
                    <div key={periodo} className="flex items-center space-x-2">
                      <Checkbox
                        id={`period-${periodo}`}
                        checked={(data.bestPeriods || []).includes(periodo)}
                        onCheckedChange={(checked) => handleCheckboxChange('bestPeriods', periodo, checked as boolean)}
                        className="border-white/20"
                      />
                      <Label htmlFor={`period-${periodo}`} className="text-slate-200 text-sm">
                        {periodo}
                      </Label>
                    </div>
                  ))}
                </div>
                {getFieldError?.('bestPeriods') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('bestPeriods')}</p>
                )}
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
