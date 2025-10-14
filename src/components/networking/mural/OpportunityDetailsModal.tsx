import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Opportunity } from '@/hooks/networking/useOpportunities';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Briefcase, Package, Users, TrendingUp, Target, Mail, Phone, Linkedin, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OpportunityDetailsModalProps {
  opportunity: Opportunity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeConfig = {
  parceria: { label: 'Parceria', icon: Users, colors: 'bg-blue-500/10 text-blue-600' },
  fornecedor: { label: 'Fornecedor', icon: Package, colors: 'bg-green-500/10 text-green-600' },
  cliente: { label: 'Cliente', icon: Briefcase, colors: 'bg-purple-500/10 text-purple-600' },
  investimento: { label: 'Investimento', icon: TrendingUp, colors: 'bg-yellow-500/10 text-yellow-600' },
  outro: { label: 'Outro', icon: Target, colors: 'bg-muted text-muted-foreground' },
};

export const OpportunityDetailsModal = ({
  opportunity,
  open,
  onOpenChange,
}: OpportunityDetailsModalProps) => {
  if (!opportunity) return null;

  const config = typeConfig[opportunity.opportunity_type];
  const Icon = config.icon;
  const author = opportunity.profiles;

  const handleContact = (type: string) => {
    switch (type) {
      case 'email':
        if (author?.email) {
          window.location.href = `mailto:${author.email}`;
        }
        break;
      case 'linkedin':
        if (author?.linkedin_url) {
          window.open(author.linkedin_url, '_blank');
        }
        break;
      case 'whatsapp':
        if (author?.whatsapp_number) {
          const cleanNumber = author.whatsapp_number.replace(/\D/g, '');
          window.open(`https://wa.me/${cleanNumber}`, '_blank');
        }
        break;
      case 'platform':
        toast({
          title: 'Chat da plataforma',
          description: 'Funcionalidade de chat será implementada em breve.',
        });
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={author?.avatar_url || ''} alt={author?.name || 'Usuário'} />
              <AvatarFallback>
                {(author?.name || 'U').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <DialogTitle className="text-2xl">{opportunity.title}</DialogTitle>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{author?.name || 'Usuário'}</span>
                {author?.company_name && (
                  <>
                    <span>•</span>
                    <span>{author.company_name}</span>
                  </>
                )}
              </div>
              {author?.position && (
                <p className="text-sm text-muted-foreground">{author.position}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Tipo e Data */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`${config.colors} border flex items-center gap-1.5 px-3 py-1.5`}>
              <Icon className="w-4 h-4" />
              {config.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Publicado em {format(new Date(opportunity.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
            </span>
          </div>

          <Separator />

          {/* Descrição */}
          <div className="space-y-2">
            <h3 className="font-semibold">Sobre a Oportunidade</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {opportunity.description}
            </p>
          </div>

          {/* Tags */}
          {opportunity.tags && opportunity.tags.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Contato */}
          <div className="space-y-3">
            <h3 className="font-semibold">Entre em Contato</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Preferência de contato: <span className="font-medium text-foreground">
                {opportunity.contact_preference === 'platform' && 'Chat da plataforma'}
                {opportunity.contact_preference === 'linkedin' && 'LinkedIn'}
                {opportunity.contact_preference === 'whatsapp' && 'WhatsApp'}
                {opportunity.contact_preference === 'email' && 'Email'}
              </span>
            </p>

            <div className="grid grid-cols-2 gap-3">
              {opportunity.contact_preference === 'platform' && (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => handleContact('platform')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar Mensagem
                </Button>
              )}

              {opportunity.contact_preference === 'email' && author?.email && (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => handleContact('email')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Email
                </Button>
              )}

              {opportunity.contact_preference === 'linkedin' && author?.linkedin_url && (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => handleContact('linkedin')}
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
              )}

              {opportunity.contact_preference === 'whatsapp' && author?.whatsapp_number && (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => handleContact('whatsapp')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              )}

              {/* Sempre mostrar LinkedIn como alternativa */}
              {opportunity.contact_preference !== 'linkedin' && author?.linkedin_url && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleContact('linkedin')}
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
