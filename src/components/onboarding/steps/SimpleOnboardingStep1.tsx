import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SimpleOnboardingStep1Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

export const SimpleOnboardingStep1: React.FC<SimpleOnboardingStep1Props> = ({
  data,
  onNext,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: data.personal_info?.name || '',
    email: data.personal_info?.email || '',
    phone: data.personal_info?.phone || '',
    birth_date: data.personal_info?.birth_date || '',
    ...data.personal_info
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (!formData.name || !formData.email) {
      return;
    }
    onNext(formData);
  };

  const isValid = formData.name && formData.email;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          Vamos nos conhecer melhor
        </h2>
        <p className="text-muted-foreground">
          Para criar uma experiência personalizada, precisamos conhecer você.
        </p>
      </div>

      {/* Form */}
      <div className="grid gap-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome completo *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email profissional *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">
              Telefone/WhatsApp
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date">
              Data de nascimento
            </Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => handleInputChange('birth_date', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Privacy note */}
      <div className="bg-muted rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          🔒 Suas informações estão seguras - Utilizamos criptografia avançada 
          e seguimos as melhores práticas de segurança para proteger seus dados.
        </p>
      </div>
    </div>
  );
};