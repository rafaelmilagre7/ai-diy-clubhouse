import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

interface SimpleOnboardingStep3Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

export const SimpleOnboardingStep3: React.FC<SimpleOnboardingStep3Props> = ({
  data,
  onNext,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    how_found_us: data.discovery_info?.how_found_us || '',
    referral_source: data.discovery_info?.referral_source || '',
    ...data.discovery_info
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    onNext(formData);
  };

  const discoveryOptions = [
    { value: 'google', label: 'Pesquisa no Google' },
    { value: 'social_media', label: 'Redes sociais (Instagram, LinkedIn, etc.)' },
    { value: 'friend_referral', label: 'Indicação de amigo/colega' },
    { value: 'content_marketing', label: 'Blog ou conteúdo educativo' },
    { value: 'event', label: 'Evento ou webinar' },
    { value: 'partner', label: 'Parceiro comercial' },
    { value: 'other', label: 'Outro' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          Como você nos encontrou?
        </h2>
        <p className="text-muted-foreground">
          Isso nos ajuda a entender melhor nossos canais de divulgação.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Como você conheceu nossa plataforma?</Label>
          <RadioGroup
            value={formData.how_found_us}
            onValueChange={(value) => handleInputChange('how_found_us', value)}
          >
            {discoveryOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {formData.how_found_us && (
          <div className="space-y-2">
            <Label htmlFor="referral_source">
              Quer nos contar mais detalhes? (opcional)
            </Label>
            <Textarea
              id="referral_source"
              placeholder="Ex: nome da pessoa que indicou, evento específico, palavra-chave de busca..."
              value={formData.referral_source}
              onChange={(e) => handleInputChange('referral_source', e.target.value)}
              rows={3}
            />
          </div>
        )}
      </div>
    </div>
  );
};