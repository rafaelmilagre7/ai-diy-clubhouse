import React, { useRef, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Solution } from '@/lib/supabase';
import { TrendingUp, Settings, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuroraGlassSolutionCardProps {
  solution: Solution;
  onClick: () => void;
}

// Helpers para categoria
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Receita':
      return {
        gradient: 'from-revenue/70 via-revenue/50 to-revenue/30',
        border: 'border-revenue/30',
        glow: 'shadow-[0_0_30px_-5px_hsl(var(--revenue)/0.4)]',
        icon: <TrendingUp className="h-3.5 w-3.5" />,
      };
    case 'Operacional':
      return {
        gradient: 'from-operational/70 via-operational/50 to-operational/30',
        border: 'border-operational/30',
        glow: 'shadow-[0_0_30px_-5px_hsl(var(--operational)/0.4)]',
        icon: <Settings className="h-3.5 w-3.5" />,
      };
    case 'Estratégia':
      return {
        gradient: 'from-strategy/70 via-strategy/50 to-strategy/30',
        border: 'border-strategy/30',
        glow: 'shadow-[0_0_30px_-5px_hsl(var(--strategy)/0.4)]',
        icon: <BarChart className="h-3.5 w-3.5" />,
      };
    default:
      return {
        gradient: 'from-aurora-primary/70 via-aurora-primary/50 to-aurora-primary/30',
        border: 'border-aurora-primary/30',
        glow: 'shadow-[0_0_30px_-5px_hsl(var(--aurora-primary)/0.4)]',
        icon: <TrendingUp className="h-3.5 w-3.5" />,
      };
  }
};

export const AuroraGlassSolutionCard = memo<AuroraGlassSolutionCardProps>(({ solution, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const categoryStyle = getCategoryColor(solution.category);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = -(y / rect.height) * 3;
    const rotateY = (x / rect.width) * 3;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "aurora-glass-solution-card relative overflow-hidden rounded-2xl cursor-pointer",
        "bg-gradient-to-br from-card/90 to-card/60",
        "border backdrop-blur-xl",
        categoryStyle.border,
        isHovered && categoryStyle.glow
      )}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        rotateX: rotation.x,
        rotateY: rotation.y,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{
        opacity: { duration: 0.3 },
        y: { duration: 0.3 },
        rotateX: { type: 'spring', stiffness: 300, damping: 20 },
        rotateY: { type: 'spring', stiffness: 300, damping: 20 },
        scale: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      {/* Glass reflection overlay */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.05) 100%)',
        }}
        animate={{
          opacity: isHovered ? 0.7 : 0.5,
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay z-[5]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Category glow gradient at bottom */}
      <motion.div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-2/3 z-[8]",
          "bg-gradient-to-t blur-3xl",
          categoryStyle.gradient
        )}
        animate={{
          opacity: isHovered ? 0.85 : 0.7,
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Enhanced bottom border glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] z-20"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)`,
        }}
        animate={{
          opacity: isHovered ? 1 : 0.8,
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Cover image with aspect-video (16:9) */}
      <div className="relative aspect-video w-full overflow-hidden">
        {solution.thumbnail_url ? (
          <img
            src={solution.thumbnail_url}
            alt={solution.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
            <div className="text-4xl opacity-30">{categoryStyle.icon}</div>
          </div>
        )}
        
        {/* Gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
      </div>

      {/* Glass panel with content */}
      <motion.div
        className="relative z-30 p-md space-y-sm"
        animate={{
          z: isHovered ? 5 : 2,
        }}
        transition={{ duration: 0.4 }}
      >
        {/* Category badge */}
        <div className="flex items-center gap-sm">
          <Badge 
            variant="secondary" 
            className="text-xs font-medium backdrop-blur-sm bg-background/80"
          >
            <span className="mr-1">{categoryStyle.icon}</span>
            {solution.category}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base text-foreground line-clamp-2 transition-colors">
          {solution.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {solution.description}
        </p>
      </motion.div>

      {/* Corner accents */}
      <motion.div
        className="absolute bottom-0 left-0 w-[1px] h-1/4 z-20 rounded-full"
        style={{
          background: 'linear-gradient(to top, rgba(255, 255, 255, 0.6) 0%, transparent 100%)',
        }}
        animate={{
          opacity: isHovered ? 1 : 0.7,
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[1px] h-1/4 z-20 rounded-full"
        style={{
          background: 'linear-gradient(to top, rgba(255, 255, 255, 0.6) 0%, transparent 100%)',
        }}
        animate={{
          opacity: isHovered ? 1 : 0.7,
        }}
      />
    </motion.div>
  );
});

AuroraGlassSolutionCard.displayName = 'AuroraGlassSolutionCard';
