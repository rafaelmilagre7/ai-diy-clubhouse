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
      title: 'Sou empresário ou gestor',
      description: 'Quero aplicar IA no meu negócio para aumentar produtividade, reduzir custos e melhorar resultados',
      icon: Building2,
      gradient: 'from-blue-500 to-cyan-500',
      features: [
        'Soluções para empresas',
        'ROI e métricas de negócio',
        'Automação de processos',
        'Crescimento e escalabilidade'
      ]
    },
    {
      id: 'learner' as UserType,
      title: 'Quero aprender e implementar IA',
      description: 'Busco desenvolver habilidades em IA para crescer profissionalmente ou mudar de carreira',
      icon: GraduationCap,
      gradient: 'from-violet-500 to-purple-500',
      features: [
        'Conteúdo educacional',
        'Projetos práticos',
        'Certificações',
        'Desenvolvimento de carreira'
      ]
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent mb-4 shadow-2xl shadow-primary/25"
        >
          <Briefcase className="w-10 h-10 text-primary-foreground" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-foreground"
        >
          Vamos personalizar sua experiência
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Para oferecer a melhor experiência, precisamos entender seu objetivo principal com IA
        </motion.p>
      </div>

      {/* User Type Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {userTypes.map((type, index) => {
          const Icon = type.icon;
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
                <CardContent className="p-8">
                  {/* Header */}
                  <div className="flex items-start space-x-4 mb-6">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {type.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
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
                      className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
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
                    <h4 className="text-sm font-medium text-foreground/80 mb-3">
                      O que você encontrará:
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
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
                          <span className="text-sm text-muted-foreground">
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
        className="flex justify-center"
      >
        <Button
          onClick={handleContinue}
          disabled={!selectedType || isLoading}
          size="lg"
          className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-2xl"
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