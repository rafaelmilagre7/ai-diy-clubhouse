
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';
import { User, MapPin, Calendar } from 'lucide-react';
import { WhatsAppInput } from '@/components/onboarding/components/WhatsAppInput';
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

  const handleBirthDateChange = (dateData: { day: string; month: string; year: string }) => {
    onUpdateData({
      birthDay: dateData.day,
      birthMonth: dateData.month,
      birthYear: dateData.year,
      birthDate: dateData.day && dateData.month && dateData.year 
        ? `${dateData.year}-${dateData.month.padStart(2, '0')}-${dateData.day.padStart(2, '0')}`
        : undefined
    });
  };

  // Verificar se email e telefone vieram preenchidos (simulando que vêm do convite)
  const isEmailReadOnly = Boolean(data.email);
  const isPhoneReadOnly = Boolean(data.phone);

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
              placeholder="Seu nome completo"
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
            />
            {getFieldError?.('name') && (
              <p className="text-red-400 text-sm">{getFieldError('name')}</p>
            )}
          </div>

          {/* E-mail */}
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
              className={`${
                isEmailReadOnly 
                  ? 'bg-slate-700/50 border-slate-500 text-slate-300' 
                  : 'bg-slate-800/50 border-slate-600 text-white'
              } placeholder:text-slate-400 focus:border-viverblue`}
              readOnly={isEmailReadOnly}
            />
            {isEmailReadOnly && (
              <p className="text-xs text-slate-400">E-mail definido pelo convite</p>
            )}
            {getFieldError?.('email') && (
              <p className="text-red-400 text-sm">{getFieldError('email')}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <div className="relative">
              {isPhoneReadOnly ? (
                <div>
                  <Label htmlFor="phone" className="text-slate-200 font-medium">
                    WhatsApp *
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="phone"
                      type="tel"
                      value={data.phone || ''}
                      className="bg-slate-700/50 border-slate-500 text-slate-300 placeholder:text-slate-400"
                      readOnly
                    />
                    <p className="text-xs text-slate-400 mt-1">Telefone definido pelo convite</p>
                  </div>
                </div>
              ) : (
                <WhatsAppInput
                  value={data.phone || ''}
                  onChange={(value) => handleInputChange('phone', value)}
                  getFieldError={getFieldError}
                />
              )}
            </div>
          </div>

          {/* Data de Nascimento */}
          <div className="space-y-2">
            <Label className="text-slate-200 font-medium">
              Data de Nascimento
            </Label>
            <BirthDateSelector
              birthDay={data.birthDay || ''}
              birthMonth={data.birthMonth || ''}
              birthYear={data.birthYear || ''}
              onChange={handleBirthDateChange}
            />
          </div>

          {/* Foto de Perfil */}
          <ProfilePictureUpload
            value={data.profilePicture || ''}
            onChange={(url) => handleInputChange('profilePicture', url)}
            userName={data.name}
          />
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg font-semibold flex items-center gap-3">
            <MapPin className="h-5 w-5 text-viverblue" />
            Localização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="state" className="text-slate-200 font-medium">
              Estado *
            </Label>
            <Select 
              value={data.state || ''} 
              onValueChange={(value) => handleInputChange('state', value)}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-viverblue">
                <SelectValue placeholder="Selecione seu estado" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="SP" className="text-white hover:bg-slate-700">São Paulo</SelectItem>
                <SelectItem value="RJ" className="text-white hover:bg-slate-700">Rio de Janeiro</SelectItem>
                <SelectItem value="MG" className="text-white hover:bg-slate-700">Minas Gerais</SelectItem>
                <SelectItem value="RS" className="text-white hover:bg-slate-700">Rio Grande do Sul</SelectItem>
                <SelectItem value="PR" className="text-white hover:bg-slate-700">Paraná</SelectItem>
                <SelectItem value="SC" className="text-white hover:bg-slate-700">Santa Catarina</SelectItem>
                <SelectItem value="GO" className="text-white hover:bg-slate-700">Goiás</SelectItem>
                <SelectItem value="ES" className="text-white hover:bg-slate-700">Espírito Santo</SelectItem>
                <SelectItem value="DF" className="text-white hover:bg-slate-700">Distrito Federal</SelectItem>
                <SelectItem value="BA" className="text-white hover:bg-slate-700">Bahia</SelectItem>
                <SelectItem value="PE" className="text-white hover:bg-slate-700">Pernambuco</SelectItem>
                <SelectItem value="CE" className="text-white hover:bg-slate-700">Ceará</SelectItem>
                <SelectItem value="AM" className="text-white hover:bg-slate-700">Amazonas</SelectItem>
                <SelectItem value="MT" className="text-white hover:bg-slate-700">Mato Grosso</SelectItem>
                <SelectItem value="MS" className="text-white hover:bg-slate-700">Mato Grosso do Sul</SelectItem>
                <SelectItem value="outros" className="text-white hover:bg-slate-700">Outros</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError?.('state') && (
              <p className="text-red-400 text-sm">{getFieldError('state')}</p>
            )}
          </div>

          {/* Cidade */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-slate-200 font-medium">
              Cidade *
            </Label>
            <Input
              id="city"
              value={data.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Sua cidade"
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
            />
            {getFieldError?.('city') && (
              <p className="text-red-400 text-sm">{getFieldError('city')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg font-semibold flex items-center gap-3">
            <Calendar className="h-5 w-5 text-viverblue" />
            Preferências Pessoais
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
              placeholder="@seuusuario"
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

          {/* Curiosidade */}
          <div className="space-y-2">
            <Label htmlFor="curiosity" className="text-slate-200 font-medium">
              Algo interessante sobre você
            </Label>
            <Input
              id="curiosity"
              value={data.curiosity || ''}
              onChange={(e) => handleInputChange('curiosity', e.target.value)}
              placeholder="Compartilhe algo único sobre você"
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockOnboardingStep1;
