
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';
import { User, MapPin, Calendar, MessageCircle, Camera } from 'lucide-react';
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

  // Simular que email e WhatsApp podem vir pré-preenchidos
  const isEmailPreFilled = !!data.email;
  const isPhonePreFilled = !!data.phone;

  return (
    <div className="space-y-6">
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
              placeholder="Seu nome completo"
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
            />
            {getFieldError?.('name') && (
              <p className="text-red-400 text-sm">{getFieldError('name')}</p>
            )}
          </div>

          {/* E-mail (travado se pré-preenchido) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200 font-medium">
              E-mail *
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="seu@email.com"
              disabled={isEmailPreFilled}
              className={`${
                isEmailPreFilled 
                  ? 'bg-slate-700/30 border-slate-700 text-slate-300 cursor-not-allowed' 
                  : 'bg-slate-800/50 border-slate-600 text-white focus:border-viverblue'
              } placeholder:text-slate-400`}
            />
            {isEmailPreFilled && (
              <p className="text-slate-400 text-xs">E-mail fornecido pelo convite</p>
            )}
            {getFieldError?.('email') && (
              <p className="text-red-400 text-sm">{getFieldError('email')}</p>
            )}
          </div>

          {/* WhatsApp (travado se pré-preenchido) */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-200 font-medium">
              WhatsApp *
            </Label>
            {isPhonePreFilled ? (
              <div>
                <Input
                  id="phone"
                  value={data.phone || ''}
                  disabled
                  className="bg-slate-700/30 border-slate-700 text-slate-300 cursor-not-allowed placeholder:text-slate-400"
                />
                <p className="text-slate-400 text-xs mt-1">WhatsApp fornecido pelo convite</p>
              </div>
            ) : (
              <WhatsAppInput
                value={data.phone || ''}
                onChange={(value) => handleInputChange('phone', value)}
                getFieldError={getFieldError}
              />
            )}
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
            selectedState={data.state || ''}
            selectedCity={data.city || ''}
            onStateChange={(value) => handleInputChange('state', value)}
            onCityChange={(value) => handleInputChange('city', value)}
            getFieldError={getFieldError}
          />
        </CardContent>
      </Card>

      {/* Redes Sociais */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg font-semibold flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-viverblue" />
            Redes Sociais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instagram */}
          <div className="space-y-2">
            <Label htmlFor="instagram" className="text-slate-200 font-medium">
              Instagram
            </Label>
            <Input
              id="instagram"
              value={data.instagram || ''}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              placeholder="@seuusuario ou link completo"
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedin" className="text-slate-200 font-medium">
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              value={data.linkedin || ''}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/seuperfil"
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
            />
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg font-semibold flex items-center gap-3">
            <Calendar className="h-5 w-5 text-viverblue" />
            Informações Adicionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data de Nascimento */}
          <div className="space-y-2">
            <Label className="text-slate-200 font-medium">
              Data de Nascimento
            </Label>
            <BirthDateSelector
              birthDay={data.birthDay || ''}
              birthMonth={data.birthMonth || ''}
              birthYear={data.birthYear || ''}
              onDayChange={(value) => handleInputChange('birthDay', value)}
              onMonthChange={(value) => handleInputChange('birthMonth', value)}
              onYearChange={(value) => handleInputChange('birthYear', value)}
            />
          </div>

          {/* Curiosidade */}
          <div className="space-y-2">
            <Label htmlFor="curiosity" className="text-slate-200 font-medium">
              Conte-nos uma curiosidade sobre você
            </Label>
            <Textarea
              id="curiosity"
              value={data.curiosity || ''}
              onChange={(e) => handleInputChange('curiosity', e.target.value)}
              placeholder="Algo interessante sobre sua trajetória, hobbies ou experiências..."
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue min-h-[100px]"
            />
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
            currentImage={data.profilePicture || ''}
            onImageChange={(value) => handleInputChange('profilePicture', value)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MockOnboardingStep1;
