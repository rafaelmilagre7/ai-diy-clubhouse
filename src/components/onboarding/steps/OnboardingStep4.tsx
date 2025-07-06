import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, Users, TrendingUp, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EnhancedButton } from '../components/EnhancedButton';

interface OnboardingStep4Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

export const OnboardingStep4: React.FC<OnboardingStep4Props> = ({
  data,
  onNext,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    company_name: data.business_info?.company_name || '',
    position: data.business_info?.position || '',
    company_size: data.business_info?.company_size || '',
    industry: data.business_info?.industry || '',
    business_model: data.business_info?.business_model || '',
    main_responsibilities: data.business_info?.main_responsibilities || '',
    ...data.business_info
  });

  const companySizes = [
    'Freelancer/Autônomo',
    'Startup (1-10 funcionários)',
    'Pequena empresa (11-50 funcionários)',
    'Média empresa (51-200 funcionários)',
    'Grande empresa (201-1000 funcionários)',
    'Corporação (1000+ funcionários)'
  ];

  const industries = [
    'Tecnologia',
    'Consultoria',
    'E-commerce',
    'Educação',
    'Saúde',
    'Finanças',
    'Marketing/Publicidade',
    'Manufatura',
    'Serviços',
    'Governo',
    'Outro'
  ];

  const businessModels = [
    'B2B (Business to Business)',
    'B2C (Business to Consumer)',
    'B2B2C (Business to Business to Consumer)',
    'Marketplace',
    'SaaS (Software as a Service)',
    'E-commerce',
    'Consultoria',
    'Agência',
    'Outro'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    onNext(formData);
  };

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
          <Building className="w-8 h-8 text-white" />
        </motion.div>
        
        <h2 className="text-3xl font-bold text-white">
          Conte sobre seu contexto profissional 💼
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
          Conhecer seu ambiente de trabalho nos permite personalizar estratégias 
          e casos de uso que fazem sentido para sua realidade empresarial.
        </p>
      </div>

      {/* Formulário */}
      <div className="grid gap-6 max-w-2xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor="company_name" className="text-white font-medium">
              Nome da empresa
            </Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="company_name"
                type="text"
                placeholder="Nome da sua empresa"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-viverblue"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <Label htmlFor="position" className="text-white font-medium">
              Seu cargo/posição
            </Label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="position"
                type="text"
                placeholder="Ex: CEO, Gerente de Marketing..."
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-viverblue"
              />
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <Label className="text-white font-medium">
              Tamanho da empresa
            </Label>
            <Select value={formData.company_size} onValueChange={(value) => handleInputChange('company_size', value)}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white focus:border-viverblue">
                <SelectValue placeholder="Selecione o porte" />
              </SelectTrigger>
              <SelectContent>
                {companySizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            <Label className="text-white font-medium">
              Setor/Indústria
            </Label>
            <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white focus:border-viverblue">
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-2"
        >
          <Label className="text-white font-medium">
            Modelo de negócio
          </Label>
          <Select value={formData.business_model} onValueChange={(value) => handleInputChange('business_model', value)}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white focus:border-viverblue">
              <SelectValue placeholder="Como sua empresa opera?" />
            </SelectTrigger>
            <SelectContent>
              {businessModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-2"
        >
          <Label htmlFor="main_responsibilities" className="text-white font-medium">
            Principais responsabilidades
          </Label>
          <Textarea
            id="main_responsibilities"
            placeholder="Descreva suas principais responsabilidades e atividades no trabalho..."
            value={formData.main_responsibilities}
            onChange={(e) => handleInputChange('main_responsibilities', e.target.value)}
            className="min-h-[100px] bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-viverblue"
          />
        </motion.div>
      </div>

      {/* Botão de continuar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex justify-center pt-6"
      >
        <EnhancedButton
          onClick={handleNext}
          disabled={isLoading}
          loading={isLoading}
          size="lg"
          className="px-12"
        >
          {isLoading ? "Salvando..." : "Continuar Avançando →"}
        </EnhancedButton>
      </motion.div>
    </motion.div>
  );
};