import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Linkedin, Phone, Loader2, UserPlus, Check, Clock, Trophy } from 'lucide-react';
import { SwipeCard as SwipeCardType } from '@/hooks/networking/useSwipeCards';
import { motion } from 'framer-motion';
import { useConnections } from '@/hooks/networking/useConnections';
import { useState, useEffect } from 'react';
import { SwipeCardCarousel } from './SwipeCardCarousel';

interface SwipeCardProps {
  card: SwipeCardType;
  onOpenContact: () => void;
}

export const SwipeCard = ({ card, onOpenContact }: SwipeCardProps) => {
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
        className="w-full max-w-lg mx-auto overflow-hidden shadow-2xl shadow-aurora/10 hover:shadow-3xl hover:shadow-aurora/20 transition-shadow duration-500"
        variant="premium"
        hoverable={false}
      >
        <div className="h-[700px] flex flex-col p-6">
          {/* Header Compacto: Avatar + Info + Score */}
          <div className="flex items-center gap-4 mb-4 flex-shrink-0">
            <Avatar className="h-20 w-20 border-2 border-aurora/30 shadow-lg">
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
              <h2 className="text-xl font-bold text-foreground truncate">
                {card.name}
              </h2>
              <p className="text-sm font-medium text-muted-foreground truncate">
                {card.position}
              </p>
              <p className="text-sm font-medium text-aurora truncate">
                @ {card.company}
              </p>
            </div>

            {/* Badge de Score - Verde neutro */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-strategy/15 to-viverblue/10 border border-strategy/30 flex-shrink-0">
              <Trophy className="h-4 w-4 text-strategy" />
              <span className="text-lg font-black text-strategy">{Math.round(card.score || 50)}%</span>
            </div>
          </div>

          {/* Card Carrossel com dados parametrizados */}
          <div className="flex-1 min-h-0 relative liquid-glass-card rounded-2xl p-5 border border-aurora/10 shadow-inner mb-6">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-aurora/20 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-aurora/20 rounded-br-2xl" />
            
            <SwipeCardCarousel card={card} />
          </div>

          {/* Action Buttons - Nova Hierarquia Visual */}
          <div className="space-y-3 flex-shrink-0">
            {/* Ações Secundárias - Lado a Lado, Outline Suave */}
            <div className="flex gap-2">
              <Button
                onClick={handleAddConnection}
                disabled={localStatus !== 'none' || isSendingRequest}
                variant="outline"
                size="sm"
                className={`flex-1 transition-all duration-300 ${
                  localStatus === 'accepted'
                    ? 'bg-green-500/10 border-green-500/30 text-green-700 hover:bg-green-500/20'
                    : localStatus === 'pending'
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 cursor-not-allowed'
                    : 'border-muted/30 text-muted-foreground hover:bg-muted/10 hover:text-foreground hover:border-muted/50'
                }`}
              >
                {localStatus === 'accepted' ? (
                  <>
                    <Check className="h-4 w-4" />
                    Conectado
                  </>
                ) : localStatus === 'pending' ? (
                  <>
                    <Clock className="h-4 w-4 animate-pulse" />
                    Enviada
                  </>
                ) : isSendingRequest ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Adicionar
                  </>
                )}
              </Button>

              {card.linkedinUrl && (
                <Button
                  onClick={handleLinkedInClick}
                  variant="outline"
                  size="sm"
                  className="border-muted/30 text-muted-foreground hover:bg-muted/10 hover:text-foreground hover:border-muted/50 transition-all px-3"
                  title="Ver perfil no LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Ação Primária - Destaque com Gradiente Suave */}
            <Button
              onClick={onOpenContact}
              size="lg"
              className="w-full bg-gradient-to-r from-strategy/90 via-revenue/90 to-operational/90 hover:from-strategy hover:via-revenue hover:to-operational text-white shadow-lg shadow-strategy/20 transition-all duration-300 font-bold"
            >
              <Phone className="h-5 w-5 animate-pulse" />
              CONECTAR AGORA
              <span className="ml-auto text-xs font-medium opacity-80">{Math.round(card.score)}%</span>
            </Button>
          </div>
        </div>
      </LiquidGlassCard>
    </motion.div>
  );
};