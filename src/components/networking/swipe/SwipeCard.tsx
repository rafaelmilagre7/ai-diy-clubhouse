import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Linkedin, Phone, Loader2, UserPlus, Check, Clock } from 'lucide-react';
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
        className="w-full max-w-md mx-auto overflow-hidden shadow-2xl shadow-aurora/10 hover:shadow-3xl hover:shadow-aurora/20 transition-shadow duration-500"
        variant="premium"
        hoverable={false}
      >
        <div className="h-[580px] flex flex-col p-6">
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

            {/* Badge de Score */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-operational/20 to-aurora/20 border border-operational/30 flex-shrink-0">
              <span className="text-lg font-black text-operational">{Math.round(card.score || 50)}%</span>
            </div>
          </div>

          {/* Card Carrossel com dados parametrizados */}
          <div className="flex-1 min-h-0 relative liquid-glass-card rounded-2xl p-5 border border-aurora/10 shadow-inner mb-6">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-aurora/20 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-aurora/20 rounded-br-2xl" />
            
            <SwipeCardCarousel card={card} />
          </div>

          {/* Action Buttons reorganizados em 2 linhas - SEMPRE VISÍVEIS */}
          <div className="space-y-2 flex-shrink-0">
            {/* Linha 1: Ações secundárias (menores) */}
            <div className="flex gap-2">
              {/* Botão Adicionar Conexão - COMPACTO */}
              <Button
                onClick={handleAddConnection}
                disabled={localStatus !== 'none' || isSendingRequest}
                size="sm"
                className={`flex-1 gap-1.5 transition-all duration-300 shadow-sm hover:shadow-md border-0 ${
                  localStatus === 'accepted'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                    : localStatus === 'pending'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white cursor-not-allowed opacity-80'
                    : 'bg-gradient-to-r from-viverblue-dark to-operational hover:from-viverblue-darker hover:to-operational-dark text-white hover:scale-[1.02] shadow-lg'
                }`}
              >
                {localStatus === 'accepted' ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span className="text-xs font-medium">Conectado</span>
                  </>
                ) : localStatus === 'pending' ? (
                  <>
                    <Clock className="h-4 w-4 animate-pulse" />
                    <span className="text-xs font-medium">Enviada</span>
                  </>
                ) : isSendingRequest ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs font-medium">Enviando...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span className="text-xs font-medium">Adicionar</span>
                  </>
                )}
              </Button>

              {/* Botão LinkedIn - SÓ ÍCONE */}
              {card.linkedinUrl && (
                <Button
                  onClick={handleLinkedInClick}
                  size="sm"
                  className="px-3 bg-[#0A66C2] hover:bg-[#004182] text-white shadow-sm hover:shadow-md transition-all border-0"
                  title="Ver perfil no LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Linha 2: Ação principal (CONECTAR - DESTAQUE) */}
            <Button
              onClick={onOpenContact}
              size="lg"
              className="w-full gap-2 bg-gradient-to-r from-[#0ABAB5] via-[#088A87] to-[#065F5D] hover:from-[#088A87] hover:via-[#065F5D] hover:to-[#044D4B] hover:shadow-xl hover:shadow-aurora/40 hover:scale-[1.02] transition-all text-white font-bold border-0 shadow-lg"
            >
              <Phone className="h-5 w-5" />
              <span>CONECTAR</span>
            </Button>
          </div>
        </div>
      </LiquidGlassCard>
    </motion.div>
  );
};