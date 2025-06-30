
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';
import { WhatsAppInput } from '@/components/onboarding/components/WhatsAppInput';
import { LocationSelector } from '@/components/onboarding/components/LocationSelector';
import { BirthDateSelector } from '@/components/onboarding/components/BirthDateSelector';
import { ProfilePictureUpload } from '@/components/onboarding/components/ProfilePictureUpload';

interface MockOnboardingStep1Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  getFieldError?: (field: string) => string | undefined;
}

const MockOnboardingStep1: React.FC<MockOnboardingStep1Props> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    onUpdateData({ [field]: value });
  };

  const handleBirthDateChange = (day: string, month: string, year: string) => {
    const birthDate = day && month && year ? `${day}/${month}/${year}` : '';
    onUpdateData({ 
      birthDate,
      birthDay: day,
      birthMonth: month,
      birthYear: year
    });
  };

  const handleLocationChange = (field: 'state' | 'city', value: string) => {
    onUpdateData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card className="bg-[#1a1f2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-xl">
            👋 Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nome Completo */}
          <div>
            <Label htmlFor="name" className="text-slate-200">
              Nome Completo *
            </Label>
            <Input
              id="name"
              value={data.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Digite seu nome completo"
              className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-gray-400"
            />
            {getFieldError?.('name') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('name')}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-slate-200">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="seu@email.com"
              className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-gray-400"
            />
            {getFieldError?.('email') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('email')}</p>
            )}
          </div>

          {/* WhatsApp */}
          <WhatsAppInput
            value={data.phone || ''}
            onChange={(value) => handleInputChange('phone', value)}
            getFieldError={getFieldError}
          />
        </CardContent>
      </Card>

      {/* Redes Sociais */}
      <Card className="bg-[#1a1f2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-xl">
            🌐 Redes Sociais (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instagram */}
          <div>
            <Label htmlFor="instagram" className="text-slate-200">
              Instagram
            </Label>
            <Input
              id="instagram"
              value={data.instagram || ''}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              placeholder="@seuusuario ou link completo"
              className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <Label htmlFor="linkedin" className="text-slate-200">
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              value={data.linkedin || ''}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              placeholder="Link do seu perfil LinkedIn"
              className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Localização */}
      <Card className="bg-[#1a1f2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-xl">
            📍 Localização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LocationSelector
            selectedState={data.state}
            selectedCity={data.city}
            onStateChange={(value) => handleLocationChange('state', value)}
            onCityChange={(value) => handleLocationChange('city', value)}
            getFieldError={getFieldError}
          />
        </CardContent>
      </Card>

      {/* Informações Pessoais */}
      <Card className="bg-[#1a1f2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-xl">
            🎂 Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data de Nascimento */}
          <BirthDateSelector
            birthDay={data.birthDay}
            birthMonth={data.birthMonth}
            birthYear={data.birthYear}
            onChange={handleBirthDateChange}
            getFieldError={getFieldError}
          />

          {/* Curiosidade */}
          <div>
            <Label htmlFor="curiosity" className="text-slate-200">
              Conte algo interessante sobre você (Opcional)
            </Label>
            <Textarea
              id="curiosity"
              value={data.curiosity || ''}
              onChange={(e) => handleInputChange('curiosity', e.target.value)}
              placeholder="Uma curiosidade, hobby, ou algo que gosta de fazer..."
              className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-gray-400 resize-none"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-slate-400 mt-1">
              {(data.curiosity || '').length}/200 caracteres
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Foto de Perfil */}
      <Card className="bg-[#1a1f2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-xl">
            📸 Foto de Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProfilePictureUpload
            value={data.profilePicture}
            onChange={(value) => handleInputChange('profilePicture', value)}
            userName={data.name}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MockOnboardingStep1;
