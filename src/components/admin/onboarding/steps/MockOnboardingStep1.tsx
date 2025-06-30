
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';
import { BirthDateSelector } from '@/components/onboarding/components/BirthDateSelector';
import { LocationSelector } from '@/components/onboarding/components/LocationSelector';
import { WhatsAppInput } from '@/components/onboarding/components/WhatsAppInput';
import { ProfilePictureUpload } from '@/components/onboarding/components/ProfilePictureUpload';
import { User, Instagram, Linkedin, Lightbulb } from 'lucide-react';

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
    onUpdateData({
      birthDay: day,
      birthMonth: month,
      birthYear: year
    });
  };

  const handleProfilePictureChange = (value: string) => {
    onUpdateData({ profilePicture: value });
  };

  const handleStateChange = (state: string) => {
    onUpdateData({ state });
  };

  const handleCityChange = (city: string) => {
    onUpdateData({ city });
  };

  const currentPhone = data.phone || '';

  return (
    <div className="space-y-8">
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
              placeholder="Digite seu nome completo"
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
            />
            {getFieldError?.('name') && (
              <p className="text-red-400 text-sm">{getFieldError('name')}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200 font-medium">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="seu@email.com"
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
            />
            {getFieldError?.('email') && (
              <p className="text-red-400 text-sm">{getFieldError('email')}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-200 font-medium">
              WhatsApp *
            </Label>
            <WhatsAppInput
              value={currentPhone}
              onChange={(value: string) => handleInputChange('phone', value)}
            />
            {getFieldError?.('phone') && (
              <p className="text-red-400 text-sm">{getFieldError('phone')}</p>
            )}
          </div>

          {/* Data de Nascimento */}
          <div className="space-y-2">
            <Label className="text-slate-200 font-medium">
              Data de Nascimento *
            </Label>
            <BirthDateSelector
              birthDay={data.birthDay || ''}
              birthMonth={data.birthMonth || ''}
              birthYear={data.birthYear || ''}
              onChange={handleBirthDateChange}
            />
            {(getFieldError?.('birthDay') || getFieldError?.('birthMonth') || getFieldError?.('birthYear')) && (
              <p className="text-red-400 text-sm">
                {getFieldError?.('birthDay') || getFieldError?.('birthMonth') || getFieldError?.('birthYear')}
              </p>
            )}
          </div>

          {/* Localização */}
          <div className="space-y-2">
            <Label className="text-slate-200 font-medium">
              Localização *
            </Label>
            <LocationSelector
              selectedState={data.state || ''}
              selectedCity={data.city || ''}
              onStateChange={handleStateChange}
              onCityChange={handleCityChange}
              getFieldError={getFieldError}
            />
          </div>

          {/* Redes Sociais */}
          <div className="space-y-4">
            <Label className="text-slate-200 font-medium">
              Redes Sociais (Opcional)
            </Label>
            
            {/* Instagram */}
            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-slate-200 font-medium flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram
              </Label>
              <Input
                id="instagram"
                value={data.instagram || ''}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                placeholder="@seuusuario ou https://instagram.com/seuusuario"
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
              />
              {getFieldError?.('instagram') && (
                <p className="text-red-400 text-sm">{getFieldError('instagram')}</p>
              )}
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-slate-200 font-medium flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                value={data.linkedin || ''}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/seuperfil"
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
              />
              {getFieldError?.('linkedin') && (
                <p className="text-red-400 text-sm">{getFieldError('linkedin')}</p>
              )}
            </div>
          </div>

          {/* Curiosidade */}
          <div className="space-y-2">
            <Label htmlFor="curiosity" className="text-slate-200 font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Conte algo interessante sobre você (Opcional)
            </Label>
            <Textarea
              id="curiosity"
              value={data.curiosity || ''}
              onChange={(e) => handleInputChange('curiosity', e.target.value)}
              placeholder="Um hobby, uma paixão, algo que te define..."
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue min-h-[100px]"
              rows={4}
            />
            {getFieldError?.('curiosity') && (
              <p className="text-red-400 text-sm">{getFieldError('curiosity')}</p>
            )}
          </div>

          {/* Foto de Perfil */}
          <div className="space-y-2">
            <Label className="text-slate-200 font-medium">
              Foto de Perfil (Opcional)
            </Label>
            <ProfilePictureUpload
              value={data.profilePicture || ''}
              onChange={handleProfilePictureChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockOnboardingStep1;
