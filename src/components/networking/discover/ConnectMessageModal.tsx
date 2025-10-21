import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  Mail, 
  Send, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ConnectMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientName: string;
  suggestedMessage: string;
  recipientEmail: string;
  recipientId: string;
}

type MessageStyle = 'formal' | 'casual' | 'business';
type DeliveryChannel = 'email' | 'whatsapp' | 'internal';

export const ConnectMessageModal = ({
  open,
  onOpenChange,
  recipientName,
  suggestedMessage,
  recipientEmail,
  recipientId
}: ConnectMessageModalProps) => {
  const [selectedStyle, setSelectedStyle] = useState<MessageStyle>('formal');
  const [selectedChannel, setSelectedChannel] = useState<DeliveryChannel>('internal');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const messageTemplates: Record<MessageStyle, string> = {
    formal: `Olá ${recipientName},\n\n${suggestedMessage}\n\nFico no aguardo de seu retorno.\n\nAtenciosamente,`,
    casual: `Oi ${recipientName}! 😊\n\n${suggestedMessage}\n\nVamos trocar uma ideia?\n\nAbraço!`,
    business: `${recipientName},\n\n${suggestedMessage}\n\nPodemos agendar uma conversa?\n\nCumprimentos,`
  };

  const styles = [
    { id: 'formal' as const, label: 'Formal', icon: '👔', description: 'Tom profissional e respeitoso' },
    { id: 'casual' as const, label: 'Casual', icon: '😊', description: 'Mais descontraído e amigável' },
    { id: 'business' as const, label: 'Direto', icon: '🎯', description: 'Focado em negócios' }
  ];

  const channels = [
    { id: 'internal' as const, label: 'Chat Interno', icon: MessageSquare, description: 'Mensagem na plataforma' },
    { id: 'email' as const, label: 'Email', icon: Mail, description: 'Enviar por email' },
  ];

  const handleSend = async () => {
    const finalMessage = customMessage || messageTemplates[selectedStyle];
    
    if (!finalMessage.trim()) {
      toast.error('Por favor, escreva uma mensagem');
      return;
    }

    setIsSending(true);

    try {
      // Simular envio (substituir por chamada real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mostrar sucesso
      setShowSuccess(true);
      
      // Confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success('Mensagem enviada com sucesso!', {
        description: `Sua solicitação de conexão foi enviada para ${recipientName}`
      });

      // Fechar modal após 2s
      setTimeout(() => {
        onOpenChange(false);
        setShowSuccess(false);
        setCustomMessage('');
        setSelectedStyle('formal');
      }, 2000);

    } catch (error) {
      toast.error('Erro ao enviar mensagem');
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-surface-modal border-aurora/20">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 aurora-pulse"></div>
              <div className="relative w-20 h-20 rounded-full bg-aurora/20 border-2 border-aurora/40 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-aurora" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold aurora-text-gradient">Mensagem Enviada!</h3>
              <p className="text-text-muted">
                Sua solicitação de conexão foi enviada para <span className="font-semibold text-text-primary">{recipientName}</span>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-surface-modal border-aurora/20 max-h-modal-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Zap className="w-5 h-5 text-aurora" />
            <span className="aurora-text-gradient">Conectar com {recipientName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Message Style Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-text-primary">Estilo da Mensagem</label>
            <div className="grid grid-cols-3 gap-3">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    setSelectedStyle(style.id);
                    setCustomMessage('');
                  }}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-300 text-left
                    ${selectedStyle === style.id
                      ? 'border-aurora bg-aurora/10 shadow-aurora'
                      : 'border-border/30 hover:border-aurora/40 hover:bg-aurora/5'
                    }
                  `}
                >
                  <div className="text-2xl mb-2">{style.icon}</div>
                  <div className="font-semibold text-sm text-text-primary mb-1">{style.label}</div>
                  <div className="text-xs text-text-muted">{style.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Preview/Edit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-text-primary">Sua Mensagem</label>
              <Badge className="bg-aurora/20 text-aurora border-aurora/40">
                <Zap className="w-3 h-3 mr-1" />
                Gerada por IA
              </Badge>
            </div>
            <Textarea
              value={customMessage || messageTemplates[selectedStyle]}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Escreva sua mensagem..."
              className="min-h-chart-sm bg-surface-elevated border-border text-text-primary resize-none"
            />
            <p className="text-xs text-text-muted">
              Você pode editar a mensagem sugerida pela IA ou escrever sua própria versão
            </p>
          </div>

          {/* Delivery Channel */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-text-primary">Canal de Entrega</label>
            <div className="grid grid-cols-2 gap-3">
              {channels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel.id)}
                    className={`
                      p-4 rounded-xl border-2 transition-all duration-300 flex items-start gap-3
                      ${selectedChannel === channel.id
                        ? 'border-aurora bg-aurora/10'
                        : 'border-border/30 hover:border-aurora/40 hover:bg-aurora/5'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 mt-0.5 ${selectedChannel === channel.id ? 'text-aurora' : 'text-text-muted'}`} />
                    <div className="text-left">
                      <div className="font-semibold text-sm text-text-primary">{channel.label}</div>
                      <div className="text-xs text-text-muted">{channel.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border/30">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 border-border/50"
              disabled={isSending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending}
              className="flex-1 aurora-gradient text-white hover:opacity-90"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Mensagem
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
