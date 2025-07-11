import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, TrendingUp, Clock, Star } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedButton } from '../components/EnhancedButton';

interface OnboardingStep5Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

export const OnboardingStep5: React.FC<OnboardingStep5Props> = ({
  data,
  onNext,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    main_objectives: data.goals_info?.main_objectives || [],
    priority_areas: data.goals_info?.priority_areas || [],
    timeline: data.goals_info?.timeline || '',
    success_metrics: data.goals_info?.success_metrics || '',
    biggest_challenges: data.goals_info?.biggest_challenges || '',
    ...data.goals_info
  });

  const objectives = [
    { id: 'productivity', label: 'Aumentar produtividade', icon: Zap },
    { id: 'automation', label: 'Automatizar processos', icon: Target },
    { id: 'revenue', label: 'Aumentar receita', icon: TrendingUp },
    { id: 'efficiency', label: 'Melhorar eficiência operacional', icon: Clock },
    { id: 'innovation', label: 'Inovar produtos/serviços', icon: Star },
    { id: 'decisions', label: 'Melhorar tomada de decisões', icon: Target },
    { id: 'customer', label: 'Melhorar experiência do cliente', icon: Star },
    { id: 'costs', label: 'Reduzir custos operacionais', icon: TrendingUp }
  ];

  const priorityAreas = [
    'Marketing e Vendas',
    'Atendimento ao Cliente',
    'Operações e Logística',
    'Recursos Humanos',
    'Finanças e Controle',
    'Desenvolvimento de Produtos',
    'Análise de Dados',
    'Estratégia Empresarial'
  ];

  const timelines = [
    '1-3 meses',
    '3-6 meses',
    '6-12 meses',
    '1-2 anos',
    'Longo prazo (2+ anos)'
  ];

  const handleObjectiveToggle = (objective: string) => {
    setFormData(prev => ({
      ...prev,
      main_objectives: prev.main_objectives.includes(objective)
        ? prev.main_objectives.filter((obj: string) => obj !== objective)
        : [...prev.main_objectives, objective]
    }));
  };

  const handlePriorityToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      priority_areas: prev.priority_areas.includes(area)
        ? prev.priority_areas.filter((a: string) => a !== area)
        : [...prev.priority_areas, area]
    }));
  };

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
          <Target className="w-8 h-8 text-white" />
        </motion.div>
        
        <h2 className="text-3xl font-bold text-white">
          Quais são seus objetivos?
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
          Conhecer seus objetivos nos permite criar um plano personalizado 
          e medir o sucesso da sua jornada com IA.
        </p>
      </div>

      {/* Objetivos principais */}
      <div className="space-y-4">
        <Label className="text-white font-medium text-lg">
          Quais são seus principais objetivos com IA?
        </Label>
        <div className="grid md:grid-cols-2 gap-3">
          {objectives.map((objective, index) => (
            <motion.div
              key={objective.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <Button
                type="button"
                variant={formData.main_objectives.includes(objective.id) ? "default" : "outline"}
                className={`w-full justify-start h-auto p-4 ${
                  formData.main_objectives.includes(objective.id)
                    ? "bg-viverblue hover:bg-viverblue/90 text-white"
                    : "bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
                }`}
                onClick={() => handleObjectiveToggle(objective.id)}
              >
                <objective.icon className="w-5 h-5 mr-3" />
                {objective.label}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Áreas prioritárias */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-4"
      >
        <Label className="text-white font-medium text-lg">
          Quais áreas da sua empresa são prioritárias?
        </Label>
        <div className="grid md:grid-cols-2 gap-3">
          {priorityAreas.map((area, index) => (
            <motion.div
              key={area}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.05 }}
            >
              <Button
                type="button"
                variant={formData.priority_areas.includes(area) ? "default" : "outline"}
                className={`w-full h-auto p-3 ${
                  formData.priority_areas.includes(area)
                    ? "bg-viverblue hover:bg-viverblue/90 text-white"
                    : "bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
                }`}
                onClick={() => handlePriorityToggle(area)}
              >
                {area}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="space-y-2"
      >
        <Label className="text-white font-medium text-lg">
          Em quanto tempo espera ver resultados?
        </Label>
        <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white focus:border-viverblue">
            <SelectValue placeholder="Selecione o prazo" />
          </SelectTrigger>
          <SelectContent>
            {timelines.map((timeline) => (
              <SelectItem key={timeline} value={timeline}>
                {timeline}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Métricas de sucesso */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="space-y-2"
      >
        <Label htmlFor="success_metrics" className="text-white font-medium text-lg">
          Como você vai medir o sucesso?
        </Label>
        <Textarea
          id="success_metrics"
          placeholder="Descreva como você vai saber que está alcançando seus objetivos..."
          value={formData.success_metrics}
          onChange={(e) => handleInputChange('success_metrics', e.target.value)}
          className="min-h-[80px] bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-viverblue"
        />
      </motion.div>

      {/* Botão de continuar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="flex justify-center pt-6"
      >
        <EnhancedButton
          onClick={handleNext}
          disabled={isLoading}
          loading={isLoading}
          size="lg"
          className="px-12"
        >
          {isLoading ? "Salvando..." : "Última Etapa →"}
        </EnhancedButton>
      </motion.div>
    </motion.div>
  );
};