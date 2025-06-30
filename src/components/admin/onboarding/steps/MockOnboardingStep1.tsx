
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
import { User, Globe, MapPin, Calendar, Camera } from 'lucide-react';

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
    <div className="space-y-8">
      {/* Informações Básicas */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg font-semibold flex items-center gap-3">
            <User className="h-5 w-5 text-viverblue" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nome Completo */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-200 font-medium">
              Nome Completo *
            </Label>
            <Input
              id="name"
              value={data.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Informe seu nome completo"
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
            />
            {getFieldError?.('name') && (
              <p className="text-red-400 text-sm">{getFieldError('name')}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200 font-medium">
              Email Corporativo *
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="exemplo@empresa.com.br"
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
            />
            {getFieldError?.('email') && (
              <p className="text-red-400 text-sm">{getFieldError('email')}</p>
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
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg font-semibold flex items-center gap-3">
            <Globe className="h-5 w-5 text-viverblue" />
            Redes Sociais Profissionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instagram */}
          <div className="space-y-2">
            <Label htmlFor="instagram" className="text-slate-200 font-medium">
              Instagram Empresarial
            </Label>
            <Input
              id="instagram"
              value={data.instagram || ''}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              placeholder="@empresa ou link completo"
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedin" className="text-slate-200 font-medium">
              Perfil LinkedIn
            </Label>
            <Input
              id="linkedin"
              value={data.linkedin || ''}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              placeholder="URL do perfil LinkedIn"
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
            />
          </div>
        </CardContent>
      </Card>

      {/* Localização */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg font-semibold flex items-center gap-3">
            <MapPin className="h-5 w-5 text-viverblue" />
            Localização
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

      {/* Informações Complementares */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg font-semibold flex items-center gap-3">
            <Calendar className="h-5 w-5 text-viverblue" />
            Informações Complementares
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data de Nascimento */}
          <BirthDateSelector
            birthDay={data.birthDay}
            birthMonth={data.birthMonth}
            birthYear={data.birthYear}
            onChange={handleBirthDateChange}
            getFieldError={getFieldError}
          />

          {/* Apresentação Pessoal */}
          <div className="space-y-2">
            <Label htmlFor="curiosity" className="text-slate-200 font-medium">
              Apresentação Pessoal
            </Label>
            <Textarea
              id="curiosity"
              value={data.curiosity || ''}
              onChange={(e) => handleInputChange('curiosity', e.target.value)}
              placeholder="Conte brevemente sobre sua trajetória profissional ou área de interesse..."
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue resize-none"
              rows={3}
              maxLength={300}
            />
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Opcional</span>
              <span className="text-slate-400">
                {(data.curiosity || '').length}/300 caracteres
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Foto de Perfil */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg font-semibold flex items-center gap-3">
            <Camera className="h-5 w-5 text-viverblue" />
            Foto de Perfil
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
