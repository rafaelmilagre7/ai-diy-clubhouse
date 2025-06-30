
import React from 'react';
import { motion } from 'framer-motion';
import { User, Instagram, Linkedin, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { ProfilePictureUpload } from '../components/ProfilePictureUpload';
import { LocationSelector } from '../components/LocationSelector';
import { BirthDateSelector } from '../components/BirthDateSelector';
import { WhatsAppInput } from '../components/WhatsAppInput';

const OnboardingStep1: React.FC<OnboardingStepProps> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
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
          Vamos começar conhecendo você melhor
        </p>
      </div>

      <div className="space-y-6">
        {/* Foto de Perfil */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <ProfilePictureUpload
            value={data.profilePicture || ''}
            onChange={(url) => onUpdateData({ profilePicture: url })}
          />
        </Card>

        {/* Informações Básicas */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-slate-200 text-base font-medium">
                Nome completo *
              </Label>
              <Input
                type="text"
                value={data.name || ''}
                onChange={(e) => onUpdateData({ name: e.target.value })}
                className="mt-3 bg-[#151823] border-white/20 text-white placeholder:text-slate-500"
                placeholder="Seu nome completo"
              />
              {getFieldError?.('name') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('name')}</p>
              )}
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                E-mail *
              </Label>
              <Input
                type="email"
                value={data.email || ''}
                onChange={(e) => onUpdateData({ email: e.target.value })}
                className="mt-3 bg-[#151823] border-white/20 text-white placeholder:text-slate-500"
                placeholder="seu@email.com"
              />
              {getFieldError?.('email') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('email')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Contato */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div>
              <Label className="text-slate-200 text-base font-medium">
                WhatsApp *
              </Label>
              <WhatsAppInput
                value={data.phone || ''}
                onChange={(value) => onUpdateData({ phone: value })}
                error={getFieldError?.('phone')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-slate-200 text-base font-medium flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram (opcional)
                </Label>
                <Input
                  type="text"
                  value={data.instagram || ''}
                  onChange={(e) => onUpdateData({ instagram: e.target.value })}
                  className="mt-3 bg-[#151823] border-white/20 text-white placeholder:text-slate-500"
                  placeholder="@seuinstagram"
                />
              </div>

              <div>
                <Label className="text-slate-200 text-base font-medium flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn (opcional)
                </Label>
                <Input
                  type="url"
                  value={data.linkedin || ''}
                  onChange={(e) => onUpdateData({ linkedin: e.target.value })}
                  className="mt-3 bg-[#151823] border-white/20 text-white placeholder:text-slate-500"
                  placeholder="linkedin.com/in/seuperfil"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Localização */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Localização</h3>
            </div>

            <LocationSelector
              state={data.state || ''}
              city={data.city || ''}
              onStateChange={(value) => onUpdateData({ state: value })}
              onCityChange={(value) => onUpdateData({ city: value })}
              stateError={getFieldError?.('state')}
              cityError={getFieldError?.('city')}
            />
          </div>
        </Card>

        {/* Informações Pessoais */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div>
              <Label className="text-slate-200 text-base font-medium">
                Data de nascimento *
              </Label>
              <BirthDateSelector
                value={data.birthDate || ''}
                onChange={(value) => onUpdateData({ birthDate: value })}
                error={getFieldError?.('birthDate')}
              />
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Conte uma curiosidade sobre você *
              </Label>
              <Textarea
                value={data.curiosity || ''}
                onChange={(e) => onUpdateData({ curiosity: e.target.value })}
                className="mt-3 bg-[#151823] border-white/20 text-white placeholder:text-slate-500 min-h-[100px]"
                placeholder="Ex: Adoro café, tenho 3 gatos, sou apaixonado por tecnologia..."
              />
              {getFieldError?.('curiosity') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('curiosity')}</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default OnboardingStep1;
