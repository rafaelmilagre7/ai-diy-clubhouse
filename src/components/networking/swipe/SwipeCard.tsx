import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Linkedin, Phone, Loader2, UserPlus, Check, Clock, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { SwipeCard as SwipeCardType } from '@/hooks/networking/useSwipeCards';
import { motion } from 'framer-motion';
import { useConnections } from '@/hooks/networking/useConnections';
import { useState, useEffect } from 'react';
import { SwipeCardCarousel } from './SwipeCardCarousel';

interface SwipeCardProps {
  card: SwipeCardType;
  onOpenContact: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export const SwipeCard = ({ 
  card, 
  onOpenContact,
  onNext,
  onPrevious,
  hasNext = true,
  hasPrevious = true
}: SwipeCardProps) => {
  const { sendConnectionRequest, isSendingRequest, useCheckConnectionStatus } = useConnections();
  const { data: connectionStatus } = useCheckConnectionStatus(card.userId);
  const [localStatus, setLocalStatus] = useState<'none' | 'pending' | 'accepted'>('none');

  // Resetar status local quando trocar de card
  useEffect(() => {
    setLocalStatus('none');
  }, [card.userId]);

  // Atualizar status com base na conexão existente
  useEffect(() => {
    if (connectionStatus) {
      setLocalStatus(connectionStatus.status as 'none' | 'pending' | 'accepted');
    } else {
      // Sem connectionStatus = sem conexão existente
      setLocalStatus('none');
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
        className="w-full max-w-xl mx-auto overflow-hidden shadow-2xl shadow-aurora/10 hover:shadow-3xl hover:shadow-aurora/20 transition-shadow duration-500"
        variant="premium"
        hoverable={false}
      >
        <div className="min-h-[720px] flex flex-col p-5">
          {/* Header Compacto: Avatar + Info + Score */}
          <div className="flex items-start gap-3 mb-4 flex-shrink-0">
            <Avatar className="h-24 w-24 border-2 border-aurora/30 shadow-lg">
              <AvatarImage 
                src={card.avatarUrl} 
                alt={card.name}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-aurora-primary to-aurora-primary-light text-white">
                {getInitials(card.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground truncate">
                {card.name}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                {card.position}
              </p>
              <p className="text-base font-bold text-aurora truncate">
                @ {card.company}
              </p>
            </div>

            {/* Badge de Score Aurora Style */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-aurora-primary/10 to-aurora-primary/5 border-2 border-aurora-primary/40 shadow-lg shadow-aurora-primary/20 flex-shrink-0">
              <Trophy className="h-4 w-4 text-aurora-primary" />
              <span className="text-sm font-bold text-aurora-primary">{Math.round(card.score || 50)}%</span>
            </div>
          </div>

          {/* Card Carrossel com dados parametrizados */}
          <div className="flex-1 min-h-0 relative liquid-glass-card rounded-2xl p-5 border border-aurora/10 shadow-inner mb-12">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-aurora/20 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-aurora/20 rounded-br-2xl" />
            
            <SwipeCardCarousel card={card} />
          </div>

          {/* Status Banner Aurora Style - Se conectado */}
          {localStatus === 'accepted' && (
            <div className="bg-gradient-to-r from-aurora-primary/10 to-aurora-primary/5 border-2 border-aurora-primary/40 shadow-md rounded-lg p-2.5 mb-3 text-center text-sm flex-shrink-0">
              <Check className="inline h-4 w-4 mr-1.5 text-aurora-primary" />
              <span className="text-aurora-primary font-semibold">Vocês já estão conectados</span>
            </div>
          )}

          {/* Action Buttons - VIA AURORA STYLE */}
          <div className="space-y-3 flex-shrink-0">
            {/* CTA PRINCIPAL - Aurora Gradient */}
            <Button
              onClick={onOpenContact}
              size="lg"
              variant="aurora-primary"
              className="relative w-full shadow-xl shadow-aurora-primary/30 hover:shadow-2xl hover:shadow-aurora-primary/40 transition-all duration-300 font-bold text-base hover:scale-[1.02] overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Phone className="h-5 w-5 mr-2 relative z-10" />
              <span className="relative z-10">CONECTAR AGORA</span>
            </Button>

            {/* AÇÕES SECUNDÁRIAS - Aurora Style */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddConnection}
                disabled={localStatus !== 'none' || isSendingRequest}
                size="lg"
                variant={localStatus === 'accepted' ? 'default' : 'outline'}
                className={`flex-1 relative overflow-hidden group transition-all duration-300 font-bold text-base ${
                  localStatus === 'accepted'
                    ? 'bg-aurora-primary hover:bg-aurora-primary/90 text-white border-0 shadow-lg shadow-aurora-primary/40 hover:shadow-xl hover:shadow-aurora-primary/50 hover:scale-[1.02]'
                    : localStatus === 'pending'
                    ? 'bg-card/80 border-2 border-warning/60 text-foreground shadow-md cursor-not-allowed hover:scale-100'
                    : 'bg-card/80 hover:bg-card border-2 border-aurora-primary/50 text-foreground hover:border-aurora-primary shadow-md hover:shadow-lg hover:shadow-aurora-primary/20 hover:scale-[1.02]'
                }`}
              >
                {localStatus === 'accepted' ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    <span>Conectado</span>
                  </>
                ) : localStatus === 'pending' ? (
                  <>
                    <Clock className="h-5 w-5 mr-2 text-warning" />
                    <span>Solicitação Enviada</span>
                  </>
                ) : isSendingRequest ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin text-aurora-primary" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2 text-aurora-primary" />
                    <span>Adicionar à Rede</span>
                  </>
                )}
              </Button>

              {card.linkedinUrl && (
                <Button
                  onClick={handleLinkedInClick}
                  size="lg"
                  className="relative overflow-hidden group bg-social-linkedin-alt hover:bg-social-linkedin-alt-hover text-white border-0 shadow-lg shadow-social-linkedin-alt/30 hover:shadow-xl hover:shadow-social-linkedin-alt/40 transition-all duration-300 font-bold hover:scale-[1.02] px-6"
                  title="Ver perfil no LinkedIn"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Linkedin className="h-5 w-5 relative z-10" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </LiquidGlassCard>
    </motion.div>
  );
};