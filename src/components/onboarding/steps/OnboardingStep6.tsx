import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, BookOpen, Users, Zap, Star, Award } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedButton } from '../components/EnhancedButton';

interface OnboardingStep6Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

export const OnboardingStep6: React.FC<OnboardingStep6Props> = ({
  data,
  onNext,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    ai_knowledge_level: data.ai_experience?.ai_knowledge_level || '',
    current_ai_usage: data.ai_experience?.current_ai_usage || [],
    learning_preference: data.ai_experience?.learning_preference || '',
    weekly_learning_time: data.ai_experience?.weekly_learning_time || '',
    preferred_communication: data.ai_experience?.preferred_communication || '',
    additional_info: data.ai_experience?.additional_info || '',
    ...data.ai_experience
  });

  const knowledgeLevels = [
    { id: 'beginner', label: '🌱 Iniciante - Pouco ou nenhum conhecimento', description: 'Ainda estou aprendendo o básico sobre IA' },
    { id: 'basic', label: '📚 Básico - Conhecimentos teóricos', description: 'Entendo conceitos, mas pouca prática' },
    { id: 'intermediate', label: '⚡ Intermediário - Alguma experiência prática', description: 'Já usei algumas ferramentas de IA' },
    { id: 'advanced', label: '🚀 Avançado - Experiência significativa', description: 'Implemento IA regularmente no trabalho' },
    { id: 'expert', label: '🏆 Expert - Profundo conhecimento técnico', description: 'Desenvolvo e lidero projetos de IA' }
  ];

  const currentUsage = [
    'ChatGPT ou assistentes de texto',
    'Ferramentas de design (Midjourney, DALL-E)',
    'Automação de processos',
    'Análise de dados com IA',
    'Chatbots para atendimento',
    'Ferramentas de código/programação',
    'Marketing e criação de conteúdo',
    'Ainda não uso nenhuma ferramenta'
  ];

  const learningPreferences = [
    'Vídeos e tutoriais práticos',
    'Artigos e conteúdo escrito',
    'Workshops e eventos ao vivo',
    'Casos práticos e estudos de caso',
    'Comunidade e discussões',
    'Experimentação hands-on'
  ];

  const timeCommitments = [
    '1-2 horas por semana',
    '3-5 horas por semana',
    '6-10 horas por semana',
    'Mais de 10 horas por semana',
    'Conforme a demanda'
  ];

  const communicationPreferences = [
    'Email com resumos semanais',
    'Notificações push no app',
    'WhatsApp para updates importantes',
    'Newsletter mensal detalhada',
    'Apenas quando eu acessar a plataforma'
  ];

  const handleUsageToggle = (usage: string) => {
    setFormData(prev => ({
      ...prev,
      current_ai_usage: prev.current_ai_usage.includes(usage)
        ? prev.current_ai_usage.filter((u: string) => u !== usage)
        : [...prev.current_ai_usage, usage]
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
          <Brain className="w-8 h-8 text-white" />
        </motion.div>
        
        <h2 className="text-3xl font-bold text-white">
          Qual é sua experiência com IA? 🧠
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
          Para personalizar perfeitamente sua experiência, queremos entender 
          seu nível atual e como você prefere aprender sobre IA.
        </p>
      </div>

      {/* Nível de conhecimento */}
      <div className="space-y-4">
        <Label className="text-white font-medium text-lg">
          Qual é seu nível atual de conhecimento em IA?
        </Label>
        <div className="space-y-3">
          {knowledgeLevels.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Button
                type="button"
                variant={formData.ai_knowledge_level === level.id ? "default" : "outline"}
                className={`w-full justify-start h-auto p-4 text-left ${
                  formData.ai_knowledge_level === level.id
                    ? "bg-viverblue hover:bg-viverblue/90 text-white"
                    : "bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
                }`}
                onClick={() => handleInputChange('ai_knowledge_level', level.id)}
              >
                <div>
                  <div className="font-medium">{level.label}</div>
                  <div className="text-sm opacity-80 mt-1">{level.description}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Uso atual */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-4"
      >
        <Label className="text-white font-medium text-lg">
          Quais ferramentas de IA você já usa?
        </Label>
        <div className="grid md:grid-cols-2 gap-3">
          {currentUsage.map((usage, index) => (
            <motion.div
              key={usage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.05 }}
            >
              <Button
                type="button"
                variant={formData.current_ai_usage.includes(usage) ? "default" : "outline"}
                className={`w-full h-auto p-3 text-sm ${
                  formData.current_ai_usage.includes(usage)
                    ? "bg-viverblue hover:bg-viverblue/90 text-white"
                    : "bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
                }`}
                onClick={() => handleUsageToggle(usage)}
              >
                {usage}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Preferências de aprendizado */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.3 }}
          className="space-y-2"
        >
          <Label className="text-white font-medium">
            Como você prefere aprender?
          </Label>
          <Select value={formData.learning_preference} onValueChange={(value) => handleInputChange('learning_preference', value)}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white focus:border-viverblue">
              <SelectValue placeholder="Selecione sua preferência" />
            </SelectTrigger>
            <SelectContent>
              {learningPreferences.map((pref) => (
                <SelectItem key={pref} value={pref}>
                  {pref}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4 }}
          className="space-y-2"
        >
          <Label className="text-white font-medium">
            Quanto tempo você pode dedicar por semana?
          </Label>
          <Select value={formData.weekly_learning_time} onValueChange={(value) => handleInputChange('weekly_learning_time', value)}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white focus:border-viverblue">
              <SelectValue placeholder="Selecione o tempo" />
            </SelectTrigger>
            <SelectContent>
              {timeCommitments.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      {/* Preferência de comunicação */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="space-y-2"
      >
        <Label className="text-white font-medium text-lg">
          Como prefere receber atualizações?
        </Label>
        <Select value={formData.preferred_communication} onValueChange={(value) => handleInputChange('preferred_communication', value)}>
          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white focus:border-viverblue">
            <SelectValue placeholder="Selecione sua preferência" />
          </SelectTrigger>
          <SelectContent>
            {communicationPreferences.map((pref) => (
              <SelectItem key={pref} value={pref}>
                {pref}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Informações adicionais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="space-y-2"
      >
        <Label htmlFor="additional_info" className="text-white font-medium text-lg">
          Algo mais que devemos saber?
        </Label>
        <Textarea
          id="additional_info"
          placeholder="Compartilhe qualquer informação adicional que possa nos ajudar a personalizar sua experiência..."
          value={formData.additional_info}
          onChange={(e) => handleInputChange('additional_info', e.target.value)}
          className="min-h-[80px] bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-viverblue"
        />
      </motion.div>

      {/* Botão de finalizar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7 }}
        className="flex justify-center pt-6"
      >
        <EnhancedButton
          onClick={handleNext}
          disabled={isLoading}
          loading={isLoading}
          size="lg"
          variant="primary"
          className="px-12 animate-pulse-glow"
        >
          {isLoading ? "Finalizando..." : "🚀 Finalizar Minha Jornada"}
        </EnhancedButton>
      </motion.div>

      {/* Mensagem de finalização */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 rounded-xl p-6 border border-viverblue/20"
      >
        <div className="text-center space-y-2">
          <Award className="w-8 h-8 text-viverblue mx-auto" />
          <h3 className="text-white font-semibold">Parabéns por chegar até aqui! 🎉</h3>
          <p className="text-slate-300 text-sm">
            Você está prestes a começar uma jornada transformadora com IA. 
            Vamos criar uma experiência única baseada no seu perfil!
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};