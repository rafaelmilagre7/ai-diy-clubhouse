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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <LiquidGlassCard 
        className="w-full max-w-md mx-auto overflow-hidden"
        variant="premium"
        hoverable={false}
      >
        {/* Foto grande no topo com gradiente */}
        <div className="relative h-56 bg-gradient-to-br from-aurora/20 via-viverblue/15 to-operational/10">
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          <Avatar className="h-32 w-32 absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-4 border-background shadow-xl">
            <AvatarImage src={card.avatarUrl} alt={card.name} />
            <AvatarFallback className="text-3xl bg-gradient-to-br from-aurora/20 to-viverblue/20 text-aurora font-bold">
              {getInitials(card.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Info centralizada */}
        <div className="pt-20 px-6 pb-6 text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{card.name}</h2>
          <p className="text-base text-muted-foreground">{card.position}</p>
          <p className="text-sm text-muted-foreground font-medium">{card.company}</p>

          {/* Badge de compatibilidade com gradiente */}
          <div className="inline-flex px-4 py-2 rounded-full bg-gradient-to-r from-aurora/10 to-viverblue/10 border border-aurora/30">
            <span className="text-sm font-semibold bg-gradient-to-r from-aurora to-viverblue bg-clip-text text-transparent">
              {Math.round(Math.min(card.score, 1.0) * 100)}% match
            </span>
          </div>

          {/* Copy da IA - mais compacta */}
          <div className="bg-card/30 backdrop-blur-sm rounded-xl p-4 min-h-[100px] flex items-center justify-center">
            {card.isLoading ? (
              <div className="space-y-3 w-full">
                <div className="flex items-center justify-center gap-2 text-aurora">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs font-medium">Analisando conexão...</span>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5 mx-auto" />
                <Skeleton className="h-3 w-3/5 mx-auto" />
              </div>
            ) : (
              <MarkdownRenderer 
                content={card.connectionCopy || ''}
                className="text-sm text-foreground/90 leading-relaxed"
              />
            )}
          </div>

          {/* Botões maiores e mais visíveis */}
          <div className="flex gap-3 pt-4">
            {card.linkedinUrl && (
              <Button
                onClick={handleLinkedInClick}
                variant="outline"
                size="lg"
                className="flex-1 gap-2 border-[#0A66C2]/30 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]"
              >
                <Linkedin className="h-5 w-5" />
                LinkedIn
              </Button>
            )}
            
            <Button
              onClick={onOpenContact}
              size="lg"
              className="flex-1 gap-2 bg-gradient-to-r from-aurora to-viverblue hover:opacity-90 transition-opacity"
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