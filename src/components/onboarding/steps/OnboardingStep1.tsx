import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedButton } from '../components/EnhancedButton';

interface OnboardingStep1Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

export const OnboardingStep1: React.FC<OnboardingStep1Props> = ({
  data,
  onNext,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: data.personal_info?.name || '',
    email: data.personal_info?.email || '',
    phone: data.personal_info?.phone || '',
    birth_date: data.personal_info?.birth_date || '',
    ...data.personal_info
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (!formData.name || !formData.email) {
      return;
    }
    onNext(formData);
  };

  const isValid = formData.name && formData.email;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Cabeçalho */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-16 h-16 bg-gradient-to-br from-viverblue to-viverblue-light rounded-2xl mx-auto flex items-center justify-center mb-6"
        >
          <User className="w-8 h-8 text-white" />
        </motion.div>
        
        <h2 className="text-3xl font-bold text-white">
          Vamos nos conhecer melhor! 👋
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
          Para criar uma experiência personalizada e eficaz, precisamos conhecer você. 
          Essas informações nos ajudam a adaptar o conteúdo às suas necessidades específicas.
        </p>
      </div>

      {/* Formulário */}
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <Label htmlFor="name" className="text-white font-medium">
            Nome completo *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-viverblue"
              required
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Label htmlFor="email" className="text-white font-medium">
            Email profissional *
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-viverblue"
              required
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <Label htmlFor="phone" className="text-white font-medium">
            Telefone/WhatsApp
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-viverblue"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-2"
        >
          <Label htmlFor="birth_date" className="text-white font-medium">
            Data de nascimento
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => handleInputChange('birth_date', e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-viverblue"
            />
          </div>
        </motion.div>
      </div>

      {/* Dica de privacidade */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-slate-700/30 rounded-xl p-4 max-w-2xl mx-auto"
      >
        <p className="text-sm text-slate-300 text-center">
          🔒 <strong>Suas informações estão seguras</strong> - Utilizamos criptografia avançada 
          e seguimos as melhores práticas de segurança para proteger seus dados.
        </p>
      </motion.div>

      {/* Botão de continuar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center pt-6"
      >
        <EnhancedButton
          onClick={handleNext}
          disabled={!isValid || isLoading}
          loading={isLoading}
          size="lg"
          className="px-12"
        >
          {isLoading ? "Salvando..." : "Continuar Descobrindo →"}
        </EnhancedButton>
      </motion.div>
    </motion.div>
  );
};