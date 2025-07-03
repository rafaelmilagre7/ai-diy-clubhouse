
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';
import { 
  Clock, 
  Calendar, 
  BookOpen, 
  Users, 
  MessageCircle, 
  Heart,
  UserCheck
} from 'lucide-react';

interface MockOnboardingStep5Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  getFieldError?: (field: string) => string | undefined;
}

const MockOnboardingStep5: React.FC<MockOnboardingStep5Props> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
  const handleRadioChange = (field: keyof OnboardingData, value: string) => {
    onUpdateData({ [field]: value });
  };

  const handleCheckboxChange = (field: keyof OnboardingData, values: string[], value: string, checked: boolean) => {
    let newValues = [...values];
    if (checked) {
      if (!newValues.includes(value)) {
        newValues.push(value);
      }
    } else {
      newValues = newValues.filter(v => v !== value);
    }
    onUpdateData({ [field]: newValues });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-white">Personalização da Experiência</h2>
        <p className="text-slate-300">
          Configure suas preferências para uma experiência totalmente personalizada
        </p>
      </div>

      <div className="grid gap-6">
        {/* Card: Disponibilidade & Horários */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Disponibilidade & Horários</h3>
            </div>

            <div className="space-y-6">
              {/* Tempo Semanal */}
              <div className="space-y-3">
                <Label className="text-slate-200 font-medium text-base">
                  Quanto tempo semanal está disponível para capacitação? *
                </Label>
                <RadioGroup
                  value={data.weeklyLearningTime || ''}
                  onValueChange={(value) => handleRadioChange('weeklyLearningTime', value)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {[
                    { value: '1-2h', label: '1-2 horas semanais' },
                    { value: '3-5h', label: '3-5 horas semanais' },
                    { value: '6-10h', label: '6-10 horas semanais' },
                    { value: '10h+', label: 'Mais de 10 horas semanais' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                      <RadioGroupItem value={option.value} id={`time-${option.value}`} className="border-slate-400" />
                      <Label htmlFor={`time-${option.value}`} className="text-white font-normal cursor-pointer flex-1">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {getFieldError?.('weeklyLearningTime') && (
                  <p className="text-red-400 text-sm">{getFieldError('weeklyLearningTime')}</p>
                )}
              </div>

              {/* Melhores Dias */}
              <div className="space-y-3">
                <Label className="text-slate-200 font-medium text-base">
                  Quais os melhores dias da semana para você? *
                </Label>
                <p className="text-slate-400 text-sm">Selecione todos os dias convenientes</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    'Segunda-feira',
                    'Terça-feira', 
                    'Quarta-feira',
                    'Quinta-feira',
                    'Sexta-feira',
                    'Sábado',
                    'Domingo'
                  ].map((day) => (
                    <div key={day} className="flex items-center space-x-2 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                      <Checkbox
                        id={`day-${day}`}
                        checked={(data.bestDays || []).includes(day)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('bestDays', data.bestDays || [], day, checked as boolean)
                        }
                        className="border-slate-400"
                      />
                      <Label htmlFor={`day-${day}`} className="text-white font-normal cursor-pointer text-sm">
                        {day}
                      </Label>
                    </div>
                  ))}
                </div>
                {getFieldError?.('bestDays') && (
                  <p className="text-red-400 text-sm">{getFieldError('bestDays')}</p>
                )}
              </div>

              {/* Melhores Períodos */}
              <div className="space-y-3">
                <Label className="text-slate-200 font-medium text-base">
                  Quais os melhores períodos do dia? *
                </Label>
                <p className="text-slate-400 text-sm">Selecione todos os períodos convenientes</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    'Manhã (6h-12h)',
                    'Tarde (12h-18h)',
                    'Noite (18h-22h)',
                    'Madrugada (22h-6h)'
                  ].map((period) => (
                    <div key={period} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                      <Checkbox
                        id={`period-${period}`}
                        checked={(data.bestPeriods || []).includes(period)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('bestPeriods', data.bestPeriods || [], period, checked as boolean)
                        }
                        className="border-slate-400"
                      />
                      <Label htmlFor={`period-${period}`} className="text-white font-normal cursor-pointer flex-1">
                        {period}
                      </Label>
                    </div>
                  ))}
                </div>
                {getFieldError?.('bestPeriods') && (
                  <p className="text-red-400 text-sm">{getFieldError('bestPeriods')}</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Card: Preferências de Conteúdo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Preferências de Conteúdo</h3>
            </div>

            <div className="space-y-6">
              {/* Formatos de Conteúdo */}
              <div className="space-y-3">
                <Label className="text-slate-200 font-medium text-base">
                  Quais formatos de conteúdo prefere? *
                </Label>
                <p className="text-slate-400 text-sm">Selecione todas as opções de seu interesse</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'Vídeo-aulas práticas',
                    'Documentação técnica',
                    'Podcasts especializados',
                    'Webinars ao vivo',
                    'Exercícios hands-on',
                    'Cases de sucesso',
                    'Infográficos e guias visuais'
                  ].map((format) => (
                    <div key={format} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                      <Checkbox
                        id={`format-${format}`}
                        checked={(data.contentPreference || []).includes(format)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('contentPreference', data.contentPreference || [], format, checked as boolean)
                        }
                        className="border-slate-400"
                      />
                      <Label htmlFor={`format-${format}`} className="text-white font-normal cursor-pointer flex-1">
                        {format}
                      </Label>
                    </div>
                  ))}
                </div>
                {getFieldError?.('contentPreference') && (
                  <p className="text-red-400 text-sm">{getFieldError('contentPreference')}</p>
                )}
              </div>

              {/* Frequência de Conteúdo */}
              <div className="space-y-3">
                <Label className="text-slate-200 font-medium text-base">
                  Com que frequência gostaria de receber novos conteúdos?
                </Label>
                <RadioGroup
                  value={data.contentFrequency || ''}
                  onValueChange={(value) => handleRadioChange('contentFrequency', value)}
                  className="space-y-3"
                >
                  {[
                    { value: 'daily', label: 'Diariamente' },
                    { value: 'weekly', label: 'Semanalmente' },
                    { value: 'biweekly', label: 'Quinzenalmente' },
                    { value: 'monthly', label: 'Mensalmente' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                      <RadioGroupItem value={option.value} id={`freq-${option.value}`} className="border-slate-400" />
                      <Label htmlFor={`freq-${option.value}`} className="text-white font-normal cursor-pointer flex-1">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Card: Interação & Networking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Interação & Networking</h3>
            </div>

            <div className="space-y-6">
              {/* Interesse em Networking */}
              <div className="space-y-3">
                <Label className="text-slate-200 font-medium text-base">
                  Tem interesse em participar de eventos de networking? *
                </Label>
                <RadioGroup
                  value={data.wantsNetworking || ''}
                  onValueChange={(value) => handleRadioChange('wantsNetworking', value)}
                  className="space-y-3"
                >
                  {[
                    { value: 'yes', label: 'Sim, tenho grande interesse' },
                    { value: 'maybe', label: 'Dependendo do evento e agenda' },
                    { value: 'no', label: 'Prefiro focar apenas no conteúdo' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                      <RadioGroupItem value={option.value} id={`networking-${option.value}`} className="border-slate-400" />
                      <Label htmlFor={`networking-${option.value}`} className="text-white font-normal cursor-pointer flex-1">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {getFieldError?.('wantsNetworking') && (
                  <p className="text-red-400 text-sm">{getFieldError('wantsNetworking')}</p>
                )}
              </div>

              {/* Estilo de Interação */}
              <div className="space-y-3">
                <Label className="text-slate-200 font-medium text-base">
                  Como prefere interagir na comunidade?
                </Label>
                <RadioGroup
                  value={data.communityInteractionStyle || ''}
                  onValueChange={(value) => handleRadioChange('communityInteractionStyle', value)}
                  className="space-y-3"
                >
                  {[
                    { value: 'active', label: 'Participação ativa - comentar, compartilhar, liderar discussões' },
                    { value: 'moderate', label: 'Participação moderada - comentar ocasionalmente' },
                    { value: 'observer', label: 'Observador - ler e acompanhar sem comentar muito' },
                    { value: 'private', label: 'Prefiro interações privadas ou em grupos pequenos' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                      <RadioGroupItem value={option.value} id={`interaction-${option.value}`} className="border-slate-400" />
                      <Label htmlFor={`interaction-${option.value}`} className="text-white font-normal cursor-pointer flex-1">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Card: Comunicação & Notificações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Comunicação & Notificações</h3>
            </div>

            <div className="space-y-6">
              {/* Canal Preferido */}
              <div className="space-y-3">
                <Label className="text-slate-200 font-medium text-base">
                  Qual seu canal preferido para comunicação?
                </Label>
                <RadioGroup
                  value={data.preferredCommunicationChannel || ''}
                  onValueChange={(value) => handleRadioChange('preferredCommunicationChannel', value)}
                  className="space-y-3"
                >
                  {[
                    { value: 'email', label: 'E-mail' },
                    { value: 'whatsapp', label: 'WhatsApp' },
                    { value: 'platform', label: 'Notificações na plataforma' },
                    { value: 'minimal', label: 'Comunicação mínima - apenas essencial' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                      <RadioGroupItem value={option.value} id={`comm-${option.value}`} className="border-slate-400" />
                      <Label htmlFor={`comm-${option.value}`} className="text-white font-normal cursor-pointer flex-1">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Tipo de Acompanhamento */}
              <div className="space-y-3">
                <Label className="text-slate-200 font-medium text-base">
                  Que tipo de acompanhamento prefere?
                </Label>
                <RadioGroup
                  value={data.followUpType || ''}
                  onValueChange={(value) => handleRadioChange('followUpType', value)}
                  className="space-y-3"
                >
                  {[
                    { value: 'proactive', label: 'Acompanhamento proativo - lembretes e dicas regulares' },
                    { value: 'milestone', label: 'Apenas em marcos importantes' },
                    { value: 'request', label: 'Somente quando eu solicitar' },
                    { value: 'none', label: 'Prefiro estudar de forma totalmente independente' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                      <RadioGroupItem value={option.value} id={`followup-${option.value}`} className="border-slate-400" />
                      <Label htmlFor={`followup-${option.value}`} className="text-white font-normal cursor-pointer flex-1">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Card: Motivação & Compartilhamento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Motivação & Compartilhamento</h3>
            </div>

            <div className="space-y-6">
              {/* Motivadores */}
              <div className="space-y-3">
                <Label className="text-slate-200 font-medium text-base">
                  O que mais te motiva durante o aprendizado?
                </Label>
                <p className="text-slate-400 text-sm">Selecione até 3 opções</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'Ver resultados práticos rapidamente',
                    'Trocar experiências com outros membros',
                    'Reconhecimento e certificações',
                    'Aplicar conhecimentos no trabalho',
                    'Construir uma rede de contatos',
                    'Estar sempre atualizado com tendências'
                  ].map((motivator) => (
                    <div key={motivator} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                      <Checkbox
                        id={`motivator-${motivator}`}
                        checked={(data.learningMotivators || []).includes(motivator)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('learningMotivators', data.learningMotivators || [], motivator, checked as boolean)
                        }
                        className="border-slate-400"
                      />
                      <Label htmlFor={`motivator-${motivator}`} className="text-white font-normal cursor-pointer flex-1 text-sm">
                        {motivator}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Case de Sucesso */}
              <div className="space-y-3">
                <Label className="text-slate-200 font-medium text-base">
                  Futuramente, gostaria de compartilhar seu case de sucesso? *
                </Label>
                <p className="text-slate-400 text-sm">Isso nos ajuda a entender seu perfil de visibilidade</p>
                <RadioGroup
                  value={data.acceptsCaseStudy || ''}
                  onValueChange={(value) => handleRadioChange('acceptsCaseStudy', value)}
                  className="space-y-3"
                >
                  {[
                    { value: 'yes', label: 'Sim, adoraria compartilhar minha experiência' },
                    { value: 'maybe', label: 'Talvez, dependendo dos resultados' },
                    { value: 'no', label: 'Prefiro manter privacidade total' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                      <RadioGroupItem value={option.value} id={`case-${option.value}`} className="border-slate-400" />
                      <Label htmlFor={`case-${option.value}`} className="text-white font-normal cursor-pointer flex-1">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {getFieldError?.('acceptsCaseStudy') && (
                  <p className="text-red-400 text-sm">{getFieldError('acceptsCaseStudy')}</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MockOnboardingStep5;
