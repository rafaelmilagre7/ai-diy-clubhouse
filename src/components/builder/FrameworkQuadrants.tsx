import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Database, Monitor } from 'lucide-react';

interface FrameworkQuadrantsProps {
  framework: {
    quadrant1_data?: any;
    quadrant2_ai?: any;
    quadrant3_automation?: any;
    quadrant4_interface?: any;
  };
}

export const FrameworkQuadrants: React.FC<FrameworkQuadrantsProps> = ({ framework }) => {
  const quadrants = [
    {
      key: 'quadrant1_data',
      data: framework?.quadrant1_data,
      title: '📊 Dados Simples',
      icon: Database,
      color: 'from-status-info/20 to-status-info/10',
      borderColor: 'border-status-info/30',
      iconBg: 'bg-status-info/10',
      iconColor: 'text-status-info',
      position: 'top-left'
    },
    {
      key: 'quadrant2_ai',
      data: framework?.quadrant2_ai,
      title: '🧠 Modelos de IA',
      icon: Brain,
      color: 'from-aurora/20 to-aurora-light/10',
      borderColor: 'border-aurora/30',
      iconBg: 'bg-aurora/10',
      iconColor: 'text-aurora',
      position: 'top-right'
    },
    {
      key: 'quadrant3_automation',
      data: framework?.quadrant3_automation,
      title: '🤖 Automação No-Code',
      icon: Zap,
      color: 'from-status-warning/20 to-status-warning/10',
      borderColor: 'border-status-warning/30',
      iconBg: 'bg-status-warning/10',
      iconColor: 'text-status-warning',
      position: 'bottom-left'
    },
    {
      key: 'quadrant4_interface',
      data: framework?.quadrant4_interface,
      title: '🎨 Canais de Contato',
      icon: Monitor,
      color: 'from-operational/20 to-operational/10',
      borderColor: 'border-operational/30',
      iconBg: 'bg-operational/10',
      iconColor: 'text-operational',
      position: 'bottom-right'
    }
  ];

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Linha vertical central */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-aurora/50 via-aurora to-aurora/50 hidden lg:block -translate-x-1/2" />
      
      {/* Linha horizontal central */}
      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-aurora/50 via-aurora to-aurora/50 hidden lg:block -translate-y-1/2" />
      
      {/* Círculo central onde as linhas se cruzam */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-aurora border-4 border-background z-20 hidden lg:block shadow-lg shadow-aurora/50" />
      
      {quadrants.map((quadrant, index) => {
        const Icon = quadrant.icon;
        
        return (
          <motion.div
            key={quadrant.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`
              group relative p-6 rounded-xl border border-border/30
              bg-gradient-to-br ${quadrant.color}
              backdrop-blur-sm
              hover:scale-[1.02] hover:border-aurora/40 hover:shadow-aurora
              transition-all duration-slow
            `}
          >
            {/* Ícone + Título */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl ${quadrant.iconBg} border ${quadrant.borderColor} group-hover:scale-110 transition-transform duration-slow`}>
                <Icon className={`w-7 h-7 ${quadrant.iconColor}`} />
              </div>
              <h3 className="text-2xl font-bold group-hover:text-aurora transition-colors duration-slow">
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
              <ul className="space-y-3 mb-6">
                {quadrant.data.items.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 leading-relaxed group/item">
                    <span className="text-aurora mt-0.5 flex-shrink-0 group-hover/item:translate-x-1 transition-transform duration-base">→</span>
                    <span className="text-base text-foreground/80 break-words group-hover/item:text-foreground transition-colors duration-base">{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Ferramentas na base */}
            {quadrant.data?.tool_names && quadrant.data.tool_names.length > 0 && (
              <div className="pt-4 border-t border-border/30">
                <div className="flex flex-wrap gap-2">
                  {quadrant.data.tool_names.map((tool: string, idx: number) => (
                    <span 
                      key={idx}
                      className="px-3 py-1.5 text-xs bg-background/60 rounded-full border border-border/30 hover:border-aurora/40 hover:bg-aurora/10 transition-all duration-base"
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
