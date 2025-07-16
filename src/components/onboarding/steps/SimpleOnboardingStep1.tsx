import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WhatsAppInput } from '@/components/onboarding/components/WhatsAppInput';
import { BirthDateSelector } from '@/components/onboarding/components/BirthDateSelector';
import { LocationSelector } from '@/components/onboarding/components/LocationSelector';
import { ProfilePictureUpload } from '@/components/onboarding/components/ProfilePictureUpload';
import { User, MapPin, Mail, Phone, Check } from 'lucide-react';

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

export const SimpleOnboardingStep1 = React.memo(forwardRef<Step1Ref, SimpleOnboardingStep1Props>(({
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

  // 🎯 CORREÇÃO: Sincronizar com dados que chegam assincronamente do servidor
  useEffect(() => {
    if (data?.personal_info && Object.keys(data.personal_info).length > 0) {
      console.log('[STEP1] Sincronizando dados do servidor:', data.personal_info);
      
      setFormData(prev => {
        // 🎯 CORREÇÃO: Apenas sincronizar se valor não existe localmente
        const shouldUpdate = (localValue: string, serverValue?: string) => {
          return !localValue && serverValue;
        };
        
        const newFormData = {
          ...prev,
          name: shouldUpdate(prev.name, data.personal_info?.name) ? data.personal_info.name : prev.name,
          email: shouldUpdate(prev.email, data.personal_info?.email) ? data.personal_info.email : prev.email,
          phone: shouldUpdate(prev.phone, data.personal_info?.phone) ? data.personal_info.phone : prev.phone,
          instagram: shouldUpdate(prev.instagram, data.personal_info?.instagram) ? data.personal_info.instagram : prev.instagram,
          linkedin: shouldUpdate(prev.linkedin, data.personal_info?.linkedin) ? data.personal_info.linkedin : prev.linkedin,
          birthDate: shouldUpdate(prev.birthDate, data.personal_info?.birthDate) ? data.personal_info.birthDate : prev.birthDate,
          profilePicture: shouldUpdate(prev.profilePicture, data.personal_info?.profilePicture) ? data.personal_info.profilePicture : prev.profilePicture,
          curiosity: shouldUpdate(prev.curiosity, data.personal_info?.curiosity) ? data.personal_info.curiosity : prev.curiosity,
          state: shouldUpdate(prev.state, data.location_info?.state) ? data.location_info.state : prev.state,
          city: shouldUpdate(prev.city, data.location_info?.city) ? data.location_info.city : prev.city,
          country: shouldUpdate(prev.country, data.location_info?.country) ? data.location_info.country : (prev.country || 'Brasil'),
          timezone: shouldUpdate(prev.timezone, data.location_info?.timezone) ? data.location_info.timezone : (prev.timezone || 'America/Sao_Paulo')
        };
        
        console.log('[STEP1] FormData atualizado de forma inteligente:', {
          before: prev,
          after: newFormData,
          serverData: data.personal_info
        });
        return newFormData;
      });
    }
  }, [data?.personal_info, data?.location_info]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const getFieldError = (field: string) => errors[field];

  // Detectar campos que vieram do convite - CORRIGIDO
  const fromInvite = useMemo(() => {
    const personalInfo = data.personal_info || {};
    
    console.log('🔍 [ONBOARDING] Analisando dados do convite:', {
      personal_info: personalInfo,
      from_invite: personalInfo.from_invite,
      email_from_invite: personalInfo.email_from_invite,
      phone_from_invite: personalInfo.phone_from_invite,
      name_from_invite: personalInfo.name_from_invite,
      email_present: !!personalInfo.email,
      phone_present: !!personalInfo.phone,
      name_present: !!personalInfo.name
    });
    
    return {
      email: Boolean(personalInfo.from_invite || personalInfo.email_from_invite),
      phone: Boolean(personalInfo.phone_from_invite || personalInfo.from_invite),
      name: Boolean(personalInfo.name_from_invite || personalInfo.from_invite)
    };
  }, [data.personal_info]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value
      };
      
      // Notificar mudanças para auto-save (debounced)
      if (onDataChange) {
        onDataChange(getStepDataFromFormData(newFormData));
      }
      
      return newFormData;
    });
    
    // Limpar erro do campo quando usuário digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [onDataChange, errors]);

  const getStepDataFromFormData = useCallback((formData: any) => ({
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
  }), []);

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

  const validateForm = useCallback(() => {
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
  }, [formData.name, formData.email, formData.phone]);

  const getStepData = useCallback(() => getStepDataFromFormData(formData), [formData, getStepDataFromFormData]);

  // Expor métodos para o componente pai com memoização
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
  }), [validateForm, getStepData, errors]);

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
            <Label className="text-foreground flex items-center gap-2">
              Nome Completo *
              {fromInvite.name && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  <Check className="h-3 w-3" />
                  Do convite
                </span>
              )}
            </Label>
            <Input
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`mt-1 bg-background border-border text-foreground ${fromInvite.name ? 'border-primary/50 bg-primary/5' : ''}`}
              placeholder="Seu nome completo"
            />
            {getFieldError('name') && (
              <p className="text-destructive text-sm mt-1">{getFieldError('name')}</p>
            )}
            {fromInvite.name && (
              <p className="text-primary text-xs mt-1 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Este dado foi preenchido automaticamente do seu convite
              </p>
            )}
          </div>

          <div>
            <Label className="text-foreground flex items-center gap-2">
              E-mail *
              {fromInvite.email && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  <Check className="h-3 w-3" />
                  Do convite
                </span>
              )}
            </Label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`mt-1 bg-background border-border text-foreground ${fromInvite.email ? 'border-primary/50 bg-primary/5' : ''}`}
              placeholder="seu@email.com"
            />
            {getFieldError('email') && (
              <p className="text-destructive text-sm mt-1">{getFieldError('email')}</p>
            )}
            {fromInvite.email && (
              <p className="text-primary text-xs mt-1 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Este e-mail foi preenchido automaticamente do seu convite
              </p>
            )}
          </div>

          <WhatsAppInput
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            getFieldError={getFieldError}
            fromInvite={fromInvite.phone}
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
}));

SimpleOnboardingStep1.displayName = 'SimpleOnboardingStep1';