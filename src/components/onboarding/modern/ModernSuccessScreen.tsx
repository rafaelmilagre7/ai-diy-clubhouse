
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Route, Users, Sparkles, ArrowRight } from 'lucide-react';

interface ModernSuccessScreenProps {
  onNavigate: (path: string) => void;
}

export const ModernSuccessScreen: React.FC<ModernSuccessScreenProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl w-full"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle className="h-14 w-14 text-white" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="h-8 w-8 text-yellow-300" />
            </motion.div>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Configuração Concluída
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Sua jornada de implementação com IA está pronta para começar. 
            Escolha como deseja continuar sua experiência na plataforma.
          </p>
        </motion.div>

        {/* CTAs Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {/* Dashboard CTA */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="group cursor-pointer"
            onClick={() => onNavigate('/dashboard')}
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 h-full transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:shadow-2xl">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                  <Home className="h-8 w-8 text-blue-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">Dashboard</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Acesse o painel principal e visualize seu progresso, estatísticas e próximos passos
                </p>
                <Button
                  onClick={() => onNavigate('/dashboard')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 mt-4 group-hover:shadow-lg transition-all"
                >
                  Ir para Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Implementation Trail CTA */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="group cursor-pointer"
            onClick={() => onNavigate('/implementation-trail')}
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 h-full transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:shadow-2xl">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500/30 transition-colors">
                  <Route className="h-8 w-8 text-emerald-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">Trilha de Implementação</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Comece sua jornada personalizada com soluções de IA específicas para seu negócio
                </p>
                <Button
                  onClick={() => onNavigate('/implementation-trail')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 mt-4 group-hover:shadow-lg transition-all"
                >
                  Começar Trilha
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Networking CTA */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="group cursor-pointer"
            onClick={() => onNavigate('/networking')}
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 h-full transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:shadow-2xl">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                  <Users className="h-8 w-8 text-purple-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">Networking com IA</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Conecte-se com outros profissionais e expanda sua rede de contatos estratégicos
                </p>
                <Button
                  onClick={() => onNavigate('/networking')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0 mt-4 group-hover:shadow-lg transition-all"
                >
                  Explorar Networking
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 text-sm">
            Você pode acessar todas essas funcionalidades a qualquer momento através do menu lateral
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
