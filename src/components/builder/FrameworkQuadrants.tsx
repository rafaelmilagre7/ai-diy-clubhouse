import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Cog, Database, Monitor } from 'lucide-react';

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
      icon: Cog,
      color: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/30',
      position: 'top-left'
    },
    {
      key: 'quadrant2_ai',
      data: framework?.quadrant2_ai,
      title: 'IA',
      icon: Bot,
      color: 'from-blue-500/20 to-purple-500/20',
      borderColor: 'border-blue-500/30',
      position: 'top-right'
    },
    {
      key: 'quadrant3_data',
      data: framework?.quadrant3_data,
      title: 'Dados e Contexto',
      icon: Database,
      color: 'from-indigo-500/20 to-blue-700/20',
      borderColor: 'border-indigo-500/30',
      position: 'bottom-left'
    },
    {
      key: 'quadrant4_interface',
      data: framework?.quadrant4_interface,
      title: 'Interface',
      icon: Monitor,
      color: 'from-slate-500/20 to-gray-600/20',
      borderColor: 'border-slate-500/30',
      position: 'bottom-right'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
      {/* Centro com círculos conectados */}
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <motion.div
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center bg-background/95 backdrop-blur"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60" />
        </motion.div>
      </div>

      {quadrants.map((quadrant, index) => {
        const Icon = quadrant.icon;
        
        return (
          <motion.div
            key={quadrant.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`
              relative p-6 rounded-xl border-2 ${quadrant.borderColor}
              bg-gradient-to-br ${quadrant.color}
              backdrop-blur-sm
              hover:scale-105 transition-transform
            `}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-background/50 flex items-center justify-center">
                <Icon className="h-6 w-6 text-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-xl">{quadrant.data?.title || quadrant.title}</h4>
                {quadrant.data?.description && (
                  <p className="text-sm text-muted-foreground opacity-90">{quadrant.data.description}</p>
                )}
              </div>
            </div>

            {/* Items */}
            {quadrant.data?.items && quadrant.data.items.length > 0 && (
              <ul className="space-y-3 mb-4">
                {quadrant.data.items.map((item: string, idx: number) => (
                  <li key={idx} className="text-base flex items-start gap-2 leading-relaxed">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Ferramentas */}
            {quadrant.data?.tool_names && quadrant.data.tool_names.length > 0 && (
              <div className="pt-3 border-t border-border/30">
                <p className="text-xs text-muted-foreground mb-2">Ferramentas:</p>
                <div className="flex flex-wrap gap-1">
                  {quadrant.data.tool_names.map((tool: string, idx: number) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 text-xs bg-background/70 rounded-md border border-border/30"
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
