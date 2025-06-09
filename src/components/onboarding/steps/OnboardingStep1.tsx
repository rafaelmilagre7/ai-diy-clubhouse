
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, User, Mail, Phone, Instagram, Linkedin, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { AIMessageDisplay } from '../components/AIMessageDisplay';
import { generateAIMessage } from '../utils/aiMessageGenerator';
import { brazilianStates, getCitiesByState } from '../utils/locationData';

export const OnboardingStep1 = ({ 
  data, 
  onUpdateData, 
  onNext, 
  memberType, 
  userProfile,
  getFieldError 
}: OnboardingStepProps) => {
  const [formData, setFormData] = useState({
    name: data.name || userProfile?.name || '',
    email: data.email || userProfile?.email || '',
    phone: data.phone || '',
    instagram: data.instagram || '',
    linkedin: data.linkedin || '',
    state: data.state || '',
    city: data.city || '',
    birthDate: data.birthDate || '',
    curiosity: data.curiosity || ''
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    data.birthDate ? new Date(data.birthDate) : undefined
  );
  
  const [cities, setCities] = useState<string[]>([]);
  const [showAIMessage, setShowAIMessage] = useState(false);

  useEffect(() => {
    if (formData.state) {
      const stateCities = getCitiesByState(formData.state);
      setCities(stateCities);
      if (!stateCities.includes(formData.city)) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    }
  }, [formData.state]);

  useEffect(() => {
    // Mostrar mensagem da IA após preenchimento significativo
    const hasBasicInfo = formData.name && formData.state && formData.city;
    if (hasBasicInfo && !showAIMessage) {
      const timer = setTimeout(() => {
        setShowAIMessage(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [formData.name, formData.state, formData.city, showAIMessage]);

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdateData(newData);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    const dateValue = date ? date.toISOString().split('T')[0] : '';
    handleInputChange('birthDate', dateValue);
  };

  const handleNext = () => {
    onNext();
  };

  const getWelcomeTitle = () => {
    if (memberType === 'formacao') {
      return (
        <>
          Bem-vindo à{' '}
          <span className="bg-gradient-to-r from-viverblue to-viverblue-light bg-clip-text text-transparent">
            Formação Viver de IA! 🎓
          </span>
        </>
      );
    }
    return (
      <>
        Bem-vindo ao{' '}
        <span className="bg-gradient-to-r from-viverblue to-viverblue-light bg-clip-text text-transparent">
          VIVER DE IA Club! 🚀
        </span>
      </>
    );
  };

  const getWelcomeSubtitle = () => {
    if (memberType === 'formacao') {
      return "Vamos conhecer você melhor para personalizar sua jornada de aprendizado em IA!";
    }
    return "Vamos conhecer você melhor para personalizar sua experiência empresarial!";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-heading font-bold text-white">
          {getWelcomeTitle()}
        </h1>
        <p className="text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          {getWelcomeSubtitle()}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-[#151823] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-viverblue/20 flex items-center justify-center">
                <User className="w-5 h-5 text-viverblue" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-white">
                Informações Pessoais
              </h3>
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-neutral-300">
                Nome completo *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Seu nome completo"
                className="bg-[#0F111A] border-white/20 text-white"
              />
              {getFieldError?.('name') && (
                <p className="text-red-400 text-sm">{getFieldError('name')}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-300 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                E-mail *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
                className="bg-[#0F111A] border-white/20 text-white"
                disabled={!!userProfile?.email}
              />
              {getFieldError?.('email') && (
                <p className="text-red-400 text-sm">{getFieldError('email')}</p>
              )}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-neutral-300 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefone *
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                className="bg-[#0F111A] border-white/20 text-white"
              />
              {getFieldError?.('phone') && (
                <p className="text-red-400 text-sm">{getFieldError('phone')}</p>
              )}
            </div>

            {/* Redes Sociais */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-neutral-300 flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  placeholder="@seuinstagram"
                  className="bg-[#0F111A] border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-neutral-300 flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/seuperfil"
                  className="bg-[#0F111A] border-white/20 text-white"
                />
              </div>
            </div>

            {/* Localização */}
            <div className="space-y-4">
              <Label className="text-neutral-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Localização *
              </Label>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger className="bg-[#0F111A] border-white/20 text-white">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {brazilianStates.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getFieldError?.('state') && (
                    <p className="text-red-400 text-sm">{getFieldError('state')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Select 
                    value={formData.city} 
                    onValueChange={(value) => handleInputChange('city', value)}
                    disabled={!formData.state}
                  >
                    <SelectTrigger className="bg-[#0F111A] border-white/20 text-white">
                      <SelectValue placeholder="Selecione a cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getFieldError?.('city') && (
                    <p className="text-red-400 text-sm">{getFieldError('city')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Data de Nascimento */}
            <div className="space-y-2">
              <Label className="text-neutral-300">Data de nascimento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-[#0F111A] border-white/20 text-white hover:bg-[#1A1D2E]"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              {getFieldError?.('birthDate') && (
                <p className="text-red-400 text-sm">{getFieldError('birthDate')}</p>
              )}
            </div>

            {/* Curiosidade */}
            <div className="space-y-2">
              <Label htmlFor="curiosity" className="text-neutral-300">
                Conte uma curiosidade sobre você *
              </Label>
              <Textarea
                id="curiosity"
                value={formData.curiosity}
                onChange={(e) => handleInputChange('curiosity', e.target.value)}
                placeholder="Algo interessante que você gostaria de compartilhar..."
                className="bg-[#0F111A] border-white/20 text-white min-h-[100px]"
              />
              {getFieldError?.('curiosity') && (
                <p className="text-red-400 text-sm">{getFieldError('curiosity')}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Mensagem da IA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {showAIMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <AIMessageDisplay 
                message={generateAIMessage(1, { ...data, ...formData }, memberType)}
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-viverblue/10 border border-viverblue/30 rounded-xl p-6"
          >
            <h4 className="font-semibold text-viverblue mb-3">
              {memberType === 'formacao' ? '🎓 O que você vai encontrar na formação:' : '🚀 O que você vai encontrar no clube:'}
            </h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              {memberType === 'formacao' ? (
                <>
                  <li>• Aulas práticas e projetos reais com IA</li>
                  <li>• Mentoria personalizada para sua carreira</li>
                  <li>• Comunidade exclusiva de alunos</li>
                  <li>• Certificação em Inteligência Artificial</li>
                </>
              ) : (
                <>
                  <li>• Soluções de IA personalizadas para seu negócio</li>
                  <li>• Cases de sucesso do seu setor</li>
                  <li>• Networking com empresários visionários</li>
                  <li>• Implementação guiada passo a passo</li>
                </>
              )}
            </ul>
          </motion.div>
        </motion.div>
      </div>

      {/* Botão de próximo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex justify-end pt-6"
      >
        <Button 
          onClick={handleNext}
          size="lg"
          className="bg-viverblue hover:bg-viverblue-dark text-[#0F111A] px-8 py-3 text-lg font-semibold rounded-xl"
        >
          Continuar →
        </Button>
      </motion.div>
    </div>
  );
};
