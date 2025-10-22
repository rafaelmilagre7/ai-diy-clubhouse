import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Database, Palette } from 'lucide-react';

interface FrameworkQuadrantsProps {
  framework: {
    quadrant1_automation?: any;
    quadrant2_ai?: any;
    quadrant3_data?: any;
    quadrant4_interface?: any;
  };
}

export const FrameworkQuadrants: React.FC<FrameworkQuadrantsProps> = ({ framework }) => {
  const quadrants = [
    {
      key: 'quadrant1_automation',
      data: framework?.quadrant1_automation,
      title: 'Automação',
      icon: Zap,
      color: 'from-cyan-500/20 to-teal-400/10',
      borderColor: 'border-cyan-400/30',
      position: 'top-left'
    },
    {
      key: 'quadrant2_ai',
      data: framework?.quadrant2_ai,
      title: 'IA',
      icon: Brain,
      color: 'from-teal-500/20 to-cyan-400/10',
      borderColor: 'border-teal-400/30',
      position: 'top-right'
    },
    {
      key: 'quadrant3_data',
      data: framework?.quadrant3_data,
      title: 'Dados e Contexto',
      icon: Database,
      color: 'from-emerald-500/20 to-teal-400/10',
      borderColor: 'border-emerald-400/30',
      position: 'bottom-left'
    },
    {
      key: 'quadrant4_interface',
      data: framework?.quadrant4_interface,
      title: 'Interface',
      icon: Palette,
      color: 'from-teal-400/20 to-cyan-500/10',
      borderColor: 'border-teal-300/30',
      position: 'bottom-right'
    }
  ];

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Linha vertical central */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/50 via-primary to-primary/50 hidden lg:block -translate-x-1/2" />
      
      {/* Linha horizontal central */}
      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/50 via-primary to-primary/50 hidden lg:block -translate-y-1/2" />
      
      {/* Círculo central onde as linhas se cruzam */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background z-20 hidden lg:block" />
      
      {quadrants.map((quadrant, index) => {
        const Icon = quadrant.icon;
        
        return (
          <motion.div
            key={quadrant.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`
              relative p-6 rounded-xl border border-border/30
              bg-gradient-to-br ${quadrant.color}
              backdrop-blur-sm
              hover:scale-[1.02] transition-all
            `}
          >
            {/* Ícone + Título */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-lg bg-gradient-to-br ${quadrant.color} border ${quadrant.borderColor}`}>
                <Icon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold">
                {quadrant.data?.title || quadrant.title}
              </h3>
            </div>

            {/* Descrição opcional */}
            {quadrant.data?.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {quadrant.data.description}
              </p>
            )}

            {/* Items com bullets elegantes */}
            {quadrant.data?.items && quadrant.data.items.length > 0 && (
              <ul className="space-y-4 mb-6">
                {quadrant.data.items.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 leading-relaxed">
                    <span className="text-primary mt-0.5 flex-shrink-0">→</span>
                    <span className="text-base text-foreground/80 break-words">{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Ferramentas na base */}
            {quadrant.data?.tool_names && quadrant.data.tool_names.length > 0 && (
              <div className="pt-4 border-t border-border/20">
                <div className="flex flex-wrap gap-2">
                  {quadrant.data.tool_names.map((tool: string, idx: number) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 text-xs bg-background/50 rounded-full border border-border/20"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
