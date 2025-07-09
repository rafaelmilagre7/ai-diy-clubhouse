import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Lightbulb, Users, BookOpen } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { EnhancedButton } from '../components/EnhancedButton';

interface OnboardingStep3Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

export const OnboardingStep3: React.FC<OnboardingStep3Props> = ({
  data,
  onNext,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    how_found_us: data.discovery_info?.how_found_us || '',
    expectations: data.discovery_info?.expectations || '',
    main_challenges: data.discovery_info?.main_challenges || '',
    preferred_content: data.discovery_info?.preferred_content || [],
    ...data.discovery_info
  });

  const discoveryOptions = [
    { id: 'google', label: 'Pesquisa no Google', icon: Search },
    { id: 'social_media', label: 'Redes Sociais', icon: Users },
    { id: 'referral', label: 'Indicação de amigo/colega', icon: Users },
    { id: 'content', label: 'Conteúdo/Blog', icon: BookOpen },
    { id: 'event', label: 'Evento/Webinar', icon: Lightbulb },
    { id: 'other', label: 'Outro', icon: Lightbulb }
  ];

  const contentTypes = [
    'Tutoriais práticos',
    'Cases de sucesso',
    'Tendências de IA',
    'Ferramentas e reviews',
    'Estratégias de negócio',
    'Implementações técnicas'
  ];

  const handleDiscoveryChange = (option: string) => {
    setFormData(prev => ({
      ...prev,
      how_found_us: option
    }));
  };

  const handleContentToggle = (content: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_content: prev.preferred_content.includes(content)
        ? prev.preferred_content.filter((c: string) => c !== content)
        : [...prev.preferred_content, content]
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
          <Search className="w-8 h-8 text-white" />
        </motion.div>
        
        <h2 className="text-3xl font-bold text-white">
          Como você nos descobriu?
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
          Entender como você chegou até nós nos ajuda a melhorar nossa comunicação 
          e criar conteúdos mais relevantes para profissionais como você.
        </p>
      </div>

      {/* Como nos encontrou */}
      <div className="space-y-4">
        <Label className="text-white font-medium text-lg">
          Como você nos encontrou?
        </Label>
        <div className="grid md:grid-cols-2 gap-3">
          {discoveryOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Button
                type="button"
                variant={formData.how_found_us === option.id ? "default" : "outline"}
                className={`w-full justify-start h-auto p-4 ${
                  formData.how_found_us === option.id
                    ? "bg-viverblue hover:bg-viverblue/90 text-white"
                    : "bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
                }`}
                onClick={() => handleDiscoveryChange(option.id)}
              >
                <option.icon className="w-5 h-5 mr-3" />
                {option.label}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Expectativas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-4"
      >
        <Label htmlFor="expectations" className="text-white font-medium text-lg">
          O que você espera aprender conosco?
        </Label>
        <Textarea
          id="expectations"
          placeholder="Conte-nos suas expectativas e objetivos..."
          value={formData.expectations}
          onChange={(e) => setFormData(prev => ({ ...prev, expectations: e.target.value }))}
          className="min-h-[100px] bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-viverblue"
        />
      </motion.div>

      {/* Tipo de conteúdo preferido */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="space-y-4"
      >
        <Label className="text-white font-medium text-lg">
          Que tipo de conteúdo mais te interessa?
        </Label>
        <div className="grid md:grid-cols-2 gap-3">
          {contentTypes.map((content, index) => (
            <motion.div
              key={content}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + index * 0.05 }}
            >
              <Button
                type="button"
                variant={formData.preferred_content.includes(content) ? "default" : "outline"}
                className={`w-full h-auto p-3 ${
                  formData.preferred_content.includes(content)
                    ? "bg-viverblue hover:bg-viverblue/90 text-white"
                    : "bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
                }`}
                onClick={() => handleContentToggle(content)}
              >
                {content}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Botão de continuar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="flex justify-center pt-6"
      >
        <EnhancedButton
          onClick={handleNext}
          disabled={isLoading}
          loading={isLoading}
          size="lg"
          className="px-12"
        >
          {isLoading ? "Salvando..." : "Continuar Explorando →"}
        </EnhancedButton>
      </motion.div>
    </motion.div>
  );
};