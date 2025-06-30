
import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Instagram, Linkedin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WhatsAppInput } from '@/components/onboarding/components/WhatsAppInput';
import { LocationSelector } from '@/components/onboarding/components/LocationSelector';
import { BirthDateSelector } from '@/components/onboarding/components/BirthDateSelector';
import { OnboardingStepProps } from '../types/onboardingTypes';

const OnboardingStep1: React.FC<OnboardingStepProps> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
  const handleBirthDateChange = (day: string, month: string, year: string) => {
    const birthDate = day && month && year ? `${day}/${month}/${year}` : '';
    onUpdateData({ 
      birthDate,
      birthDay: day,
      birthMonth: month,
      birthYear: year
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <User className="w-8 h-8 text-viverblue" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Informações Pessoais
        </h2>
        <p className="text-slate-400">
          Vamos começar conhecendo um pouco sobre você
        </p>
      </div>

      <div className="space-y-6">
        {/* Informações Básicas */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-slate-200">
                Nome Completo *
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="name"
                  value={data.name || ''}
                  onChange={(e) => onUpdateData({ name: e.target.value })}
                  className="pl-10 bg-[#151823] border-white/20 text-white"
                  placeholder="Seu nome completo"
                />
              </div>
              {getFieldError?.('name') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('name')}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-slate-200">
                E-mail *
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  value={data.email || ''}
                  onChange={(e) => onUpdateData({ email: e.target.value })}
                  className="pl-10 bg-[#151823] border-white/20 text-white"
                  placeholder="seu@email.com"
                />
              </div>
              {getFieldError?.('email') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('email')}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <WhatsAppInput
              value={data.phone || ''}
              onChange={(value) => onUpdateData({ phone: value })}
              getFieldError={getFieldError}
            />
          </div>
        </Card>

        {/* Redes Sociais */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Redes Sociais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="instagram" className="text-slate-200">
                Instagram
              </Label>
              <div className="relative mt-1">
                <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="instagram"
                  value={data.instagram || ''}
                  onChange={(e) => onUpdateData({ instagram: e.target.value })}
                  className="pl-10 bg-[#151823] border-white/20 text-white"
                  placeholder="@seuusuario"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="linkedin" className="text-slate-200">
                LinkedIn
              </Label>
              <div className="relative mt-1">
                <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="linkedin"
                  value={data.linkedin || ''}
                  onChange={(e) => onUpdateData({ linkedin: e.target.value })}
                  className="pl-10 bg-[#151823] border-white/20 text-white"
                  placeholder="linkedin.com/in/seuperfil"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Localização */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Localização</h3>
          <LocationSelector
            selectedState={data.state}
            selectedCity={data.city}
            onStateChange={(value) => onUpdateData({ state: value })}
            onCityChange={(value) => onUpdateData({ city: value })}
            getFieldError={getFieldError}
          />
        </Card>

        {/* Data de Nascimento */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Data de Nascimento</h3>
          <BirthDateSelector
            birthDay={data.birthDay}
            birthMonth={data.birthMonth}
            birthYear={data.birthYear}
            onChange={handleBirthDateChange}
            getFieldError={getFieldError}
          />
        </Card>

        {/* Curiosidade */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div>
            <Label htmlFor="curiosity" className="text-slate-200">
              Conte uma curiosidade sobre você
            </Label>
            <Textarea
              id="curiosity"
              value={data.curiosity || ''}
              onChange={(e) => onUpdateData({ curiosity: e.target.value })}
              className="mt-3 bg-[#151823] border-white/20 text-white placeholder:text-slate-500 min-h-[100px]"
              placeholder="Algo interessante sobre você, seus hobbies, experiências..."
            />
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default OnboardingStep1;
