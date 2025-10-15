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

            {/* Badge de Score - Compacto */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border-2 border-emerald-500 shadow-sm flex-shrink-0">
              <Trophy className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-800 font-extrabold">{Math.round(card.score || 50)}%</span>
            </div>
          </div>

          {/* Card Carrossel com dados parametrizados */}
          <div className="flex-1 min-h-0 relative liquid-glass-card rounded-2xl p-5 border border-aurora/10 shadow-inner mb-8">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-aurora/20 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-aurora/20 rounded-br-2xl" />
            
            <SwipeCardCarousel card={card} />
          </div>

          {/* Status Banner - Se conectado */}
          {localStatus === 'accepted' && (
            <div className="bg-white border-2 border-emerald-500 shadow-md rounded-lg p-2.5 mb-3 text-center text-sm flex-shrink-0">
              <Check className="inline h-4 w-4 mr-1.5 text-emerald-600" />
              <span className="text-emerald-800 font-semibold">Vocês já estão conectados</span>
            </div>
          )}

          {/* Action Buttons - Hierarquia Clara */}
          <div className="space-y-3 flex-shrink-0">
            {/* CTA PRINCIPAL - Verde Vibrante, Destaque Máximo */}
            <Button
              onClick={onOpenContact}
              size="lg"
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 font-bold text-base hover:scale-[1.01]"
            >
              <Phone className="h-5 w-5 mr-2" />
              CONECTAR AGORA
            </Button>

            {/* AÇÕES SECUNDÁRIAS - Hierarquia Clara */}
            <div className="flex gap-2">
              <Button
                onClick={handleAddConnection}
                disabled={localStatus !== 'none' || isSendingRequest}
                variant="outline"
                className={`flex-1 transition-all duration-300 ${
                  localStatus === 'accepted'
                    ? 'bg-white border-2 border-emerald-600 text-emerald-900 font-semibold shadow-sm hover:bg-emerald-50'
                    : localStatus === 'pending'
                    ? 'bg-white border-2 border-amber-500 text-amber-900 font-semibold shadow-sm cursor-not-allowed'
                    : 'border-2 border-slate-400 bg-white text-slate-900 hover:bg-slate-100 hover:border-slate-500 font-semibold shadow-sm'
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
                  className="border-[#0A66C2]/30 text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-all duration-300"
                  title="Ver perfil no LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </LiquidGlassCard>
    </motion.div>
  );
};