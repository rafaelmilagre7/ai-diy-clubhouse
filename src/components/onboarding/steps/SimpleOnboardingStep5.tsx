import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Clock, 
  Calendar, 
  BookOpen, 
  Users, 
  MessageCircle, 
  Heart,
  UserCheck
} from 'lucide-react';

interface SimpleOnboardingStep5Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
  onDataChange?: (data: any) => void;
}

export const SimpleOnboardingStep5: React.FC<SimpleOnboardingStep5Props> = ({
  data,
  onNext,
  isLoading = false,
  onDataChange
}) => {
  const [formData, setFormData] = useState({
    weeklyLearningTime: data.personalization?.weeklyLearningTime || '',
    bestDays: data.personalization?.bestDays || [],
    bestPeriods: data.personalization?.bestPeriods || [],
    contentPreference: data.personalization?.contentPreference || [],
    contentFrequency: data.personalization?.contentFrequency || '',
    wantsNetworking: data.personalization?.wantsNetworking || '',
    communityInteractionStyle: data.personalization?.communityInteractionStyle || '',
    preferredCommunicationChannel: data.personalization?.preferredCommunicationChannel || '',
    followUpType: data.personalization?.followUpType || '',
    motivationSharing: data.personalization?.motivationSharing || '',
    ...data.personalization
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value
      };
      
      // Notificar mudanças para auto-save do componente pai
      if (onDataChange) {
        onDataChange(newFormData);
      }
      
      return newFormData;
    });
  };

  const handleNext = () => {
    // Enviar dados estruturados para o wizard
    onNext({ personalization: formData });
  };

  const handleRadioChange = (field: string, value: string) => {
    handleInputChange(field, value);
  };

  const handleCheckboxChange = (field: string, values: string[], value: string, checked: boolean) => {
    let newValues = [...values];
    if (checked) {
      if (!newValues.includes(value)) {
        newValues.push(value);
      }
    } else {
      newValues = newValues.filter(v => v !== value);
    }
    handleInputChange(field, newValues);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4 mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent/25"
        >
          <Heart className="w-10 h-10 text-accent animate-pulse" />
        </motion.div>
        <h2 className="text-3xl font-bold text-foreground mb-3 bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
          Sua Experiência Personalizada ✨
        </h2>
        <p className="text-muted-foreground text-lg">
          🎨 Vamos ajustar tudo para funcionar perfeitamente com seu estilo
        </p>
        <p className="text-muted-foreground text-sm">
          ⚡ Cada preferência torna sua jornada mais eficiente e prazerosa
        </p>
      </div>

      <div className="grid gap-6">
        {/* Card: Disponibilidade & Horários */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 bg-gradient-to-br from-card/60 to-muted/30 border border-border backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Seu Tempo Disponível ⏰</h3>
                <p className="text-muted-foreground text-sm">Como você prefere organizar seu aprendizado?</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Tempo Semanal */}
              <div className="space-y-4">
                <Label className="text-foreground font-medium text-lg">
                  ⚡ Quantas horas por semana você pode investir em seu crescimento? *
                </Label>
                <p className="text-muted-foreground text-sm">🎯 Seja realista - qualidade supera quantidade sempre!</p>
                <RadioGroup
                  value={formData.weeklyLearningTime}
                  onValueChange={(value) => handleRadioChange('weeklyLearningTime', value)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {[
                    { value: '1-2h', label: '1-2 horas semanais' },
                    { value: '3-5h', label: '3-5 horas semanais' },
                    { value: '6-10h', label: '6-10 horas semanais' },
                    { value: '10h+', label: 'Mais de 10 horas semanais' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg bg-background/60 border border-border">
                      <RadioGroupItem value={option.value} id={`time-${option.value}`} className="border-border" />
                      <Label htmlFor={`time-${option.value}`} className="text-foreground font-normal cursor-pointer flex-1">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Melhores Dias */}
              <div className="space-y-3">
                <Label className="text-foreground font-medium text-base">
                  Quais os melhores dias da semana para você? *
                </Label>
                <p className="text-muted-foreground text-sm">Selecione todos os dias convenientes</p>
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
                    <div key={day} className="flex items-center space-x-2 p-3 rounded-lg bg-background/60 border border-border">
                      <Checkbox
                        id={`day-${day}`}
                        checked={(formData.bestDays || []).includes(day)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('bestDays', formData.bestDays || [], day, checked as boolean)
                        }
                        className="border-border"
                      />
                      <Label htmlFor={`day-${day}`} className="text-foreground font-normal cursor-pointer text-sm">
                        {day}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Melhores Períodos */}
              <div className="space-y-3">
                <Label className="text-foreground font-medium text-base">
                  Quais os melhores períodos do dia? *
                </Label>
                <p className="text-muted-foreground text-sm">Selecione todos os períodos convenientes</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    'Manhã (6h-12h)',
                    'Tarde (12h-18h)',
                    'Noite (18h-22h)',
                    'Madrugada (22h-6h)'
                  ].map((period) => (
                    <div key={period} className="flex items-center space-x-3 p-3 rounded-lg bg-background/60 border border-border">
                      <Checkbox
                        id={`period-${period}`}
                        checked={(formData.bestPeriods || []).includes(period)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('bestPeriods', formData.bestPeriods || [], period, checked as boolean)
                        }
                        className="border-border"
                      />
                      <Label htmlFor={`period-${period}`} className="text-foreground font-normal cursor-pointer flex-1">
                        {period}
                      </Label>
                    </div>
                  ))}
                </div>
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
          <Card className="p-6 bg-card/50 border-border backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Preferências de Conteúdo</h3>
            </div>

            <div className="space-y-6">
              {/* Formatos de Conteúdo */}
              <div className="space-y-3">
                <Label className="text-foreground font-medium text-base">
                  Quais formatos de conteúdo prefere? *
                </Label>
                <p className="text-muted-foreground text-sm">Selecione todas as opções de seu interesse</p>
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
                    <div key={format} className="flex items-center space-x-3 p-3 rounded-lg bg-background/60 border border-border">
                      <Checkbox
                        id={`format-${format}`}
                        checked={(formData.contentPreference || []).includes(format)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('contentPreference', formData.contentPreference || [], format, checked as boolean)
                        }
                        className="border-border"
                      />
                      <Label htmlFor={`format-${format}`} className="text-foreground font-normal cursor-pointer flex-1">
                        {format}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Frequência de Conteúdo */}
              <div className="space-y-3">
                <Label className="text-foreground font-medium text-base">
                  Com que frequência gostaria de receber novos conteúdos?
                </Label>
                <RadioGroup
                  value={formData.contentFrequency}
                  onValueChange={(value) => handleRadioChange('contentFrequency', value)}
                  className="space-y-3"
                >
                  {[
                    { value: 'daily', label: 'Diariamente' },
                    { value: 'weekly', label: 'Semanalmente' },
                    { value: 'biweekly', label: 'Quinzenalmente' },
                    { value: 'monthly', label: 'Mensalmente' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg bg-background/60 border border-border">
                      <RadioGroupItem value={option.value} id={`freq-${option.value}`} className="border-border" />
                      <Label htmlFor={`freq-${option.value}`} className="text-foreground font-normal cursor-pointer flex-1">
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
          <Card className="p-6 bg-card/50 border-border backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Interação & Networking</h3>
            </div>

            <div className="space-y-6">
              {/* Interesse em Networking */}
              <div className="space-y-3">
                <Label className="text-foreground font-medium text-base">
                  Tem interesse em participar de eventos de networking? *
                </Label>
                <RadioGroup
                  value={formData.wantsNetworking}
                  onValueChange={(value) => handleRadioChange('wantsNetworking', value)}
                  className="space-y-3"
                >
                  {[
                    { value: 'yes', label: 'Sim, tenho grande interesse' },
                    { value: 'maybe', label: 'Dependendo do evento e agenda' },
                    { value: 'no', label: 'Prefiro focar apenas no conteúdo' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg bg-background/60 border border-border">
                      <RadioGroupItem value={option.value} id={`networking-${option.value}`} className="border-border" />
                      <Label htmlFor={`networking-${option.value}`} className="text-foreground font-normal cursor-pointer flex-1">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Estilo de Interação */}
              <div className="space-y-3">
                <Label className="text-foreground font-medium text-base">
                  Como prefere interagir na comunidade?
                </Label>
                <RadioGroup
                  value={formData.communityInteractionStyle}
                  onValueChange={(value) => handleRadioChange('communityInteractionStyle', value)}
                  className="space-y-3"
                >
                  {[
                    { value: 'active', label: 'Participação ativa - comentar, compartilhar, liderar discussões' },
                    { value: 'moderate', label: 'Participação moderada - comentar ocasionalmente' },
                    { value: 'observer', label: 'Observador - ler e acompanhar sem comentar muito' },
                    { value: 'private', label: 'Prefiro interações privadas ou em grupos pequenos' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg bg-background/60 border border-border">
                      <RadioGroupItem value={option.value} id={`interaction-${option.value}`} className="border-border" />
                      <Label htmlFor={`interaction-${option.value}`} className="text-foreground font-normal cursor-pointer flex-1">
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
          <Card className="p-6 bg-card/50 border-border backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Comunicação & Notificações</h3>
            </div>

            <div className="space-y-6">
              {/* Canal Preferido */}
              <div className="space-y-3">
                <Label className="text-foreground font-medium text-base">
                  Qual seu canal preferido para comunicação?
                </Label>
                <RadioGroup
                  value={formData.preferredCommunicationChannel}
                  onValueChange={(value) => handleRadioChange('preferredCommunicationChannel', value)}
                  className="space-y-3"
                >
                  {[
                    { value: 'email', label: 'E-mail' },
                    { value: 'whatsapp', label: 'WhatsApp' },
                    { value: 'platform', label: 'Notificações na plataforma' },
                    { value: 'minimal', label: 'Comunicação mínima - apenas essencial' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg bg-background/60 border border-border">
                      <RadioGroupItem value={option.value} id={`comm-${option.value}`} className="border-border" />
                      <Label htmlFor={`comm-${option.value}`} className="text-foreground font-normal cursor-pointer flex-1">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Tipo de Acompanhamento */}
              <div className="space-y-3">
                <Label className="text-foreground font-medium text-base">
                  Que tipo de acompanhamento prefere?
                </Label>
                <RadioGroup
                  value={formData.followUpType}
                  onValueChange={(value) => handleRadioChange('followUpType', value)}
                  className="space-y-3"
                >
                  {[
                    { value: 'proactive', label: 'Acompanhamento proativo - lembretes e sugestões personalizadas' },
                    { value: 'moderate', label: 'Moderado - apenas marcos importantes e novidades' },
                    { value: 'minimal', label: 'Mínimo - somente quando eu solicitar' },
                    { value: 'none', label: 'Prefiro total autonomia sem acompanhamento' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg bg-background/60 border border-border">
                      <RadioGroupItem value={option.value} id={`follow-${option.value}`} className="border-border" />
                      <Label htmlFor={`follow-${option.value}`} className="text-foreground font-normal cursor-pointer flex-1">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>

    </div>
  );
};