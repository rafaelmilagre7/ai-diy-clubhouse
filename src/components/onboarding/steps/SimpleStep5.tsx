import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Settings, BookOpen, MessageSquare, Clock } from 'lucide-react';
import { SimpleOnboardingData } from '@/hooks/useSimpleOnboarding';

interface SimpleStep5Props {
  data: SimpleOnboardingData;
  onNext: (stepData: Partial<SimpleOnboardingData>) => Promise<boolean>;
  onPrevious: () => void;
  isLoading: boolean;
}

const CONTENT_PREFERENCES = [
  'Tutoriais em vídeo',
  'Artigos e guias escritos',
  'Podcasts',
  'Webinars ao vivo',
  'Casos de uso práticos',
  'Templates e ferramentas',
  'Comunidade e networking'
];

const LEARNING_TIME_OPTIONS = [
  { value: '30min', label: '30 minutos por semana', description: 'Apenas o essencial' },
  { value: '1hour', label: '1 hora por semana', description: 'Aprendizado consistente' },
  { value: '2-3hours', label: '2-3 horas por semana', description: 'Aprendizado acelerado' },
  { value: 'flexible', label: 'Flexível', description: 'Conforme disponibilidade' }
];

const COMMUNICATION_CHANNELS = [
  { value: 'email', label: 'Email', description: 'Newsletters e atualizações' },
  { value: 'whatsapp', label: 'WhatsApp', description: 'Comunicação direta e rápida' },
  { value: 'platform', label: 'Dentro da plataforma', description: 'Notificações no sistema' },
  { value: 'minimal', label: 'Mínima comunicação', description: 'Apenas o essencial' }
];

export const SimpleStep5: React.FC<SimpleStep5Props> = ({ data, onNext, onPrevious, isLoading }) => {
  const [formData, setFormData] = useState({
    content_preference: data.personalization.content_preference || [],
    weekly_learning_time: data.personalization.weekly_learning_time || '',
    preferred_communication_channel: data.personalization.preferred_communication_channel || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Atualizar formData quando data mudar
  useEffect(() => {
    setFormData({
      content_preference: data.personalization.content_preference || [],
      weekly_learning_time: data.personalization.weekly_learning_time || '',
      preferred_communication_channel: data.personalization.preferred_communication_channel || '',
    });
  }, [data.personalization]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.content_preference.length === 0) {
      newErrors.content_preference = 'Selecione pelo menos um tipo de conteúdo';
    }

    if (!formData.weekly_learning_time) {
      newErrors.weekly_learning_time = 'Selecione quanto tempo você tem disponível';
    }

    if (!formData.preferred_communication_channel) {
      newErrors.preferred_communication_channel = 'Selecione como prefere receber comunicações';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const stepData: Partial<SimpleOnboardingData> = {
      personalization: {
        content_preference: formData.content_preference,
        weekly_learning_time: formData.weekly_learning_time,
        preferred_communication_channel: formData.preferred_communication_channel,
      }
    };

    await onNext(stepData);
  };

  const handleContentToggle = (content: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      content_preference: checked 
        ? [...prev.content_preference, content]
        : prev.content_preference.filter(c => c !== content)
    }));
    
    // Limpar erro quando o usuário faz uma seleção
    if (errors.content_preference) {
      setErrors(prev => ({ ...prev, content_preference: '' }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro quando o usuário faz uma seleção
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Personalização</h1>
        <p className="text-muted-foreground">
          Vamos personalizar sua experiência de aprendizado para maximizar seus resultados.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Preferências de conteúdo */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <BookOpen className="w-4 h-4" />
            Que tipo de conteúdo você prefere? * (selecione todos que interessam)
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {CONTENT_PREFERENCES.map((content) => (
              <div key={content} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                <Checkbox
                  id={content}
                  checked={formData.content_preference.includes(content)}
                  onCheckedChange={(checked) => handleContentToggle(content, checked as boolean)}
                />
                <Label htmlFor={content} className="cursor-pointer flex-1">
                  {content}
                </Label>
              </div>
            ))}
          </div>
          {errors.content_preference && (
            <p className="text-sm text-red-500">{errors.content_preference}</p>
          )}
        </div>

        {/* Tempo de aprendizado */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Clock className="w-4 h-4" />
            Quanto tempo você tem para aprender por semana? *
          </Label>
          <RadioGroup
            value={formData.weekly_learning_time}
            onValueChange={(value) => handleInputChange('weekly_learning_time', value)}
          >
            {LEARNING_TIME_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                <div className="space-y-1 flex-1">
                  <Label htmlFor={option.value} className="font-medium cursor-pointer">
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
          {errors.weekly_learning_time && (
            <p className="text-sm text-red-500">{errors.weekly_learning_time}</p>
          )}
        </div>

        {/* Canal de comunicação */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="w-4 h-4" />
            Como prefere receber nossas comunicações? *
          </Label>
          <RadioGroup
            value={formData.preferred_communication_channel}
            onValueChange={(value) => handleInputChange('preferred_communication_channel', value)}
          >
            {COMMUNICATION_CHANNELS.map((channel) => (
              <div key={channel.value} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                <RadioGroupItem value={channel.value} id={channel.value} className="mt-1" />
                <div className="space-y-1 flex-1">
                  <Label htmlFor={channel.value} className="font-medium cursor-pointer">
                    {channel.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{channel.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
          {errors.preferred_communication_channel && (
            <p className="text-sm text-red-500">{errors.preferred_communication_channel}</p>
          )}
        </div>
      </Card>

      {/* Navegação */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} disabled={isLoading}>
          ← Voltar
        </Button>
        
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            'Continuar →'
          )}
        </Button>
      </div>
    </div>
  );
};