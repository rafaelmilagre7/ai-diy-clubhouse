
import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Instagram, Linkedin, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { LocationSelector } from '../components/LocationSelector';
import { ProfilePictureUpload } from '../components/ProfilePictureUpload';
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
          Vamos nos conhecer melhor!
        </h2>
        <p className="text-slate-400">
          Conte-nos sobre você para personalizarmos sua experiência
        </p>
      </div>

      <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome Completo */}
          <div>
            <Label htmlFor="name" className="text-slate-200">
              Nome Completo *
            </Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="name"
                type="text"
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

          {/* E-mail */}
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

          {/* WhatsApp - usando o novo componente */}
          <div>
            <WhatsAppInput
              value={data.phone}
              onChange={(phone) => onUpdateData({ phone })}
              getFieldError={getFieldError}
            />
          </div>

          {/* Instagram */}
          <div>
            <Label htmlFor="instagram" className="text-slate-200">
              Instagram
            </Label>
            <div className="relative mt-1">
              <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="instagram"
                type="text"
                value={data.instagram || ''}
                onChange={(e) => onUpdateData({ instagram: e.target.value })}
                className="pl-10 bg-[#151823] border-white/20 text-white"
                placeholder="@seuinstagram"
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div>
            <Label htmlFor="linkedin" className="text-slate-200">
              LinkedIn
            </Label>
            <div className="relative mt-1">
              <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="linkedin"
                type="url"
                value={data.linkedin || ''}
                onChange={(e) => onUpdateData({ linkedin: e.target.value })}
                className="pl-10 bg-[#151823] border-white/20 text-white"
                placeholder="linkedin.com/in/seuperfil"
              />
            </div>
          </div>

          {/* Data de Nascimento */}
          <div>
            <BirthDateSelector
              value={data.birthDate}
              onChange={(date) => onUpdateData({ birthDate: date })}
              getFieldError={getFieldError}
            />
          </div>
        </div>

        {/* Localização */}
        <div className="mt-6">
          <LocationSelector
            selectedState={data.state}
            selectedCity={data.city}
            onStateChange={(state) => onUpdateData({ state })}
            onCityChange={(city) => onUpdateData({ city })}
            getFieldError={getFieldError}
          />
        </div>

        {/* Foto de Perfil */}
        <div className="mt-6">
          <ProfilePictureUpload
            value={data.profilePicture}
            onChange={(url) => onUpdateData({ profilePicture: url })}
            userName={data.name}
          />
        </div>

        {/* Curiosidade */}
        <div className="mt-6">
          <Label htmlFor="curiosity" className="text-slate-200">
            Conte uma curiosidade sobre você *
          </Label>
          <div className="relative mt-1">
            <Sparkles className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
            <Textarea
              id="curiosity"
              value={data.curiosity || ''}
              onChange={(e) => onUpdateData({ curiosity: e.target.value })}
              className="pl-10 bg-[#151823] border-white/20 text-white resize-none"
              placeholder="Compartilhe algo interessante sobre você..."
              rows={3}
            />
          </div>
          {getFieldError?.('curiosity') && (
            <p className="text-red-400 text-sm mt-1">{getFieldError('curiosity')}</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default OnboardingStep1;
