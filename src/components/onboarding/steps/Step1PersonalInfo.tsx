import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Calendar, Instagram, Linkedin, Camera, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BRAZILIAN_STATES, getCitiesByState } from '@/utils/brazilianCities';
import { DateSelector } from '@/components/ui/date-selector';
import { InternationalPhoneInput } from '@/components/ui/international-phone-input';
import { validateInternationalPhone, validateLinkedInUrl, validateInstagramUrl, formatSocialUrl } from '@/utils/validationUtils';
import { ProfilePictureUpload } from '@/components/ui/profile-picture-upload';

interface PersonalInfoData {
  name: string;
  phone: string;
  state: string;
  city: string;
  birth_date?: string;
  instagram_url?: string;
  linkedin_url?: string;
  profile_picture?: string;
  fun_fact?: string;
}

interface Step1PersonalInfoProps {
  initialData?: PersonalInfoData;
  onDataChange: (data: PersonalInfoData) => void;
  onNext: () => void;
}

export const Step1PersonalInfo: React.FC<Step1PersonalInfoProps> = ({
  initialData,
  onDataChange,
  onNext,
}) => {
  const [formData, setFormData] = useState<PersonalInfoData>({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    state: initialData?.state || '',
    city: initialData?.city || '',
    birth_date: initialData?.birth_date || '',
    instagram_url: initialData?.instagram_url || '',
    linkedin_url: initialData?.linkedin_url || '',
    profile_picture: initialData?.profile_picture || '',
    fun_fact: initialData?.fun_fact || '',
  });

  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const [errors, setErrors] = useState<Partial<PersonalInfoData>>({});

  // Carregar cidades quando estado mudar
  useEffect(() => {
    if (formData.state) {
      const cities = getCitiesByState(formData.state);
      setAvailableCities(cities);
      // Limpar cidade se não estiver na lista do novo estado
      if (formData.city && !cities.includes(formData.city)) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    } else {
      setAvailableCities([]);
    }
  }, [formData.state, formData.city]);

  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  const handleChange = (field: keyof PersonalInfoData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<PersonalInfoData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!validateInternationalPhone(formData.phone)) {
      newErrors.phone = 'Telefone inválido. Verifique o formato.';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Estado é obrigatório';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }

    // Validações opcionais - só validar se preenchidos
    if (formData.linkedin_url && formData.linkedin_url.trim()) {
      if (!validateLinkedInUrl(formData.linkedin_url)) {
        newErrors.linkedin_url = 'URL do LinkedIn inválida';
      }
    }

    if (formData.instagram_url && formData.instagram_url.trim()) {
      if (!validateInstagramUrl(formData.instagram_url)) {
        newErrors.instagram_url = 'URL do Instagram inválida';
      }
    }

    if (formData.fun_fact && formData.fun_fact.length > 200) {
      newErrors.fun_fact = 'Máximo 200 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validação é feita pelo OnboardingLayout via canProceed
    // Não precisa fazer nada aqui, o onNext do layout cuida do resto
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6">
        {/* Nome */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Label htmlFor="name" className="text-sm font-medium text-foreground mb-2 block">
            Como você gostaria de ser chamado(a)? *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`pl-10 h-12 bg-background/50 border-border/50 focus:border-primary transition-all duration-300 ${
                errors.name ? 'border-destructive focus:border-destructive' : ''
              }`}
            />
          </div>
          {errors.name && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-destructive text-xs mt-1"
            >
              {errors.name}
            </motion.p>
          )}
        </motion.div>

        {/* Telefone */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Label className="text-sm font-medium text-foreground mb-2 block">
            Qual seu telefone para contato? *
          </Label>
          <InternationalPhoneInput
            value={formData.phone}
            onChange={(phone) => handleChange('phone', phone)}
            error={errors.phone}
            placeholder="Número de telefone"
          />
          {errors.phone && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-destructive text-xs mt-1"
            >
              {errors.phone}
            </motion.p>
          )}
        </motion.div>

        {/* Estado */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Label className="text-sm font-medium text-foreground mb-2 block">
            Em qual estado você está localizado(a)? *
          </Label>
          <Select value={formData.state} onValueChange={(value) => handleChange('state', value)}>
            <SelectTrigger className={`h-12 bg-background/50 border-border/50 focus:border-primary transition-all duration-300 ${
              errors.state ? 'border-destructive focus:border-destructive' : ''
            }`}>
              <SelectValue placeholder="Selecione seu estado" />
            </SelectTrigger>
            <SelectContent className="pointer-events-auto">
              {BRAZILIAN_STATES.map((state) => (
                <SelectItem key={state.code} value={state.code}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-destructive text-xs mt-1"
            >
              {errors.state}
            </motion.p>
          )}
        </motion.div>

        {/* Cidade */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Label className="text-sm font-medium text-foreground mb-2 block">
            Em qual cidade você está localizado(a)? *
          </Label>
          <Select 
            value={formData.city} 
            onValueChange={(value) => handleChange('city', value)}
            disabled={!formData.state || availableCities.length === 0}
          >
            <SelectTrigger className={`h-12 bg-background/50 border-border/50 focus:border-primary transition-all duration-300 ${
              errors.city ? 'border-destructive focus:border-destructive' : ''
            } ${!formData.state ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <SelectValue placeholder={
                !formData.state 
                  ? "Primeiro selecione um estado" 
                  : availableCities.length === 0 
                    ? "Nenhuma cidade disponível" 
                    : "Selecione sua cidade"
              } />
            </SelectTrigger>
            <SelectContent className="pointer-events-auto">
              {availableCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-destructive text-xs mt-1"
            >
              {errors.city}
            </motion.p>
          )}
        </motion.div>

        {/* Data de Nascimento (Opcional) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Label className="text-sm font-medium text-foreground mb-2 block">
            Data de nascimento (opcional)
          </Label>
          <DateSelector
            value={formData.birth_date}
            onChange={(date) => handleChange('birth_date', date)}
            placeholder="Selecione sua data de nascimento"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Isso nos ajuda a personalizar melhor sua experiência
          </p>
        </motion.div>

        {/* Upload de Foto de Perfil (Opcional) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Label className="text-sm font-medium text-foreground mb-4 block text-center">
            Faça upload de uma foto de perfil (opcional)
          </Label>
          <ProfilePictureUpload
            value={formData.profile_picture}
            onChange={(url) => handleChange('profile_picture', url)}
          />
        </motion.div>

        {/* LinkedIn (Opcional) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Label htmlFor="linkedin_url" className="text-sm font-medium text-foreground mb-2 block">
            Qual seu LinkedIn? (opcional)
          </Label>
          <div className="relative">
            <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="linkedin_url"
              type="text"
              placeholder="linkedin.com/in/seu-perfil ou seu-usuario"
              value={formData.linkedin_url}
              onChange={(e) => {
                const formatted = formatSocialUrl(e.target.value, 'linkedin');
                handleChange('linkedin_url', formatted);
              }}
              className={`pl-10 h-12 bg-background/50 border-border/50 focus:border-primary transition-all duration-300 ${
                errors.linkedin_url ? 'border-destructive focus:border-destructive' : ''
              }`}
            />
          </div>
          {errors.linkedin_url && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-destructive text-xs mt-1"
            >
              {errors.linkedin_url}
            </motion.p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Isso nos ajuda a conhecer melhor seu perfil profissional
          </p>
        </motion.div>

        {/* Instagram (Opcional) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Label htmlFor="instagram_url" className="text-sm font-medium text-foreground mb-2 block">
            Qual seu Instagram? (opcional)
          </Label>
          <div className="relative">
            <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="instagram_url"
              type="text"
              placeholder="@seu-usuario ou instagram.com/seu-perfil"
              value={formData.instagram_url}
              onChange={(e) => {
                const formatted = formatSocialUrl(e.target.value, 'instagram');
                handleChange('instagram_url', formatted);
              }}
              className={`pl-10 h-12 bg-background/50 border-border/50 focus:border-primary transition-all duration-300 ${
                errors.instagram_url ? 'border-destructive focus:border-destructive' : ''
              }`}
            />
          </div>
          {errors.instagram_url && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-destructive text-xs mt-1"
            >
              {errors.instagram_url}
            </motion.p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Opcional, mas nos ajuda a conhecer mais sobre você
          </p>
        </motion.div>

        {/* Curiosidade (Opcional) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Label htmlFor="fun_fact" className="text-sm font-medium text-foreground mb-2 block">
            Conte uma curiosidade sobre você (opcional)
          </Label>
          <div className="relative">
            <Sparkles className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <textarea
              id="fun_fact"
              placeholder="Ex: Já visitei 15 países, amo culinária japonesa, pratico yoga há 5 anos..."
              value={formData.fun_fact}
              onChange={(e) => handleChange('fun_fact', e.target.value)}
              rows={3}
              maxLength={200}
              className={`pl-10 pt-3 pb-3 resize-none bg-background/50 border-border/50 focus:border-primary transition-all duration-300 w-full rounded-md border ${
                errors.fun_fact ? 'border-destructive focus:border-destructive' : ''
              }`}
            />
          </div>
          {formData.fun_fact && (
            <p className="text-xs text-muted-foreground mt-1">
              {formData.fun_fact.length}/200 caracteres
            </p>
          )}
          {errors.fun_fact && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-destructive text-xs mt-1"
            >
              {errors.fun_fact}
            </motion.p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Isso torna a experiência mais pessoal e divertida!
          </p>
        </motion.div>
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
            <div className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Seus dados estão seguros.</strong> Utilizamos essas informações apenas para personalizar sua experiência e facilitar nossa comunicação.
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Removido: botão submit duplicado - o OnboardingLayout já tem o botão de navegação */}
    </form>
  );
};