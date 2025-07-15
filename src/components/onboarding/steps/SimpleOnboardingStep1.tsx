import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WhatsAppInput } from '@/components/onboarding/components/WhatsAppInput';
import { BirthDateSelector } from '@/components/onboarding/components/BirthDateSelector';
import { LocationSelector } from '@/components/onboarding/components/LocationSelector';
import { ProfilePictureUpload } from '@/components/onboarding/components/ProfilePictureUpload';
import { User, MapPin } from 'lucide-react';

interface SimpleOnboardingStep1Props {
  data: any;
  onNext: (data: any) => void;
  onDataChange?: (data: any) => void;
  isLoading?: boolean;
}

export interface Step1Ref {
  validate: () => boolean;
  getData: () => any;
}

export const SimpleOnboardingStep1 = forwardRef<Step1Ref, SimpleOnboardingStep1Props>(({
  data,
  onNext,
  onDataChange,
  isLoading = false
}, ref) => {
  const [formData, setFormData] = useState({
    // Dados pessoais
    name: data.personal_info?.name || '',
    email: data.personal_info?.email || '',
    phone: data.personal_info?.phone || '',
    instagram: data.personal_info?.instagram || '',
    linkedin: data.personal_info?.linkedin || '',
    birthDate: data.personal_info?.birthDate || '',
    profilePicture: data.personal_info?.profilePicture || '',
    curiosity: data.personal_info?.curiosity || '',
    
    // Dados de localização
    state: data.location_info?.state || '',
    city: data.location_info?.city || '',
    country: data.location_info?.country || 'Brasil',
    timezone: data.location_info?.timezone || 'America/Sao_Paulo'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const getFieldError = (field: string) => errors[field];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando usuário digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const extractDateComponents = (dateString: string) => {
    if (!dateString) return { day: '', month: '', year: '' };
    
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      
      return { day, month, year };
    } catch {
      return { day: '', month: '', year: '' };
    }
  };

  const { day: birthDay, month: birthMonth, year: birthYear } = extractDateComponents(formData.birthDate);

  const handleBirthDateChange = (day: string, month: string, year: string) => {
    if (day && month && year) {
      const birthDate = `${year}-${month}-${day}`;
      handleInputChange('birthDate', birthDate);
    } else {
      handleInputChange('birthDate', '');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validação mais tolerante - apenas nome e email obrigatórios
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // WhatsApp opcional no Step 1
    if (formData.phone.trim() && formData.phone.length < 10) {
      newErrors.phone = 'WhatsApp deve ter pelo menos 10 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getStepData = () => ({
    personal_info: {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      instagram: formData.instagram,
      linkedin: formData.linkedin,
      birthDate: formData.birthDate,
      profilePicture: formData.profilePicture,
      curiosity: formData.curiosity
    },
    location_info: {
      state: formData.state,
      city: formData.city,
      country: formData.country,
      timezone: formData.timezone
    }
  });

  // Expor métodos para o componente pai
  useImperativeHandle(ref, () => ({
    validate: () => {
      const isValid = validateForm();
      if (!isValid) {
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
          const element = document.querySelector(`[name="${firstErrorField}"], [data-field="${firstErrorField}"]`);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return isValid;
    },
    getData: getStepData
  }), [formData, errors]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <User className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">
          Vamos nos conhecer melhor
        </h2>
        <p className="text-muted-foreground text-lg">
          Para criar uma experiência personalizada, precisamos conhecer você
        </p>
      </div>

      {/* Informações Pessoais */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-foreground">Nome Completo *</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="mt-1 bg-background border-border text-foreground"
              placeholder="Seu nome completo"
            />
            {getFieldError('name') && (
              <p className="text-destructive text-sm mt-1">{getFieldError('name')}</p>
            )}
          </div>

          <div>
            <Label className="text-foreground">E-mail *</Label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="mt-1 bg-background border-border text-foreground"
              placeholder="seu@email.com"
            />
            {getFieldError('email') && (
              <p className="text-destructive text-sm mt-1">{getFieldError('email')}</p>
            )}
          </div>

          <WhatsAppInput
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            getFieldError={getFieldError}
          />

          <div>
            <Label className="text-foreground">Instagram</Label>
            <Input
              value={formData.instagram}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              className="mt-1 bg-background border-border text-foreground"
              placeholder="@seuinstagram"
            />
          </div>

          <div>
            <Label className="text-foreground">LinkedIn</Label>
            <Input
              value={formData.linkedin}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              className="mt-1 bg-background border-border text-foreground"
              placeholder="https://linkedin.com/in/seuperfil"
            />
          </div>

          <BirthDateSelector
            birthDay={birthDay}
            birthMonth={birthMonth}
            birthYear={birthYear}
            onChange={handleBirthDateChange}
            getFieldError={getFieldError}
          />

          <ProfilePictureUpload
            value={formData.profilePicture}
            onChange={(url) => handleInputChange('profilePicture', url)}
            userName={formData.name}
          />

          <div>
            <Label className="text-foreground">Curiosidade sobre você</Label>
            <Textarea
              value={formData.curiosity}
              onChange={(e) => handleInputChange('curiosity', e.target.value)}
              className="mt-1 bg-background border-border text-foreground"
              placeholder="Conte algo interessante sobre você..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Localização */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Onde você está localizado?
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Opcional - você pode preencher depois
          </p>
        </CardHeader>
        <CardContent>
          <LocationSelector
            selectedState={formData.state}
            selectedCity={formData.city}
            onStateChange={(state) => handleInputChange('state', state)}
            onCityChange={(city) => handleInputChange('city', city)}
            getFieldError={getFieldError}
          />
        </CardContent>
      </Card>

      {/* Privacy note */}
      <div className="bg-muted/50 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Suas informações estão seguras - Utilizamos criptografia avançada 
          e seguimos as melhores práticas de segurança para proteger seus dados.
        </p>
      </div>
    </div>
  );
});

SimpleOnboardingStep1.displayName = 'SimpleOnboardingStep1';