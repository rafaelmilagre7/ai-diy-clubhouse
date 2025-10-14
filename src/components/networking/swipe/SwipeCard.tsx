import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Linkedin, Phone, Mail, Loader2 } from 'lucide-react';
import { SwipeCard as SwipeCardType } from '@/hooks/networking/useSwipeCards';
import { Skeleton } from '@/components/ui/skeleton';

interface SwipeCardProps {
  card: SwipeCardType;
  onOpenContact: () => void;
}

export const SwipeCard = ({ card, onOpenContact }: SwipeCardProps) => {
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

  return (
    <Card className="w-full max-w-2xl mx-auto p-8 space-y-6 bg-gradient-to-br from-background via-background to-primary/5 border-primary/20 shadow-2xl">
      {/* Header - Avatar + Info */}
      <div className="flex items-start gap-6">
        <Avatar className="h-24 w-24 border-4 border-primary/20">
          <AvatarImage src={card.avatarUrl} alt={card.name} />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {getInitials(card.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <h2 className="text-3xl font-bold text-foreground">{card.name}</h2>
          <p className="text-lg text-muted-foreground">{card.position}</p>
          <p className="text-md text-muted-foreground font-medium">{card.company}</p>
        </div>
      </div>

      {/* Score Badge */}
      <div className="flex items-center gap-2">
        <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
          <span className="text-sm font-semibold text-primary">
            {Math.round(card.score * 100)}% de compatibilidade
          </span>
        </div>
      </div>

      {/* AI Copy - Centro do Card */}
      <div className="min-h-[200px] py-6 px-4 rounded-lg bg-card/50 border border-border/50">
        {card.isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">A IA está analisando essa conexão...</span>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/6" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide">Por que se conectar</span>
            </div>
            <p className="text-foreground leading-relaxed whitespace-pre-line">
              {card.connectionCopy}
            </p>
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
        {card.linkedinUrl && (
          <Button
            onClick={handleLinkedInClick}
            variant="outline"
            className="gap-2 border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </Button>
        )}
        
        <Button
          onClick={onOpenContact}
          variant="default"
          className="gap-2"
        >
          <Phone className="h-4 w-4" />
          Ver Contato
        </Button>

        {!card.linkedinUrl && (
          <Button
            onClick={onOpenContact}
            variant="outline"
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
        )}
      </div>
    </Card>
  );
};