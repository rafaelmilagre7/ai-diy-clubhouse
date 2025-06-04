
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, RouteIcon, UsersIcon } from 'lucide-react';

interface OnboardingSuccessScreenProps {
  onNavigate?: (path: string) => void;
}

export const OnboardingSuccessScreen: React.FC<OnboardingSuccessScreenProps> = ({ 
  onNavigate 
}) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-2xl mx-auto text-center space-y-8 py-12"
    >
      {/* Ícone de sucesso */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
        className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="text-white text-3xl"
        >
          ✓
        </motion.div>
      </motion.div>

      {/* Mensagem de sucesso */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="space-y-4"
      >
        <h1 className="text-3xl font-bold text-white">
          Onboarding concluído com sucesso!
        </h1>
        <p className="text-xl text-gray-300">
          Escolha o que deseja explorar agora:
        </p>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto"
      >
        {/* Dashboard CTA */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 cursor-pointer"
          onClick={() => handleNavigation('/dashboard')}
        >
          <HomeIcon className="w-8 h-8 text-white mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-2">Dashboard</h3>
          <p className="text-blue-100 text-sm">
            Visualize seu progresso e estatísticas
          </p>
          <Button
            variant="outline"
            className="w-full mt-4 border-white/20 text-white hover:bg-white/10"
            onClick={() => handleNavigation('/dashboard')}
          >
            Ir para Dashboard
          </Button>
        </motion.div>

        {/* Trilha de Implementação CTA */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-br from-viverblue to-viverblue-dark rounded-lg p-6 cursor-pointer"
          onClick={() => handleNavigation('/implementation-trail')}
        >
          <RouteIcon className="w-8 h-8 text-white mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-2">Trilha de Implementação</h3>
          <p className="text-blue-100 text-sm">
            Comece sua jornada de implementação
          </p>
          <Button
            variant="outline"
            className="w-full mt-4 border-white/20 text-white hover:bg-white/10"
            onClick={() => handleNavigation('/implementation-trail')}
          >
            Começar Trilha
          </Button>
        </motion.div>

        {/* Networking CTA */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 cursor-pointer"
          onClick={() => handleNavigation('/networking')}
        >
          <UsersIcon className="w-8 h-8 text-white mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-2">Networking</h3>
          <p className="text-green-100 text-sm">
            Conecte-se com outros profissionais
          </p>
          <Button
            variant="outline"
            className="w-full mt-4 border-white/20 text-white hover:bg-white/10"
            onClick={() => handleNavigation('/networking')}
          >
            Explorar Networking
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
