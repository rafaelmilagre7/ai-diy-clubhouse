import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Linkedin, Phone, Loader2 } from 'lucide-react';
import { SwipeCard as SwipeCardType } from '@/hooks/networking/useSwipeCards';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { MarkdownRenderer } from '@/components/community/MarkdownRenderer';

interface SwipeCardProps {
  card: SwipeCardType;
  onOpenContact: () => void;
}

export const SwipeCard = ({ card, onOpenContact }: SwipeCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLinkedInClick = () => {
    if (card.linkedinUrl) {
      window.open(card.linkedinUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ 
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      <LiquidGlassCard 
        className="w-full max-w-md mx-auto overflow-hidden shadow-2xl shadow-aurora/10 hover:shadow-3xl hover:shadow-aurora/20 transition-shadow duration-500"
        variant="premium"
        hoverable={false}
      >
        {/* Foto grande no topo com gradiente aurora aprimorado */}
        <div className="relative h-56 overflow-hidden">
          {/* Aurora gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-aurora/20 via-viverblue/15 to-operational/10" />
          
          {/* Animated blobs */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-40 h-40 bg-aurora/30 rounded-full blur-3xl animate-blob" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-viverblue/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
          {/* Avatar com efeito glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <div className="absolute inset-0 bg-aurora/20 blur-2xl rounded-full" />
            <Avatar className="relative h-32 w-32 border-4 border-background shadow-2xl ring-2 ring-aurora/20">
              <AvatarImage src={card.avatarUrl} alt={card.name} />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-aurora/30 to-viverblue/30 text-aurora font-bold">
                {getInitials(card.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Info centralizada */}
        <div className="pt-20 px-6 pb-6 text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{card.name}</h2>
          <p className="text-base text-muted-foreground">{card.position}</p>
          <p className="text-sm text-muted-foreground font-medium">{card.company}</p>

          {/* Badge de compatibilidade com gradiente e glow */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-aurora/10 via-viverblue/10 to-operational/10 border border-aurora/30 shadow-lg shadow-aurora/10 backdrop-blur-sm">
            <div className="h-2 w-2 rounded-full bg-aurora animate-pulse" />
            <span className="text-sm font-bold bg-gradient-to-r from-aurora via-viverblue to-operational bg-clip-text text-transparent">
              {Math.round(Math.min(card.score, 1.0) * 100)}% compatibilidade
            </span>
          </div>

          {/* Copy da IA - mais sofisticada com glassmorphism */}
          <div className="relative liquid-glass-card rounded-2xl p-5 min-h-[120px] flex items-center justify-center border border-aurora/10 shadow-inner">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-aurora/20 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-aurora/20 rounded-br-2xl" />
            
            {card.isLoading ? (
              <div className="space-y-3 w-full">
                <div className="flex items-center justify-center gap-2">
                  <div className="inline-flex p-2 rounded-lg bg-aurora/10">
                    <Loader2 className="h-4 w-4 animate-spin text-aurora" />
                  </div>
                  <span className="text-sm font-medium text-aurora">Analisando conexão...</span>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full bg-muted/50" />
                  <Skeleton className="h-3 w-4/5 mx-auto bg-muted/50" />
                  <Skeleton className="h-3 w-3/5 mx-auto bg-muted/50" />
                </div>
              </div>
            ) : (
              <MarkdownRenderer 
                content={card.connectionCopy || ''}
                className="text-sm text-foreground leading-relaxed"
              />
            )}
          </div>

          {/* Botões sofisticados com efeitos */}
          <div className="flex gap-3 pt-4">
            {card.linkedinUrl && (
              <Button
                onClick={handleLinkedInClick}
                variant="outline"
                size="lg"
                className="flex-1 gap-2 border-[#0A66C2]/30 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#0A66C2]/20"
              >
                <Linkedin className="h-5 w-5" />
                LinkedIn
              </Button>
            )}
            
            <Button
              onClick={onOpenContact}
              size="lg"
              className="flex-1 gap-2 bg-gradient-to-r from-aurora via-viverblue to-operational hover:shadow-lg hover:shadow-aurora/30 transition-all hover:scale-105 text-white font-semibold"
            >
              <Phone className="h-5 w-5" />
              Conectar
            </Button>
          </div>
        </div>
      </LiquidGlassCard>
    </motion.div>
  );
};