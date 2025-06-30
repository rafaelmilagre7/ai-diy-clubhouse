
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';
import { BirthDateSelector } from '@/components/onboarding/components/BirthDateSelector';
import { ProfilePictureUpload } from '@/components/onboarding/components/ProfilePictureUpload';
import { WhatsAppInput } from '@/components/onboarding/components/WhatsAppInput';
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

  const handleBirthDateChange = (day: string, month: string, year: string) => {
    onUpdateData({
      birthDay: day,
      birthMonth: month,
      birthYear: year
    });
  };

  const handleProfilePictureChange = (url: string) => {
    onUpdateData({ profilePicture: url });
  };

  // Simulando que email e whatsapp podem vir preenchidos (da API ou convite)
  const emailPreFilled = data.email || 'usuario@empresa.com';
  const whatsappPreFilled = data.whatsapp || '';

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-slate-200 font-medium">
                Nome *
              </Label>
              <Input
                id="firstName"
                value={data.firstName || ''}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Seu primeiro nome"
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
              />
              {getFieldError?.('firstName') && (
                <p className="text-red-400 text-sm">{getFieldError('firstName')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-slate-200 font-medium">
                Sobrenome *
              </Label>
              <Input
                id="lastName"
                value={data.lastName || ''}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Seu sobrenome"
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
              />
              {getFieldError?.('lastName') && (
                <p className="text-red-400 text-sm">{getFieldError('lastName')}</p>
              )}
            </div>
          </div>

          {/* E-mail (travado se preenchido) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200 font-medium">
              E-mail *
            </Label>
            <Input
              id="email"
              type="email"
              value={emailPreFilled}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="seu.email@empresa.com"
              disabled={!!emailPreFilled}
              className={`bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue ${
                emailPreFilled ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            />
            {emailPreFilled && (
              <p className="text-slate-400 text-xs">E-mail fornecido pelo convite</p>
            )}
            {getFieldError?.('email') && (
              <p className="text-red-400 text-sm">{getFieldError('email')}</p>
            )}
          </div>

          {/* CPF */}
          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-slate-200 font-medium">
              CPF *
            </Label>
            <Input
              id="cpf"
              value={data.cpf || ''}
              onChange={(e) => handleInputChange('cpf', e.target.value)}
              placeholder="000.000.000-00"
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
            />
            {getFieldError?.('cpf') && (
              <p className="text-red-400 text-sm">{getFieldError('cpf')}</p>
            )}
          </div>

          {/* WhatsApp (travado se preenchido) */}
          <div className="space-y-2">
            <Label className="text-slate-200 font-medium">
              WhatsApp
            </Label>
            <WhatsAppInput
              value={whatsappPreFilled || data.whatsapp || ''}
              onChange={(value) => handleInputChange('whatsapp', value)}
              disabled={!!whatsappPreFilled}
            />
            {whatsappPreFilled && (
              <p className="text-slate-400 text-xs">WhatsApp fornecido previamente</p>
            )}
          </div>

          {/* Gênero */}
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-slate-200 font-medium">
              Gênero
            </Label>
            <Select 
              value={data.gender || ''} 
              onValueChange={(value) => handleInputChange('gender', value)}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-viverblue">
                <SelectValue placeholder="Selecione seu gênero" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="masculino" className="text-white hover:bg-slate-700">Masculino</SelectItem>
                <SelectItem value="feminino" className="text-white hover:bg-slate-700">Feminino</SelectItem>
                <SelectItem value="nao_binario" className="text-white hover:bg-slate-700">Não Binário</SelectItem>
                <SelectItem value="prefiro_nao_informar" className="text-white hover:bg-slate-700">Prefiro não informar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data de Nascimento */}
          <BirthDateSelector
            birthDay={data.birthDay}
            birthMonth={data.birthMonth}
            birthYear={data.birthYear}
            onChange={handleBirthDateChange}
            getFieldError={getFieldError}
          />

          {/* Foto de Perfil */}
          <ProfilePictureUpload
            value={data.profilePicture}
            onChange={handleProfilePictureChange}
            userName={`${data.firstName || ''} ${data.lastName || ''}`.trim()}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MockOnboardingStep1;
