
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
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

  const tempoAprendizado = [
    '1-2 horas por semana',
    '3-5 horas por semana',
    '6-10 horas por semana',
    'Mais de 10 horas por semana'
  ];

  const tipoConteudo = [
    'Vídeo-aulas práticas',
    'Artigos e textos',
    'Webinars ao vivo',
    'Workshops práticos',
    'Cases de sucesso',
    'Templates prontos'
  ];

  const diasSemana = [
    'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
    'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'
  ];

  const periodosPreferidos = [
    'Manhã (6h-12h)', 'Tarde (12h-18h)', 'Noite (18h-22h)', 'Madrugada (22h-6h)'
  ];

  // Gerar mensagem quando preferências estiverem preenchidas
  useEffect(() => {
    const hasPreferences = data.weeklyLearningTime && data.contentPreference && data.wantsNetworking;
    if (hasPreferences && !generatedMessage && !isGenerating && !shouldGenerateMessage) {
      setShouldGenerateMessage(true);
      generateMessage(data, memberType);
    }
  }, [data.weeklyLearningTime, data.contentPreference, data.wantsNetworking, generatedMessage, isGenerating, shouldGenerateMessage, generateMessage, data, memberType]);

  const handleInputChange = (field: string, value: string) => {
    onUpdateData({ [field]: value });
  };

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    const currentValues = data[field] || [];
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
          Configure sua experiência de aprendizado para maximizar seus resultados
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Coluna Esquerda - Aprendizado */}
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
                <Label className="text-slate-200 mb-3 block">
                  Quanto tempo você pode dedicar ao aprendizado por semana? *
                </Label>
                <RadioGroup 
                  value={data.weeklyLearningTime || ''}
                  onValueChange={(value) => handleInputChange('weeklyLearningTime', value)}
                  className="space-y-3"
                >
                  {tempoAprendizado.map((tempo) => (
                    <div key={tempo} className="flex items-center space-x-2">
                      <RadioGroupItem value={tempo} id={tempo} className="border-viverblue text-viverblue" />
                      <Label htmlFor={tempo} className="text-slate-200">{tempo}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {getFieldError?.('weeklyLearningTime') && (
                  <p className="text-red-400 text-sm mt-2">{getFieldError('weeklyLearningTime')}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Tipo de Conteúdo */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Preferências de Conteúdo</h3>
              </div>

              <div>
                <Label className="text-slate-200 mb-3 block">
                  Qual tipo de conteúdo você prefere? *
                </Label>
                <RadioGroup 
                  value={data.contentPreference || ''}
                  onValueChange={(value) => handleInputChange('contentPreference', value)}
                  className="space-y-3"
                >
                  {tipoConteudo.map((tipo) => (
                    <div key={tipo} className="flex items-center space-x-2">
                      <RadioGroupItem value={tipo} id={tipo} className="border-viverblue text-viverblue" />
                      <Label htmlFor={tipo} className="text-slate-200">{tipo}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {getFieldError?.('contentPreference') && (
                  <p className="text-red-400 text-sm mt-2">{getFieldError('contentPreference')}</p>
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
                <Label className="text-slate-200 mb-3 block">
                  Tem interesse em participar de eventos de networking? *
                </Label>
                <RadioGroup 
                  value={data.wantsNetworking || ''}
                  onValueChange={(value) => handleInputChange('wantsNetworking', value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sim_presencial" id="sim_presencial" className="border-viverblue text-viverblue" />
                    <Label htmlFor="sim_presencial" className="text-slate-200">Sim, presencial e online</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sim_online" id="sim_online" className="border-viverblue text-viverblue" />
                    <Label htmlFor="sim_online" className="text-slate-200">Sim, apenas online</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="talvez" id="talvez" className="border-viverblue text-viverblue" />
                    <Label htmlFor="talvez" className="text-slate-200">Talvez, dependendo do evento</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nao" id="nao" className="border-viverblue text-viverblue" />
                    <Label htmlFor="nao" className="text-slate-200">Não tenho interesse</Label>
                  </div>
                </RadioGroup>
                {getFieldError?.('wantsNetworking') && (
                  <p className="text-red-400 text-sm mt-2">{getFieldError('wantsNetworking')}</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Coluna Direita - Horários e Case Study */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Dias da Semana */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Disponibilidade</h3>
              </div>

              <div>
                <Label className="text-slate-200 mb-3 block">
                  Quais os melhores dias para você estudar? *
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {diasSemana.map((dia) => (
                    <div key={dia} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dia_${dia}`}
                        checked={(data.bestDays || []).includes(dia)}
                        onCheckedChange={(checked) => handleCheckboxChange('bestDays', dia, checked)}
                        className="border-viverblue data-[state=checked]:bg-viverblue"
                      />
                      <Label htmlFor={`dia_${dia}`} className="text-slate-200 text-sm">{dia}</Label>
                    </div>
                  ))}
                </div>
                {getFieldError?.('bestDays') && (
                  <p className="text-red-400 text-sm mt-2">{getFieldError('bestDays')}</p>
                )}
              </div>

              <div>
                <Label className="text-slate-200 mb-3 block">
                  Quais os melhores horários para você? *
                </Label>
                <div className="space-y-3">
                  {periodosPreferidos.map((periodo) => (
                    <div key={periodo} className="flex items-center space-x-2">
                      <Checkbox
                        id={`periodo_${periodo}`}
                        checked={(data.bestPeriods || []).includes(periodo)}
                        onCheckedChange={(checked) => handleCheckboxChange('bestPeriods', periodo, checked)}
                        className="border-viverblue data-[state=checked]:bg-viverblue"
                      />
                      <Label htmlFor={`periodo_${periodo}`} className="text-slate-200 text-sm">{periodo}</Label>
                    </div>
                  ))}
                </div>
                {getFieldError?.('bestPeriods') && (
                  <p className="text-red-400 text-sm mt-2">{getFieldError('bestPeriods')}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Case Study */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Case de Sucesso</h3>
              </div>

              <div>
                <Label className="text-slate-200 mb-3 block">
                  Gostaria de compartilhar sua jornada como case de sucesso? *
                </Label>
                <RadioGroup 
                  value={data.acceptsCaseStudy || ''}
                  onValueChange={(value) => handleInputChange('acceptsCaseStudy', value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sim_publico" id="sim_publico" className="border-viverblue text-viverblue" />
                    <Label htmlFor="sim_publico" className="text-slate-200">Sim, de forma pública</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sim_anonimo" id="sim_anonimo" className="border-viverblue text-viverblue" />
                    <Label htmlFor="sim_anonimo" className="text-slate-200">Sim, mas de forma anônima</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="talvez_futuro" id="talvez_futuro" className="border-viverblue text-viverblue" />
                    <Label htmlFor="talvez_futuro" className="text-slate-200">Talvez no futuro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nao" id="nao_case" className="border-viverblue text-viverblue" />
                    <Label htmlFor="nao_case" className="text-slate-200">Não tenho interesse</Label>
                  </div>
                </RadioGroup>
                {getFieldError?.('acceptsCaseStudy') && (
                  <p className="text-red-400 text-sm mt-2">{getFieldError('acceptsCaseStudy')}</p>
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
                <h3 className="text-lg font-semibold text-white">Seu Plano Personalizado</h3>
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
