import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Mail, Phone, Upload } from 'lucide-react';
import { SimpleOnboardingData } from '@/hooks/useSimpleOnboarding';

interface SimpleStep1Props {
  data: SimpleOnboardingData;
  onNext: (stepData: Partial<SimpleOnboardingData>) => Promise<boolean>;
  isLoading: boolean;
}

export const SimpleStep1: React.FC<SimpleStep1Props> = ({ data, onNext, isLoading }) => {
  const [formData, setFormData] = useState({
    name: data.personal_info.name || '',
    email: data.personal_info.email || '',
    phone: data.personal_info.phone || '',
    profile_picture: data.personal_info.profile_picture || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Atualizar formData quando data mudar
  useEffect(() => {
    setFormData({
      name: data.personal_info.name || '',
      email: data.personal_info.email || '',
      phone: data.personal_info.phone || '',
      profile_picture: data.personal_info.profile_picture || '',
    });
  }, [data.personal_info]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const stepData: Partial<SimpleOnboardingData> = {
      personal_info: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        profile_picture: formData.profile_picture,
      }
    };

    await onNext(stepData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Vamos nos conhecer!</h1>
        <p className="text-muted-foreground">
          Conte-nos um pouco sobre você para personalizarmos sua experiência.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
            <User className="w-4 h-4" />
            Nome completo *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Digite seu nome completo"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
            <Mail className="w-4 h-4" />
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
          {formData.email && formData.email === data.personal_info.email && (
            <p className="text-sm text-muted-foreground">✓ Email pré-preenchido do seu convite</p>
          )}
        </div>

        {/* Telefone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
            <Phone className="w-4 h-4" />
            WhatsApp (opcional)
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Usado para comunicações importantes e suporte
          </p>
        </div>
      </Card>

      {/* Botão de continuar */}
      <div className="flex justify-end">
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