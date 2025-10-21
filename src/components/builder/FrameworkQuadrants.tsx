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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
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
            {/* Título direto no topo */}
            <h3 className="text-2xl font-bold mb-2">
              {quadrant.data?.title || quadrant.title}
            </h3>

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
