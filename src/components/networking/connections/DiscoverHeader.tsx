import { Compass, Sparkles, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DiscoverHeaderProps {
  totalMembers: number;
  isLoading?: boolean;
}

/**
 * ✅ UPGRADE VISUAL: Header premium para aba Descobrir
 * - Design moderno com gradiente
 * - Animações suaves
 * - Contador de membros disponíveis
 */
export const DiscoverHeader = ({ totalMembers, isLoading }: DiscoverHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-aurora/10 via-aurora-primary/5 to-operational/10",
        "border border-aurora/20",
        "p-6 md:p-8"
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-aurora rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-operational rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Conteúdo Principal */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-aurora to-aurora-primary shadow-lg"
            >
              <Compass className="w-7 h-7 text-white" />
            </motion.div>
            
            <div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Descobrir Pessoas
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Expanda sua rede profissional
              </p>
            </div>
          </div>

          <p className="text-text-muted max-w-2xl leading-relaxed">
            Conecte-se com membros da comunidade que compartilham seus interesses,
            objetivos e podem agregar valor à sua jornada profissional
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-4">
          {/* Membros Disponíveis */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "flex flex-col items-center justify-center",
              "min-w-[120px] px-6 py-4 rounded-xl",
              "bg-background/60 backdrop-blur-sm border border-aurora/30",
              "shadow-sm"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-aurora" />
              <Sparkles className="w-4 h-4 text-aurora-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              {isLoading ? '...' : totalMembers}
            </div>
            <div className="text-xs text-muted-foreground text-center mt-1">
              Membros Disponíveis
            </div>
          </motion.div>

          {/* Growth Badge */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={cn(
              "hidden lg:flex flex-col items-center justify-center",
              "min-w-[120px] px-6 py-4 rounded-xl",
              "bg-operational/10 backdrop-blur-sm border border-operational/30",
              "shadow-sm"
            )}
          >
            <TrendingUp className="w-5 h-5 text-operational mb-2" />
            <div className="text-2xl font-bold text-operational">
              +12%
            </div>
            <div className="text-xs text-muted-foreground text-center mt-1">
              Novos Esta Semana
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
