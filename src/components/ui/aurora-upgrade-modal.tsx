import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  ExternalLink, 
  MessageCircle,
  Check,
  Zap,
  Star,
  Users,
  Trophy
} from 'lucide-react';

interface AuroraUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTitle?: string;
}

const BENEFITS = [
  {
    icon: Zap,
    title: 'Todas as Soluções Práticas',
    description: 'Acesso completo a mais de 20+ soluções com passo a passo detalhado'
  },
  {
    icon: Star,
    title: 'Formação Completa em IA',
    description: 'Mais de 77 aulas práticas para dominar IA no seu negócio'
  },
  {
    icon: Users,
    title: 'Comunidade Premium',
    description: 'Networking com outros empreendedores e suporte exclusivo'
  },
  {
    icon: Trophy,
    title: 'Ferramentas Exclusivas',
    description: 'Acesso a automações e integrações premium'
  }
];

export const AuroraUpgradeModal: React.FC<AuroraUpgradeModalProps> = ({
  open,
  onOpenChange,
  itemTitle
}) => {
  const handleUpgradeNow = () => {
    window.open('https://viverdeia.ai/', '_blank');
    onOpenChange(false);
  };

  const handleTalkToSales = async () => {
    try {
      const response = await fetch('https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/sales-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feature: 'solutions',
          itemTitle,
          type: 'upgrade_interest',
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Erro na notificação');
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao notificar vendas:', error);
      window.open('https://wa.me/5511999999999?text=Olá! Tenho interesse em fazer upgrade na plataforma Viver de IA.', '_blank');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-0 bg-transparent">
        <div className="relative bg-gradient-to-br from-background via-background/98 to-background/95 
                       backdrop-blur-xl border border-border/20 rounded-3xl shadow-2xl">
          
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 rounded-3xl"></div>
          <div className="absolute inset-0 bg-dot-pattern opacity-5 rounded-3xl"></div>
          
          {/* Aurora Effects */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          
          <div className="relative p-12">
            {/* Header */}
            <div className="text-center mb-12">
              {/* Icon with Aurora Effect */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl animate-pulse scale-150"></div>
                  <div className="relative p-6 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 
                                 border border-primary/30 backdrop-blur-sm shadow-2xl">
                    <Sparkles className="h-16 w-16 text-primary" />
                  </div>
                </div>
              </div>

              <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 
                           bg-clip-text text-transparent mb-4">
                Desbloqueie todos os recursos
              </h2>
              
              <p className="text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed mb-6">
                Tenha acesso completo à plataforma <span className="font-semibold text-foreground">VIVER DE IA</span> e 
                transforme seu negócio com inteligência artificial
              </p>

              {itemTitle && (
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-card/80 backdrop-blur-sm 
                               rounded-2xl border border-border/40 shadow-lg">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-foreground">{itemTitle}</span>
                </div>
              )}
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {BENEFITS.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-6 rounded-2xl bg-card/60 backdrop-blur-sm 
                             border border-border/30 hover:border-primary/30 transition-all duration-300
                             hover:bg-card/80 group"
                  >
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 
                                     border border-primary/20 group-hover:border-primary/40 
                                     transition-all duration-300">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground text-lg">{benefit.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                    </div>
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Section */}
            <div className="text-center space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                <Button 
                  onClick={handleUpgradeNow}
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 
                           hover:from-primary/90 hover:to-primary hover:scale-105 transition-all duration-300 
                           shadow-2xl hover:shadow-3xl border-0 text-primary-foreground flex-1"
                >
                  <Sparkles className="h-5 w-5 mr-3" />
                  Contratar Agora
                  <ExternalLink className="h-4 w-4 ml-3" />
                </Button>
                
                <Button 
                  onClick={handleTalkToSales}
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-base font-medium border-border/40 hover:bg-muted/50 
                           hover:border-primary/30 hover:scale-105 transition-all duration-300 flex-1"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Falar com Vendas
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/70">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-background"></div>
                  ))}
                </div>
                <span>Mais de 1000+ empreendedores já transformaram seus negócios</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};