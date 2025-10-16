import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Mail, Phone, Linkedin, MessageCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SwipeCard } from '@/hooks/networking/useSwipeCards';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: SwipeCard | null;
}

export const ContactModal = ({ isOpen, onClose, card }: ContactModalProps) => {
  const { toast } = useToast();

  if (!card) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: `${label} copiado para a área de transferência`,
    });
  };

  const openWhatsApp = () => {
    if (card.whatsappNumber) {
      const cleanNumber = card.whatsappNumber.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank', 'noopener,noreferrer');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative liquid-glass-card rounded-2xl border border-aurora/20 shadow-2xl shadow-aurora/10 overflow-hidden"
            >
              {/* Aurora Background Effects */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-aurora-primary/5 rounded-full blur-3xl animate-blob" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-aurora-primary-light/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
              </div>

              {/* Header com gradiente */}
              <div className="relative p-6 border-b border-aurora-primary/10">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-aurora-primary via-aurora-primary-light to-operational bg-clip-text text-transparent">
                    Informações de Contato
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Dados para você entrar em contato com {card.name}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="relative p-6 space-y-6">
                {/* Avatar + Info Card */}
                <div className="flex items-center gap-4 p-4 rounded-xl liquid-glass-card border border-aurora-primary/10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-aurora-primary/20 blur-xl rounded-full" />
                    <Avatar className="relative h-16 w-16 border-2 border-aurora-primary/20">
                      <AvatarImage src={card.avatarUrl} alt={card.name} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-aurora-primary/30 to-aurora-primary-light/30 text-aurora-primary font-bold text-lg">
                        {getInitials(card.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">{card.name}</h3>
                    <p className="text-sm text-muted-foreground">{card.position}</p>
                    <p className="text-xs text-muted-foreground font-medium">{card.company}</p>
                  </div>
                </div>

                {/* Contact Fields */}
                <div className="space-y-4">
                  {/* Email */}
                  {card.email && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wide">
                        <div className="p-1.5 rounded-md bg-aurora-primary/10">
                          <Mail className="h-3.5 w-3.5 text-aurora-primary" />
                        </div>
                        Email
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1 px-4 py-3 liquid-glass-card rounded-xl border border-aurora-primary/10 text-sm font-medium">
                          {card.email}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(card.email, 'Email')}
                          className="px-4 bg-aurora-primary/10 hover:bg-aurora-primary/20 text-aurora-primary border border-aurora-primary/20"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp */}
                  {card.whatsappNumber && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wide">
                        <div className="p-1.5 rounded-md bg-[#25D366]/10">
                          <Phone className="h-3.5 w-3.5 text-[#25D366]" />
                        </div>
                        WhatsApp
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1 px-4 py-3 liquid-glass-card rounded-xl border border-aurora-primary/10 text-sm font-medium">
                          {card.whatsappNumber}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(card.whatsappNumber || '', 'WhatsApp')}
                          className="px-4 bg-aurora-primary/10 hover:bg-aurora-primary/20 text-aurora-primary border border-aurora-primary/20"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={openWhatsApp}
                          className="px-4 bg-[#25D366] hover:bg-[#20BA5A] text-white border-0"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* LinkedIn */}
                  {card.linkedinUrl && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wide">
                        <div className="p-1.5 rounded-md bg-[#0A66C2]/10">
                          <Linkedin className="h-3.5 w-3.5 text-[#0A66C2]" />
                        </div>
                        LinkedIn
                      </label>
                      <Button
                        className="w-full gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white border-0 h-12"
                        onClick={() => window.open(card.linkedinUrl, '_blank', 'noopener,noreferrer')}
                      >
                        <Linkedin className="h-5 w-5" />
                        Ver Perfil no LinkedIn
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="relative p-6 border-t border-aurora-primary/10">
                <Button 
                  onClick={onClose}
                  variant="aurora-primary"
                  className="w-full h-12 font-semibold"
                >
                  Concluído
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};