import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, GraduationCap, ArrowRight, Briefcase, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export type UserType = 'entrepreneur' | 'learner';

interface Step0UserTypeProps {
  onUserTypeSelect: (type: UserType) => void;
  isLoading?: boolean;
}

export const Step0UserType: React.FC<Step0UserTypeProps> = ({
  onUserTypeSelect,
  isLoading = false
}) => {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);

  const handleSelect = (type: UserType) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType) {
      onUserTypeSelect(selectedType);
    }
  };

  const userTypes = [
    {
      id: 'entrepreneur' as UserType,
      title: 'EMPRESÁRIO/GESTOR',
      description: 'Meu foco é na parte de negócios e estratégia com IA',
      gradient: 'from-emerald-500 to-teal-500',
      features: [
        'Soluções para empresas',
        'ROI e métricas de negócio',  
        'Automação de processos',
        'Crescimento e escalabilidade'
      ]
    },
    {
      id: 'learner' as UserType,
      title: 'HANDS ON, APRENDER E IMPLEMENTAR',
      description: 'Foco em mão na massa, aprender e implementar soluções de IA',
      gradient: 'from-blue-500 to-indigo-500',
      features: [
        'Conteúdo educacional',
        'Projetos práticos',
        'Certificações', 
        'Desenvolvimento de carreira'
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-3 shadow-2xl shadow-primary/25"
        >
          <Briefcase className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold text-foreground"
        >
          Vamos personalizar sua experiência
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Para oferecer a melhor experiência, precisamos entender seu objetivo principal com IA
        </motion.p>
      </div>

      {/* User Type Cards */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {userTypes.map((type, index) => {
          const isSelected = selectedType === type.id;
          
          return (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (index * 0.1), duration: 0.5 }}
            >
              <Card
                className={`relative cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  isSelected
                    ? 'ring-2 ring-primary shadow-2xl shadow-primary/20 bg-primary/5'
                    : 'hover:shadow-xl hover:shadow-black/10'
                }`}
                onClick={() => handleSelect(type.id)}
              >
                <CardContent className="p-6 sm:p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className={`inline-block w-3 h-3 rounded-full bg-gradient-to-r ${type.gradient} mb-3`} />
                      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                        {type.title}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {type.description}
                      </p>
                    </div>

                    {/* Selection Indicator */}
                    <motion.div
                      animate={{
                        scale: isSelected ? 1 : 0,
                        opacity: isSelected ? 1 : 0
                      }}
                      transition={{ duration: 0.2 }}
                      className="w-6 h-6 rounded-full bg-primary flex items-center justify-center ml-4"
                    >
                      <motion.div
                        animate={{ scale: isSelected ? 1 : 0 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        className="w-2 h-2 rounded-full bg-primary-foreground"
                      />
                    </motion.div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-foreground/80 mb-3">
                      O que você encontrará:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {type.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            delay: 0.6 + (index * 0.1) + (featureIndex * 0.05), 
                            duration: 0.3 
                          }}
                          className="flex items-center space-x-2"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${type.gradient}`} />
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {feature}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <motion.div
                    animate={{
                      opacity: isSelected ? 1 : 0,
                      y: isSelected ? 0 : 10
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg pointer-events-none"
                  />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="flex justify-center pt-4"
      >
        <Button
          onClick={handleContinue}
          disabled={!selectedType || isLoading}
          size="lg"
          className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2 sm:py-3 rounded-2xl"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
              />
              Salvando...
            </>
          ) : (
            <>
              Continuar
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};