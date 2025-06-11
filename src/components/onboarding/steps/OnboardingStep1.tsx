
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Sparkles, User, MapPin, Calendar, MessageCircle } from 'lucide-react';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { AIMessageDisplay } from '../components/AIMessageDisplay';
import { useAIMessageGeneration } from '../hooks/useAIMessageGeneration';

const OnboardingStep1: React.FC<OnboardingStepProps> = ({
  data,
  onUpdateData,
  memberType,
  getFieldError
}) => {
  const { generateMessage, isGenerating, generatedMessage } = useAIMessageGeneration();
  const [shouldGenerateMessage, setShouldGenerateMessage] = useState(false);

  // Estados brasileiros
  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Gerar mensagem quando dados básicos estiverem preenchidos
  useEffect(() => {
    const hasBasicInfo = data.name && data.email && data.state && data.city;
    if (hasBasicInfo && !generatedMessage && !isGenerating && !shouldGenerateMessage) {
      setShouldGenerateMessage(true);
      generateMessage(data, memberType);
    }
  }, [data.name, data.email, data.state, data.city, generatedMessage, isGenerating, shouldGenerateMessage, generateMessage, data, memberType]);

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
          Vamos começar conhecendo você melhor para personalizar sua experiência
        </p>
      </motion.div>

      {/* Formulário */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Coluna Esquerda - Dados Básicos */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Dados Básicos</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-slate-200">Nome completo *</Label>
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
                  <Label htmlFor="email" className="text-slate-200">E-mail *</Label>
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
                  <Label htmlFor="phone" className="text-slate-200">Telefone *</Label>
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

                <div>
                  <Label htmlFor="birthDate" className="text-slate-200">Data de nascimento *</Label>
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
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Coluna Direita - Localização e Redes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Localização */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Localização</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state" className="text-slate-200">Estado *</Label>
                  <Select value={data.state || ''} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((estado) => (
                        <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getFieldError?.('state') && (
                    <p className="text-red-400 text-sm mt-1">{getFieldError('state')}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city" className="text-slate-200">Cidade *</Label>
                  <Input
                    id="city"
                    value={data.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Sua cidade"
                    className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-slate-400"
                  />
                  {getFieldError?.('city') && (
                    <p className="text-red-400 text-sm mt-1">{getFieldError('city')}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Redes Sociais */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Redes Sociais</h3>
                <span className="text-xs text-slate-400">(opcional)</span>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="instagram" className="text-slate-200">Instagram</Label>
                  <Input
                    id="instagram"
                    value={data.instagram || ''}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    placeholder="@seuusuario"
                    className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin" className="text-slate-200">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={data.linkedin || ''}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    placeholder="linkedin.com/in/seuperfil"
                    className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Curiosidade */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Conte um pouco sobre você</h3>
            </div>

            <div>
              <Label htmlFor="curiosity" className="text-slate-200">
                O que te trouxe até aqui? Qual sua curiosidade sobre IA? *
              </Label>
              <Textarea
                id="curiosity"
                value={data.curiosity || ''}
                onChange={(e) => handleInputChange('curiosity', e.target.value)}
                placeholder="Conte sua história, o que desperta sua curiosidade sobre IA e como pretende usar..."
                rows={4}
                className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-slate-400"
              />
              {getFieldError?.('curiosity') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('curiosity')}</p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Mensagem da IA */}
      {(generatedMessage || isGenerating) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-viverblue" />
            <h3 className="text-lg font-semibold text-white">Mensagem Personalizada</h3>
          </div>
          <AIMessageDisplay 
            message={generatedMessage || ''} 
            isLoading={isGenerating}
          />
        </motion.div>
      )}
    </div>
  );
};

export default OnboardingStep1;
