
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Instagram, Linkedin, MapPin, Calendar, Heart, CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { useIBGELocations } from '@/hooks/useIBGELocations';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    data.birthDate ? new Date(data.birthDate) : undefined
  );
  const [curiosity, setCuriosity] = useState(data.curiosity || '');

  const { estados, cidadesPorEstado, isLoading: locationsLoading, loadCidades } = useIBGELocations();

  // Sincronizar dados locais com dados globais em tempo real
  useEffect(() => {
    onUpdateData({ 
      name,
      email,
      phone,
      instagram,
      linkedin,
      state,
      city,
      birthDate: birthDate ? birthDate.toISOString() : '',
      curiosity,
      memberType,
      startedAt: data.startedAt || new Date().toISOString()
    });
  }, [name, email, phone, instagram, linkedin, state, city, birthDate, curiosity, memberType, onUpdateData, data.startedAt]);

  // Carregar cidades quando estado é selecionado
  useEffect(() => {
    if (state && !cidadesPorEstado[state]) {
      loadCidades(state);
    }
  }, [state, cidadesPorEstado, loadCidades]);

  const handleNext = () => {
    // Gerar mensagem personalizada da IA baseada nas respostas
    const firstName = name.split(' ')[0];
    const estadoNome = estados.find(e => e.code === state)?.name || state;
    
    const aiMessage = `Olá ${firstName}! 🎉 É um prazer imenso ter você no VIVER DE IA Club! Vi que você é de ${city ? `${city}, ` : ''}${estadoNome} - que região incrível! ${curiosity ? `E adorei saber que ${curiosity.toLowerCase()}! ` : ''}Agora vamos conhecer melhor seu negócio para criar uma experiência totalmente personalizada que vai transformar sua empresa com IA. Bora lá? 🚀`;

    onUpdateData({ 
      aiMessage1: aiMessage
    });
    onNext();
  };

  const nameError = getFieldError?.('name');
  const emailError = getFieldError?.('email');
  const stateError = getFieldError?.('state');
  const cityError = getFieldError?.('city');
  const curiosityError = getFieldError?.('curiosity');
  
  // Validação local que corresponde à validação global
  const canProceed = name.trim() && email.trim() && state && city && curiosity.trim();

  return (
    <div className="space-y-8">
      {/* Header com logo */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8"
      >
        {/* Logo do Club */}
        <div className="flex justify-center">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <img
              src="/lovable-uploads/a408c993-07fa-49f2-bee6-c66d0614298b.png"
              alt="VIVER DE IA Club"
              className="h-40 w-auto mx-auto"
            />
          </motion.div>
        </div>
        
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-heading font-bold text-white"
          >
            Bem-vindo ao{' '}
            <span className="bg-gradient-to-r from-viverblue to-viverblue-light bg-clip-text text-transparent">
              VIVER DE IA Club
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed"
          >
            Vamos personalizar sua jornada para transformar seu negócio com IA. 
            Cada informação nos ajuda a criar uma experiência única para você!
          </motion.p>
        </div>
      </motion.div>

      {/* Formulário */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-[#151823] border border-white/10 rounded-2xl p-8">
          <div className="space-y-8">
            {/* Seção de informações pessoais */}
            <div className="space-y-6">
              <h3 className="text-xl font-heading font-semibold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-viverblue/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-viverblue" />
                </div>
                Informações Pessoais
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-white">
                    Nome completo *
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className={`h-12 bg-[#181A2A] border-white/10 text-white ${nameError ? 'border-red-500' : ''}`}
                  />
                  {nameError && (
                    <p className="text-sm text-red-400">{nameError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-white">
                    E-mail *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    disabled={!!userProfile?.email}
                    className={`h-12 bg-[#181A2A] border-white/10 text-white ${emailError ? 'border-red-500' : ''}`}
                  />
                  {emailError && (
                    <p className="text-sm text-red-400">{emailError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-white flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefone/WhatsApp
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="h-12 bg-[#181A2A] border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data de nascimento
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-12 w-full justify-start text-left font-normal bg-[#181A2A] border-white/10 text-white hover:bg-[#1F2332] hover:text-white",
                          !birthDate && "text-neutral-400"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthDate ? format(birthDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione sua data de nascimento"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#151823] border-white/10" align="start">
                      <Calendar
                        mode="single"
                        selected={birthDate}
                        onSelect={setBirthDate}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Seção de redes sociais */}
            <div className="space-y-6">
              <h3 className="text-lg font-heading font-semibold text-white">
                Redes Sociais <span className="text-neutral-400 text-sm font-normal">(opcional)</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-sm font-medium text-white flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@seuusuario"
                    className="h-12 bg-[#181A2A] border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="text-sm font-medium text-white flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="linkedin.com/in/seuperfil"
                    className="h-12 bg-[#181A2A] border-white/10 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Seção de localização */}
            <div className="space-y-6">
              <h3 className="text-lg font-heading font-semibold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-viverblue/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-viverblue" />
                </div>
                Localização
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white">
                    Estado *
                  </Label>
                  <Select value={state} onValueChange={setState} disabled={locationsLoading}>
                    <SelectTrigger className={`h-12 bg-[#181A2A] border-white/10 text-white ${stateError ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder={locationsLoading ? "Carregando..." : "Selecione seu estado"} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151823] border-white/10">
                      {estados.map((estado) => (
                        <SelectItem key={estado.code} value={estado.code}>
                          {estado.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {stateError && (
                    <p className="text-sm text-red-400">{stateError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white">
                    Cidade *
                  </Label>
                  <Select value={city} onValueChange={setCity} disabled={!state || locationsLoading}>
                    <SelectTrigger className={`h-12 bg-[#181A2A] border-white/10 text-white ${cityError ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder={!state ? "Selecione primeiro o estado" : "Selecione sua cidade"} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151823] border-white/10">
                      {state && cidadesPorEstado[state]?.map((cidade) => (
                        <SelectItem key={cidade.name} value={cidade.name}>
                          {cidade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {cityError && (
                    <p className="text-sm text-red-400">{cityError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Seção sobre você */}
            <div className="space-y-6">
              <h3 className="text-lg font-heading font-semibold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-viverblue/20 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-viverblue" />
                </div>
                Sobre Você
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="curiosity" className="text-sm font-medium text-white">
                  Conte uma curiosidade sobre você *
                </Label>
                <Textarea
                  id="curiosity"
                  value={curiosity}
                  onChange={(e) => setCuriosity(e.target.value)}
                  placeholder="Algo interessante sobre você, seus hobbies, paixões..."
                  className={`min-h-[100px] bg-[#181A2A] border-white/10 text-white ${curiosityError ? 'border-red-500' : ''}`}
                />
                {curiosityError && (
                  <p className="text-sm text-red-400">{curiosityError}</p>
                )}
                <p className="text-xs text-neutral-400">
                  Isso nos ajuda a tornar nossa conversa mais humana e personalizada ✨
                </p>
              </div>
            </div>

            {/* Botão de continuar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="pt-6"
            >
              <Button 
                onClick={handleNext}
                disabled={!canProceed}
                size="lg"
                className="w-full h-14 bg-viverblue hover:bg-viverblue-dark text-[#0F111A] text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Vamos falar do seu negócio! 💼
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Dica */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="bg-viverblue/5 border border-viverblue/20 rounded-xl p-4 text-center max-w-2xl mx-auto"
      >
        <p className="text-sm text-neutral-300">
          💡 <strong className="text-white">Etapa 1 de 5:</strong> Quanto mais você nos contar, 
          melhor nossa IA personalizada poderá ajudar você! 🚀
        </p>
      </motion.div>
    </div>
  );
};
