
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User, Mail, Phone, Instagram, Linkedin, MapPin, Calendar, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { useIBGELocations } from '@/hooks/useIBGELocations';

export const OnboardingStep1 = ({ 
  data, 
  onUpdateData, 
  onNext, 
  memberType,
  userProfile,
  getFieldError
}: OnboardingStepProps) => {
  const [name, setName] = useState(data.name || userProfile?.full_name || '');
  const [email, setEmail] = useState(data.email || userProfile?.email || '');
  const [phone, setPhone] = useState(data.phone || '');
  const [instagram, setInstagram] = useState(data.instagram || '');
  const [linkedin, setLinkedin] = useState(data.linkedin || '');
  const [state, setState] = useState(data.state || '');
  const [city, setCity] = useState(data.city || '');
  const [birthDate, setBirthDate] = useState(data.birthDate || '');
  const [curiosity, setCuriosity] = useState(data.curiosity || '');

  const { estados, cidadesPorEstado, isLoading: locationsLoading } = useIBGELocations();

  const handleNext = () => {
    // Gerar mensagem personalizada da IA baseada nas respostas
    const firstName = name.split(' ')[0];
    const estadoNome = estados.find(e => e.code === state)?.name || state;
    
    const aiMessage = `Olá ${firstName}! 🎉 É um prazer imenso ter você no VIVER DE IA Club! Vi que você é de ${city ? `${city}, ` : ''}${estadoNome} - que região incrível! ${curiosity ? `E adorei saber que ${curiosity.toLowerCase()}! ` : ''}Agora vamos conhecer melhor seu negócio para criar uma experiência totalmente personalizada que vai transformar sua empresa com IA. Bora lá? 🚀`;

    onUpdateData({ 
      name,
      email,
      phone,
      instagram,
      linkedin,
      state,
      city,
      birthDate,
      curiosity,
      aiMessage1: aiMessage,
      memberType,
      startedAt: data.startedAt || new Date().toISOString()
    });
    onNext();
  };

  const isClubMember = memberType === 'club';
  const nameError = getFieldError?.('name');
  const canProceed = name.trim() && email.trim() && state && city && curiosity.trim();

  // Gerar anos para select de data de nascimento
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - 18 - i);

  return (
    <div className="space-y-8">
      {/* Header com animação */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-viverblue/20 to-viverblue-light/20 p-4 rounded-full">
            <Sparkles className="w-8 h-8 text-viverblue" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bem-vindo ao VIVER DE IA Club! 🚀
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Vamos personalizar sua jornada para transformar seu negócio com IA. 
          Cada informação nos ajuda a criar uma experiência única para você!
        </p>
      </motion.div>

      {/* Formulário */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6 max-w-2xl mx-auto"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome completo *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className={nameError ? 'border-red-500' : ''}
            />
            {nameError && (
              <p className="text-sm text-red-500">{nameError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              E-mail *
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={!!userProfile?.email}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Telefone/WhatsApp
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Ano de nascimento
            </Label>
            <Select value={birthDate} onValueChange={setBirthDate}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="w-4 h-4" />
              Instagram (opcional)
            </Label>
            <Input
              id="instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@seuusuario"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin" className="flex items-center gap-2">
              <Linkedin className="w-4 h-4" />
              LinkedIn (opcional)
            </Label>
            <Input
              id="linkedin"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="linkedin.com/in/seuperfil"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Estado *
            </Label>
            <Select value={state} onValueChange={setState} disabled={locationsLoading}>
              <SelectTrigger>
                <SelectValue placeholder={locationsLoading ? "Carregando..." : "Selecione seu estado"} />
              </SelectTrigger>
              <SelectContent>
                {estados.map((estado) => (
                  <SelectItem key={estado.code} value={estado.code}>
                    {estado.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Cidade *
            </Label>
            <Select value={city} onValueChange={setCity} disabled={!state || locationsLoading}>
              <SelectTrigger>
                <SelectValue placeholder={!state ? "Selecione primeiro o estado" : "Selecione sua cidade"} />
              </SelectTrigger>
              <SelectContent>
                {state && cidadesPorEstado[state]?.map((cidade) => (
                  <SelectItem key={cidade.name} value={cidade.name}>
                    {cidade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="curiosity" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Conte uma curiosidade sobre você *
          </Label>
          <Textarea
            id="curiosity"
            value={curiosity}
            onChange={(e) => setCuriosity(e.target.value)}
            placeholder="Algo interessante sobre você, seus hobbies, paixões..."
            className="min-h-[80px]"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Isso nos ajuda a tornar nossa conversa mais humana e personalizada ✨
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-6"
        >
          <Button 
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full bg-viverblue hover:bg-viverblue-dark text-lg py-6 disabled:opacity-50"
          >
            Vamos falar do seu negócio! 💼
          </Button>
        </motion.div>
      </motion.div>

      {/* Dica com progresso */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 border border-viverblue/20 rounded-lg p-4 text-center"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          💡 <strong>Etapa 1 de 5:</strong> Quanto mais você nos contar, 
          melhor nossa IA personalizada poderá ajudar você! 🚀
        </p>
      </motion.div>
    </div>
  );
};
