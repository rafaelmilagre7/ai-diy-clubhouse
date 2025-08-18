import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Zap, 
  Star, 
  Sparkles, 
  ExternalLink, 
  MessageCircle,
  Check,
  Lock
} from 'lucide-react';

interface PremiumUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: 'solutions' | 'learning' | 'tools' | 'benefits' | 'networking' | 'events';
  itemTitle?: string;
}

const FEATURE_CONFIG = {
  solutions: {
    icon: Zap,
    title: 'Desbloqueie as Soluções Premium',
    subtitle: 'Acesse mais de 20+ soluções práticas para alavancar seu negócio com IA',
    benefits: [
      'Todas as soluções com passo a passo',
      'Templates e códigos prontos',
      'Vídeos explicativos detalhados',
      'Suporte da comunidade premium'
    ],
    gradient: 'from-operational via-operational/90 to-operational/70',
    glowColor: 'operational'
  },
  learning: {
    icon: Star,
    title: 'Acesse a Formação Completa',
    subtitle: 'Mais de 77 aulas práticas para dominar IA no seu negócio',
    benefits: [
      'Formação completa em IA para negócios',
      'Certificados de conclusão',
      'Projetos práticos reais',
      'Mentoria da comunidade'
    ],
    gradient: 'from-strategy via-strategy/90 to-strategy/70',
    glowColor: 'strategy'
  },
  tools: {
    icon: Crown,
    title: 'Ferramentas Premium Liberadas',
    subtitle: 'Acesse ferramentas exclusivas para automatizar seu negócio',
    benefits: [
      'Ferramentas exclusivas premium',
      'Automações avançadas',
      'Integrações personalizadas',
      'Suporte prioritário'
    ],
    gradient: 'from-revenue via-revenue/90 to-revenue/70',
    glowColor: 'revenue'
  },
  benefits: {
    icon: Sparkles,
    title: 'Benefícios Exclusivos VIP',
    subtitle: 'Descontos e parcerias especiais para membros premium',
    benefits: [
      'Descontos em ferramentas premium',
      'Parcerias exclusivas',
      'Acesso antecipado a novidades',
      'Comunidade VIP'
    ],
    gradient: 'from-viverblue via-viverblue/90 to-viverblue/70',
    glowColor: 'viverblue'
  },
  networking: {
    icon: Star,
    title: 'Networking Premium Desbloqueado',
    subtitle: 'Conecte-se com outros empreendedores e experts em IA',
    benefits: [
      'Networking com especialistas',
      'Eventos exclusivos',
      'Mastermind groups',
      'Conexões estratégicas'
    ],
    gradient: 'from-aurora via-aurora/90 to-aurora/70',
    glowColor: 'aurora'
  },
  events: {
    icon: Zap,
    title: 'Eventos Premium Liberados',
    subtitle: 'Participe de webinars, workshops e eventos exclusivos',
    benefits: [
      'Webinars ao vivo exclusivos',
      'Workshops práticos',
      'Q&A com especialistas',
      'Gravações liberadas'
    ],
    gradient: 'from-operational via-operational/90 to-operational/70',
    glowColor: 'operational'
  }
};

export const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  open,
  onOpenChange,
  feature,
  itemTitle
}) => {
  console.log('🚀 PremiumUpgradeModal renderizado:', { open, feature, itemTitle });
  const config = FEATURE_CONFIG[feature];
  const Icon = config.icon;

  const handleUpgradeNow = () => {
    window.open('https://viverdeia.ai/', '_blank');
    onOpenChange(false);
  };

  const handleTalkToSales = async () => {
    try {
      // Usar o endpoint do Supabase Edge Function
      const response = await fetch('https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/sales-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feature,
          itemTitle,
          type: 'upgrade_interest',
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        // Mostrar feedback de sucesso
        onOpenChange(false);
        // Opcional: mostrar toast de confirmação
      }
    } catch (error) {
      console.error('Erro ao notificar vendas:', error);
      // Fallback: abrir WhatsApp diretamente
      window.open('https://wa.me/5511999999999?text=Olá! Tenho interesse em fazer upgrade na plataforma Viver de IA.', '_blank');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-0 bg-gradient-to-br from-background via-background/95 to-background/90">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className={`fixed inset-0 bg-gradient-to-br ${config.gradient} opacity-5 blur-3xl -z-10`}></div>
        
        {/* Header */}
        <DialogHeader className="relative p-8 pb-6 text-center">
          {/* Premium Badge */}
          <div className="flex justify-center mb-6">
            <Badge 
              variant="outline" 
              className={`px-4 py-2 text-sm font-medium bg-gradient-to-r ${config.gradient} text-white border-0 shadow-lg`}
            >
              <Crown className="h-4 w-4 mr-2" />
              PREMIUM
            </Badge>
          </div>

          {/* Icon with Glow */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className={`absolute inset-0 bg-${config.glowColor}/30 rounded-full blur-2xl animate-pulse scale-150`}></div>
              <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${config.gradient} shadow-2xl`}>
                <Icon className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>

          <DialogTitle className={`text-3xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-3`}>
            {config.title}
          </DialogTitle>
          
          <p className="text-lg text-muted-foreground/80 max-w-md mx-auto leading-relaxed">
            {config.subtitle}
          </p>

          {itemTitle && (
            <div className="mt-4 p-3 bg-card/80 backdrop-blur-sm rounded-xl border border-border/40">
              <div className="flex items-center justify-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{itemTitle}</span>
              </div>
            </div>
          )}
        </DialogHeader>

        {/* Content */}
        <div className="relative px-8 pb-8 space-y-8">
          {/* Benefits List */}
          <div className="grid grid-cols-1 gap-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              O que você vai desbloquear:
            </h3>
            {config.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-card/60 backdrop-blur-sm border border-border/30">
                <div className={`p-1 rounded-full bg-gradient-to-r ${config.gradient}`}>
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-1 gap-4 pt-4">
            <Button 
              onClick={handleUpgradeNow}
              size="lg"
              className={`h-14 text-lg font-semibold bg-gradient-to-r ${config.gradient} hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl border-0 text-white`}
            >
              <Crown className="h-5 w-5 mr-3" />
              Contratar Agora
              <ExternalLink className="h-4 w-4 ml-3" />
            </Button>
            
            <Button 
              onClick={handleTalkToSales}
              variant="outline"
              size="lg"
              className="h-12 text-base font-medium border-border/40 hover:bg-muted/50 hover:scale-105 transition-all duration-300"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Falar com o Time de Vendas
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground/70">
              💡 Mais de 1000+ empreendedores já transformaram seus negócios
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};