import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Linkedin, Phone, Loader2, UserPlus, Check, Clock } from 'lucide-react';
import { SwipeCard as SwipeCardType } from '@/hooks/networking/useSwipeCards';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { MarkdownRenderer } from '@/components/community/MarkdownRenderer';
import { useConnections } from '@/hooks/networking/useConnections';
import { useState, useEffect } from 'react';

interface SwipeCardProps {
  card: SwipeCardType;
  onOpenContact: () => void;
}

export const SwipeCard = ({ card, onOpenContact }: SwipeCardProps) => {
  const { sendConnectionRequest, isSendingRequest, useCheckConnectionStatus } = useConnections();
  const { data: connectionStatus } = useCheckConnectionStatus(card.userId);
  const [localStatus, setLocalStatus] = useState<'none' | 'pending' | 'accepted'>('none');

  useEffect(() => {
    if (connectionStatus) {
      setLocalStatus(connectionStatus.status as 'none' | 'pending' | 'accepted');
    }
  }, [connectionStatus]);

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

  const handleAddConnection = async () => {
    if (!card.userId) return;
    try {
      await sendConnectionRequest(card.userId);
      setLocalStatus('pending');
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
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
        <div className="h-[620px] flex flex-col p-8">
          {/* Avatar no topo - sem cortar */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-aurora/20 blur-2xl rounded-full" />
              <Avatar className="relative h-32 w-32 border-4 border-background shadow-2xl ring-2 ring-aurora/20">
                <AvatarImage 
                  src={card.avatarUrl} 
                  alt={card.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-aurora/30 to-viverblue/30 text-aurora font-bold">
                  {getInitials(card.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="text-center space-y-2 mb-6">
            <h2 className="text-2xl font-bold text-foreground">{card.name}</h2>
            <p className="text-base text-muted-foreground">{card.position}</p>
            <p className="text-sm text-foreground font-bold">{card.company}</p>
          </div>

          {/* Copy da IA - altura fixa com scroll */}
          <div className="flex-1 relative liquid-glass-card rounded-2xl p-5 border border-aurora/10 shadow-inner overflow-hidden mb-6">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-aurora/20 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-aurora/20 rounded-br-2xl" />
            
            <div className="h-full overflow-y-auto scrollbar-thin">
              {card.isLoading ? (
                <div className="space-y-3 w-full flex flex-col items-center justify-center h-full">
                  <div className="flex items-center justify-center gap-2">
                    <div className="inline-flex p-2 rounded-lg bg-aurora/10">
                      <Loader2 className="h-4 w-4 animate-spin text-aurora" />
                    </div>
                    <span className="text-sm font-medium text-aurora">Analisando conexão...</span>
                  </div>
                  <div className="space-y-2 w-full">
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
          </div>

          {/* Botões com cores corretas */}
          <div className="flex gap-3">
            {/* Botão Adicionar Conexão */}
            <Button
              onClick={handleAddConnection}
              disabled={localStatus !== 'none' || isSendingRequest}
              size="lg"
              className={`flex-1 gap-2 transition-all duration-300 hover:scale-105 border-0 ${
                localStatus === 'accepted'
                  ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-green-500/30'
                  : localStatus === 'pending'
                  ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white shadow-lg shadow-yellow-500/20 cursor-not-allowed'
                  : 'bg-gradient-to-r from-aurora via-viverblue to-operational hover:from-aurora/80 hover:via-viverblue/80 hover:to-operational/80 text-white shadow-lg shadow-aurora/30'
              }`}
            >
              {localStatus === 'accepted' ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  >
                    <Check className="h-5 w-5" />
                  </motion.div>
                  Conectado ✓
                </>
              ) : localStatus === 'pending' ? (
                <>
                  <Clock className="h-5 w-5 animate-pulse" />
                  Solicitação Enviada
                </>
              ) : isSendingRequest ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Adicionar Conexão
                </>
              )}
            </Button>

            {card.linkedinUrl && (
              <Button
                onClick={handleLinkedInClick}
                size="lg"
                className="flex-1 gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white border-0 transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#0A66C2]/30"
              >
                <Linkedin className="h-5 w-5" />
                LinkedIn
              </Button>
            )}
            
            <Button
              onClick={onOpenContact}
              size="lg"
              className="flex-1 gap-2 bg-gradient-to-r from-[#0ABAB5] via-[#088A87] to-[#065F5D] hover:from-[#088A87] hover:via-[#065F5D] hover:to-[#044D4B] hover:shadow-lg hover:shadow-aurora/30 transition-all hover:scale-105 text-white font-semibold border-0"
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