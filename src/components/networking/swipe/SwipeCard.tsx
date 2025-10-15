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
          <div className="space-y-4 flex-shrink-0 pt-2">
            {/* Ações Secundárias - Lado a Lado, Outline Suave */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddConnection}
                disabled={localStatus !== 'none' || isSendingRequest}
                variant="outline"
                size="default"
                className={`flex-1 transition-all duration-300 font-medium ${
                  localStatus === 'accepted'
                    ? 'bg-green-500/10 border-green-500/40 text-green-600 hover:bg-green-500/20'
                    : localStatus === 'pending'
                    ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-600 cursor-not-allowed'
                    : 'border-neutral-300/60 text-foreground hover:bg-neutral-100/10 hover:border-neutral-300 hover:shadow-md'
                }`}
              >
                {localStatus === 'accepted' ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Conectado
                  </>
                ) : localStatus === 'pending' ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-pulse" />
                    Enviada
                  </>
                ) : isSendingRequest ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar
                  </>
                )}
              </Button>

              {card.linkedinUrl && (
                <Button
                  onClick={handleLinkedInClick}
                  variant="outline"
                  size="default"
                  className="border-[#0A66C2]/40 text-[#0A66C2] hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/60 transition-all hover:shadow-md font-medium px-4"
                  title="Ver perfil no LinkedIn"
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
              )}
            </div>

            {/* Ação Primária - Destaque com Gradiente Suave */}
            <Button
              onClick={onOpenContact}
              size="lg"
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 font-bold transform hover:scale-[1.02]"
            >
              <Phone className="h-5 w-5 mr-2 animate-pulse" />
              CONECTAR AGORA
              <span className="ml-auto px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">{Math.round(card.score)}%</span>
            </Button>
          </div>
        </div>
      </LiquidGlassCard>
    </motion.div>
  );
};