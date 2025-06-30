
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';
import { BirthDateSelector } from '@/components/onboarding/components/BirthDateSelector';
import { LocationSelector } from '@/components/onboarding/components/LocationSelector';
import { WhatsAppInput } from '@/components/onboarding/components/WhatsAppInput';
import { ProfilePictureUpload } from '@/components/onboarding/components/ProfilePictureUpload';
import { User } from 'lucide-react';

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

  const handleLocationChange = (location: { city: string; state: string }) => {
    onUpdateData({
      city: location.city,
      state: location.state
    });
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
              city={data.city || ''}
              state={data.state || ''}
              onChange={handleLocationChange}
            />
            {(getFieldError?.('city') || getFieldError?.('state')) && (
              <p className="text-red-400 text-sm">
                {getFieldError?.('city') || getFieldError?.('state')}
              </p>
            )}
          </div>

          {/* Foto de Perfil */}
          <div className="space-y-2">
            <Label className="text-slate-200 font-medium">
              Foto de Perfil
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
