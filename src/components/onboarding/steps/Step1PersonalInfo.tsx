import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BRAZILIAN_STATES, getCitiesByState } from '@/utils/brazilianCities';

interface PersonalInfoData {
  name: string;
  phone: string;
  state: string;
  city: string;
  birth_date?: string;
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
    } else if (!/^\(?[1-9]{2}\)?\s?9?\d{4}-?\d{4}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Telefone inválido';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Estado é obrigatório';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
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
          <Label htmlFor="phone" className="text-sm font-medium text-foreground mb-2 block">
            Qual seu telefone para contato? *
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
              className={`pl-10 h-12 bg-background/50 border-border/50 focus:border-primary transition-all duration-300 ${
                errors.phone ? 'border-destructive focus:border-destructive' : ''
              }`}
            />
          </div>
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
          transition={{ delay: 0.4 }}
        >
          <Label htmlFor="birth_date" className="text-sm font-medium text-foreground mb-2 block">
            Data de nascimento (opcional)
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => handleChange('birth_date', e.target.value)}
              className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary transition-all duration-300"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Isso nos ajuda a personalizar melhor sua experiência
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

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="pt-4"
      >
        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 text-primary-foreground font-medium"
        >
          Continuar para próxima etapa
        </Button>
      </motion.div>
    </form>
  );
};