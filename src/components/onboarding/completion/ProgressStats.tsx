
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Target, Trophy, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const ProgressStats: React.FC = () => {
  const stats = [
    {
      icon: CheckCircle,
      label: 'Perfil Completo',
      value: '100%',
      description: 'Todas as informações coletadas',
      color: 'text-green-400'
    },
    {
      icon: Target,
      label: 'Objetivos Mapeados',
      value: '3',
      description: 'Metas de IA definidas',
      color: 'text-viverblue'
    },
    {
      icon: Trophy,
      label: 'Trilha Criada',
      value: '1',
      description: 'Personalizada para você',
      color: 'text-yellow-400'
    },
    {
      icon: Users,
      label: 'Comunidade',
      value: 'Ativa',
      description: 'Pronto para conectar',
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + index * 0.1 }}
        >
          <Card className="glassmorphism border-gray-700/50 hover:border-viverblue/30 transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800/50 mb-3 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-gray-300 mb-1">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.description}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
