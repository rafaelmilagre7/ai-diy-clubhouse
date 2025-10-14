import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Mail, Phone, Linkedin, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SwipeCard } from '@/hooks/networking/useSwipeCards';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Informações de Contato</DialogTitle>
          <DialogDescription>
            Dados para você entrar em contato com {card.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar + Nome */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={card.avatarUrl} alt={card.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(card.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{card.name}</h3>
              <p className="text-sm text-muted-foreground">{card.position}</p>
              <p className="text-sm text-muted-foreground">{card.company}</p>
            </div>
          </div>

          {/* Email */}
          {card.email && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-muted rounded-md text-sm">
                  {card.email}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(card.email, 'Email')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* WhatsApp */}
          {card.whatsappNumber && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                WhatsApp
              </label>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-muted rounded-md text-sm">
                  {card.whatsappNumber}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(card.whatsappNumber || '', 'WhatsApp')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={openWhatsApp}
                  className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* LinkedIn */}
          {card.linkedinUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </label>
              <Button
                variant="outline"
                className="w-full gap-2 border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white"
                onClick={() => window.open(card.linkedinUrl, '_blank', 'noopener,noreferrer')}
              >
                <Linkedin className="h-4 w-4" />
                Ver Perfil no LinkedIn
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};