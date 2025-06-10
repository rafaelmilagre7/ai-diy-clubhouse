
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { motion } from 'framer-motion';
import { User, Calendar, MapPin, Sparkles } from 'lucide-react';
import { AIMessageDisplay } from '../components/AIMessageDisplay';
import { EnhancedFieldIndicator } from '../components/EnhancedFieldIndicator';

const OnboardingStep1 = ({ data, onUpdateData, validationErrors = [], getFieldError }: OnboardingStepProps) => {
  const [localData, setLocalData] = useState({
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    instagram: data.instagram || '',
    linkedin: data.linkedin || '',
    state: data.state || '',
    city: data.city || '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    curiosity: data.curiosity || ''
  });

  // Extrair dia, mês e ano da data existente se houver
  useEffect(() => {
    if (data.birthDate) {
      const date = new Date(data.birthDate);
      if (!isNaN(date.getTime())) {
        setLocalData(prev => ({
          ...prev,
          birthDay: date.getDate().toString(),
          birthMonth: (date.getMonth() + 1).toString(),
          birthYear: date.getFullYear().toString()
        }));
      }
    }
  }, [data.birthDate]);

  const handleFieldChange = (field: string, value: string) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);

    // Se mudou dia, mês ou ano, reconstruir a data
    if (field === 'birthDay' || field === 'birthMonth' || field === 'birthYear') {
      const { birthDay, birthMonth, birthYear } = newData;
      if (birthDay && birthMonth && birthYear) {
        const birthDate = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
        onUpdateData({ 
          ...newData, 
          birthDate: birthDate.toISOString().split('T')[0]
        });
      } else {
        onUpdateData({ ...newData, birthDate: '' });
      }
    } else {
      onUpdateData(newData);
    }
  };

  // Gerar opções para os selects
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  const monthOptions = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1940 + 1 }, (_, i) => currentYear - i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <AIMessageDisplay 
        message={data.aiMessage1} 
        isLoading={false}
      />

      <Card className="bg-[#151823] border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <User className="w-5 h-5 text-viverblue" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white flex items-center gap-2">
                Nome completo
                <EnhancedFieldIndicator isRequired />
              </Label>
              <Input
                id="name"
                value={localData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Seu nome completo"
                className="bg-white/5 border-white/20 text-white placeholder:text-neutral-400"
              />
              {getFieldError?.('name') && (
                <p className="text-red-400 text-sm">{getFieldError('name')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white flex items-center gap-2">
                E-mail
                <EnhancedFieldIndicator isRequired />
              </Label>
              <Input
                id="email"
                type="email"
                value={localData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="seu@email.com"
                className="bg-white/5 border-white/20 text-white placeholder:text-neutral-400"
              />
              {getFieldError?.('email') && (
                <p className="text-red-400 text-sm">{getFieldError('email')}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">
                Telefone (WhatsApp)
              </Label>
              <Input
                id="phone"
                value={localData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                className="bg-white/5 border-white/20 text-white placeholder:text-neutral-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-white">
                Instagram
              </Label>
              <Input
                id="instagram"
                value={localData.instagram}
                onChange={(e) => handleFieldChange('instagram', e.target.value)}
                placeholder="@seuinstagram"
                className="bg-white/5 border-white/20 text-white placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin" className="text-white">
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              value={localData.linkedin}
              onChange={(e) => handleFieldChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/seuperfil"
              className="bg-white/5 border-white/20 text-white placeholder:text-neutral-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Estado
              </Label>
              <Input
                value={localData.state}
                onChange={(e) => handleFieldChange('state', e.target.value)}
                placeholder="São Paulo"
                className="bg-white/5 border-white/20 text-white placeholder:text-neutral-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">
                Cidade
              </Label>
              <Input
                value={localData.city}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                placeholder="São Paulo"
                className="bg-white/5 border-white/20 text-white placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data de nascimento
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Select value={localData.birthDay} onValueChange={(value) => handleFieldChange('birthDay', value)}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {dayOptions.map(day => (
                      <SelectItem key={day} value={day.toString()}>
                        {day.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={localData.birthMonth} onValueChange={(value) => handleFieldChange('birthMonth', value)}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map(month => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={localData.birthYear} onValueChange={(value) => handleFieldChange('birthYear', value)}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {getFieldError?.('birthDate') && (
              <p className="text-red-400 text-sm">{getFieldError('birthDate')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="curiosity" className="text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              O que te trouxe até aqui? Qual sua curiosidade sobre IA?
            </Label>
            <Textarea
              id="curiosity"
              value={localData.curiosity}
              onChange={(e) => handleFieldChange('curiosity', e.target.value)}
              placeholder="Conte-nos o que despertou seu interesse pela Inteligência Artificial..."
              className="bg-white/5 border-white/20 text-white placeholder:text-neutral-400 min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OnboardingStep1;
