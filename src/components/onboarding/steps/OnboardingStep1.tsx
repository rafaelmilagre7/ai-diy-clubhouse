
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Heart, Sparkles } from 'lucide-react';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { AIMessageDisplay } from '../components/AIMessageDisplay';
import { useAIMessageGeneration } from '../hooks/useAIMessageGeneration';
import { LocationSelector } from '../components/LocationSelector';

const OnboardingStep1: React.FC<OnboardingStepProps> = ({
  data,
  onUpdateData,
  memberType,
  getFieldError
}) => {
  const { generateMessage, isGenerating, generatedMessage } = useAIMessageGeneration();
  const [shouldGenerateMessage, setShouldGenerateMessage] = useState(false);

  // Gerar mensagem quando informações básicas estiverem preenchidas
  useEffect(() => {
    const hasBasicInfo = data.name && data.email && data.phone && data.state && data.city;
    if (hasBasicInfo && !generatedMessage && !isGenerating && !shouldGenerateMessage) {
      setShouldGenerateMessage(true);
      generateMessage(data, memberType);
    }
  }, [data.name, data.email, data.phone, data.state, data.city, generatedMessage, isGenerating, shouldGenerateMessage, generateMessage, data, memberType]);

  const handleInputChange = (field: string, value: string) => {
    onUpdateData({ [field]: value });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 mx-auto bg-viverblue/20 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-viverblue" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Informações Pessoais
        </h2>
        <p className="text-slate-300">
          Vamos começar conhecendo você melhor
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Coluna Esquerda - Dados Básicos */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Informações Básicas */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Dados Básicos</h3>
              </div>

              <div>
                <Label htmlFor="name" className="text-slate-200">
                  Nome completo *
                </Label>
                <Input
                  id="name"
                  value={data.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Seu nome completo"
                  className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-slate-400"
                />
                {getFieldError?.('name') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('name')}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-slate-200">
                  E-mail *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                  className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-slate-400"
                />
                {getFieldError?.('email') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('email')}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-slate-200">
                  WhatsApp *
                </Label>
                <Input
                  id="phone"
                  value={data.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-slate-400"
                />
                {getFieldError?.('phone') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('phone')}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Localização */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Localização</h3>
              
              <LocationSelector
                selectedState={data.state}
                selectedCity={data.city}
                onStateChange={(state) => handleInputChange('state', state)}
                onCityChange={(city) => handleInputChange('city', city)}
                getFieldError={getFieldError}
              />
            </div>
          </Card>
        </motion.div>

        {/* Coluna Direita - Dados Complementares */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Informações Complementares */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Informações Complementares</h3>

              <div>
                <Label htmlFor="birthDate" className="text-slate-200">
                  Data de nascimento *
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={data.birthDate || ''}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className="mt-1 bg-[#151823] border-white/20 text-white"
                />
                {getFieldError?.('birthDate') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('birthDate')}</p>
                )}
              </div>

              <div>
                <Label htmlFor="instagram" className="text-slate-200">
                  Instagram (opcional)
                </Label>
                <Input
                  id="instagram"
                  value={data.instagram || ''}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  placeholder="@seuusuario ou URL completa"
                  className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-slate-400"
                />
                {getFieldError?.('instagram') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('instagram')}</p>
                )}
              </div>

              <div>
                <Label htmlFor="linkedin" className="text-slate-200">
                  LinkedIn (opcional)
                </Label>
                <Input
                  id="linkedin"
                  value={data.linkedin || ''}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  placeholder="URL do seu perfil"
                  className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-slate-400"
                />
                {getFieldError?.('linkedin') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('linkedin')}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Curiosidade */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Conte sobre você</h3>
              </div>

              <div>
                <Label htmlFor="curiosity" className="text-slate-200">
                  Uma curiosidade sobre você *
                </Label>
                <Textarea
                  id="curiosity"
                  value={data.curiosity || ''}
                  onChange={(e) => handleInputChange('curiosity', e.target.value)}
                  placeholder="Compartilhe algo interessante sobre você, seus hobbies, paixões..."
                  rows={3}
                  className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-slate-400"
                />
                {getFieldError?.('curiosity') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('curiosity')}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Mensagem da IA */}
          {(generatedMessage || isGenerating) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Boas-vindas Personalizadas</h3>
              </div>
              <AIMessageDisplay 
                message={generatedMessage || ''} 
                isLoading={isGenerating}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingStep1;
