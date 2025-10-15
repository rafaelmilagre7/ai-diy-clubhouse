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
            <Avatar className="h-16 w-16 border-2 border-aurora/30 shadow-lg">
              <AvatarImage 
                src={card.avatarUrl} 
                alt={card.name}
                className="object-cover"
              />
              <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-viverblue to-aurora text-white">
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
              <p className="text-sm text-aurora truncate">
                @ {card.company}
              </p>
            </div>

            {/* Badge de Score Aurora Style */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-aurora/10 to-viverblue/10 border-2 border-aurora/40 shadow-lg shadow-aurora/20 flex-shrink-0">
              <Trophy className="h-4 w-4 text-aurora" />
              <span className="text-sm font-bold text-aurora">{Math.round(card.score || 50)}%</span>
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
            <div className="bg-gradient-to-r from-aurora/10 to-viverblue/10 border-2 border-aurora/40 shadow-md rounded-lg p-2.5 mb-3 text-center text-sm flex-shrink-0">
              <Check className="inline h-4 w-4 mr-1.5 text-aurora" />
              <span className="text-aurora font-semibold">Vocês já estão conectados</span>
            </div>
          )}

          {/* Action Buttons - VIA AURORA STYLE */}
          <div className="space-y-3 flex-shrink-0">
            {/* CTA PRINCIPAL - Aurora Gradient */}
            <Button
              onClick={onOpenContact}
              size="lg"
              className="relative w-full bg-gradient-to-r from-aurora via-viverblue to-operational hover:from-aurora/90 hover:via-viverblue/90 hover:to-operational/90 text-white shadow-xl shadow-aurora/30 hover:shadow-2xl hover:shadow-aurora/40 transition-all duration-300 font-bold text-base hover:scale-[1.02] border-0 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Phone className="h-5 w-5 mr-2 relative z-10" />
              <span className="relative z-10">CONECTAR AGORA</span>
            </Button>

            {/* AÇÕES SECUNDÁRIAS - Aurora Style */}
            <div className="flex gap-2">
              <Button
                onClick={handleAddConnection}
                disabled={localStatus !== 'none' || isSendingRequest}
                variant="outline"
                className={`flex-1 transition-all duration-300 font-semibold ${
                  localStatus === 'accepted'
                    ? 'bg-aurora/10 border-2 border-aurora/60 text-aurora shadow-md shadow-aurora/20 hover:bg-aurora/15'
                    : localStatus === 'pending'
                    ? 'bg-warning/10 border-2 border-warning/60 text-warning shadow-md shadow-warning/20 cursor-not-allowed'
                    : 'border-2 border-border bg-card/50 text-foreground hover:bg-card hover:border-aurora/30 shadow-sm hover:shadow-md'
                }`}
              >
                {localStatus === 'accepted' ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Conectado
                  </>
                ) : localStatus === 'pending' ? (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Solicitação Enviada
                  </>
                ) : isSendingRequest ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar à Rede
                  </>
                )}
              </Button>

              {card.linkedinUrl && (
                <Button
                  onClick={handleLinkedInClick}
                  variant="outline"
                  size="icon"
                  className="border-2 border-[#0A66C2]/40 text-[#0A66C2] hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/60 transition-all duration-300 shadow-sm hover:shadow-md"
                  title="Ver perfil no LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Botões de navegação entre usuários - embaixo do card */}
          {(onNext || onPrevious) && (
            <div className="flex justify-between items-center gap-3 pt-4 border-t border-border/30 flex-shrink-0">
              <Button
                onClick={onPrevious}
                disabled={!hasPrevious}
                variant="outline"
                className="flex-1 bg-surface-elevated/50 border-2 border-border text-foreground hover:bg-surface-elevated hover:border-aurora/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] disabled:hover:scale-100"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Voltar
              </Button>
              
              <Button
                onClick={onNext}
                disabled={!hasNext}
                variant="outline"
                className="flex-1 bg-surface-elevated/50 border-2 border-border text-foreground hover:bg-surface-elevated hover:border-aurora/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] disabled:hover:scale-100"
              >
                Próximo
                <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </LiquidGlassCard>
    </motion.div>
  );
};