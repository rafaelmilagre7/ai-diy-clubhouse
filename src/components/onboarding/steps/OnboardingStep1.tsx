
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Instagram, Linkedin, MapPin, Calendar, Heart } from 'lucide-react';
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

  const { estados, cidadesPorEstado, isLoading: locationsLoading, loadCidades } = useIBGELocations();

  // Carregar cidades quando estado é selecionado
  React.useEffect(() => {
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

  const nameError = getFieldError?.('name');
  const emailError = getFieldError?.('email');
  const stateError = getFieldError?.('state');
  const cityError = getFieldError?.('city');
  const curiosityError = getFieldError?.('curiosity');
  
  const canProceed = name.trim() && email.trim() && state && city && curiosity.trim();

  // Gerar anos para select de data de nascimento
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - 18 - i);

  return (
    <div className="space-y-8">
      {/* Header redesenhado com logo */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        {/* Logo do Club */}
        <div className="flex justify-center">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-viverblue/10 to-viverblue-light/10 p-6 rounded-2xl border border-viverblue/20 shadow-lg"
          >
            <img
              src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
              alt="VIVER DE IA Club"
              className="h-16 w-auto mx-auto"
            />
          </motion.div>
        </div>
        
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold bg-gradient-to-r from-viverblue to-viverblue-light bg-clip-text text-transparent"
          >
            Bem-vindo ao VIVER DE IA Club!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            Vamos personalizar sua jornada para transformar seu negócio com IA. 
            Cada informação nos ajuda a criar uma experiência única para você!
          </motion.p>
        </div>
      </motion.div>

      {/* Formulário redesenhado */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <div className="space-y-8">
            {/* Seção de informações pessoais */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-6 h-6 text-viverblue" />
                Informações Pessoais
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nome completo *
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className={`h-12 ${nameError ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  />
                  {nameError && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      {nameError}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    E-mail *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    disabled={!!userProfile?.email}
                    className={`h-12 ${emailError ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  />
                  {emailError && (
                    <p className="text-sm text-red-500">{emailError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefone/WhatsApp
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="h-12 border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Ano de nascimento
                  </Label>
                  <Select value={birthDate} onValueChange={setBirthDate}>
                    <SelectTrigger className="h-12 border-gray-300 dark:border-gray-600">
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
              </div>
            </div>

            {/* Seção de redes sociais */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Redes Sociais (opcional)
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@seuusuario"
                    className="h-12 border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="linkedin.com/in/seuperfil"
                    className="h-12 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Seção de localização */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-viverblue" />
                Localização
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estado *
                  </Label>
                  <Select value={state} onValueChange={setState} disabled={locationsLoading}>
                    <SelectTrigger className={`h-12 ${stateError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
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
                  {stateError && (
                    <p className="text-sm text-red-500">{stateError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cidade *
                  </Label>
                  <Select value={city} onValueChange={setCity} disabled={!state || locationsLoading}>
                    <SelectTrigger className={`h-12 ${cityError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
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
                  {cityError && (
                    <p className="text-sm text-red-500">{cityError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Seção sobre você */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-viverblue" />
                Sobre Você
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="curiosity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Conte uma curiosidade sobre você *
                </Label>
                <Textarea
                  id="curiosity"
                  value={curiosity}
                  onChange={(e) => setCuriosity(e.target.value)}
                  placeholder="Algo interessante sobre você, seus hobbies, paixões..."
                  className={`min-h-[100px] ${curiosityError ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {curiosityError && (
                  <p className="text-sm text-red-500">{curiosityError}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
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
                className="w-full h-14 bg-gradient-to-r from-viverblue to-viverblue-light hover:from-viverblue-dark hover:to-viverblue text-white text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Vamos falar do seu negócio! 💼
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Dica redesenhada */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="bg-gradient-to-r from-viverblue/5 to-viverblue-light/5 border border-viverblue/20 rounded-2xl p-6 text-center max-w-2xl mx-auto"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          💡 <strong>Etapa 1 de 5:</strong> Quanto mais você nos contar, 
          melhor nossa IA personalizada poderá ajudar você! 🚀
        </p>
      </motion.div>
    </div>
  );
};
