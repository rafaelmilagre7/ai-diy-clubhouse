import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
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
      // Buscar informações do usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      let userInfo = null;
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', user.id)
          .single();
          
        userInfo = {
          id: user.id,
          name: profile?.full_name || user.email?.split('@')[0] || 'Usuário',
          email: user.email,
          phone: profile?.phone
        };
      }

      const response = await fetch('https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/sales-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feature: 'solutions',
          itemTitle,
          type: 'upgrade_interest',
          timestamp: new Date().toISOString(),
          userInfo
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
          
          <div className="relative p-8">
            {/* Header */}
            <div className="text-center mb-10">
              {/* Logo VIVER DE IA Real */}
              <div className="flex justify-center mb-6">
                <img
                  src="/lovable-uploads/fe3733f5-092e-4a4e-bdd7-650b71aaa801.png"
                  alt="VIVER DE IA Club"
                  className="h-16 w-auto object-contain"
                />
              </div>

              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 
                           bg-clip-text text-transparent mb-3">
                Desbloqueie todos os recursos
              </h2>
              
              <p className="text-lg text-muted-foreground/80 max-w-xl mx-auto leading-relaxed mb-5">
                Tenha acesso completo à plataforma e transforme seu negócio com inteligência artificial
              </p>

              {itemTitle && (
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-card/80 backdrop-blur-sm 
                               rounded-2xl border border-border/40 shadow-lg">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-foreground">{itemTitle}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-center">
                O que você vai desbloquear:
              </h3>
              {BENEFITS.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-4 rounded-xl bg-card/60 backdrop-blur-sm 
                             border border-border/30 hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 
                                     border border-primary/20">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm">{benefit.title}</h4>
                      <p className="text-muted-foreground text-xs leading-relaxed">{benefit.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Section */}
            <div className="text-center space-y-5">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={handleUpgradeNow}
                  size="lg"
                  className="h-12 px-6 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 
                           hover:from-primary/90 hover:to-primary hover:scale-105 transition-all duration-300 
                           shadow-xl hover:shadow-2xl border-0 text-primary-foreground"
                >
                  Contratar Agora
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
                
                <Button 
                  onClick={handleTalkToSales}
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 text-base font-medium border-border/40 hover:bg-muted/50 
                           hover:border-primary/30 hover:scale-105 transition-all duration-300"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Falar com Vendas
                </Button>
              </div>

              {/* Social Proof com fotos de usuários reais */}
              <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground/70">
                <div className="flex -space-x-3">
                  <img 
                    src="https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/profile-pictures/88ff5724-0ac3-4763-b948-d249684dd35b/profile-1754500837827.jpeg" 
                    alt="Bel Battisti" 
                    className="w-10 h-10 rounded-full border-2 border-background object-cover"
                  />
                  <img 
                    src="https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/profile_images/b837c23e-e064-4eb8-8648-f1298d4cbe75/f61d0d3c-c39c-4ce8-9fd6-08d282816479_Diego_Malta.webp" 
                    alt="Diego Malta" 
                    className="w-10 h-10 rounded-full border-2 border-background object-cover"
                  />
                  <img 
                    src="https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/profile-pictures/70733c09-74a1-4f2b-b054-5bcf48b01841/profile-1753472567476.jpg" 
                    alt="Galante" 
                    className="w-10 h-10 rounded-full border-2 border-background object-cover"
                  />
                  <img 
                    src="https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/profile-pictures/2807f4bd-360c-49c4-b790-91c1791abe9d/profile-1754343191813.png" 
                    alt="Davi Lima" 
                    className="w-10 h-10 rounded-full border-2 border-background object-cover"
                  />
                  <img 
                    src="https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/profile-pictures/657c1795-74f3-4b0b-bb97-1d415eb15ebc/profile-1754507975554.jpeg" 
                    alt="Douglas Muller" 
                    className="w-10 h-10 rounded-full border-2 border-background object-cover"
                  />
                </div>
                <div className="text-left">
                  <div className="font-medium text-foreground text-sm">Mais de 1000+ pessoas já estão</div>
                  <div className="text-xs">tendo resultados com as soluções do VIVER DE IA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};