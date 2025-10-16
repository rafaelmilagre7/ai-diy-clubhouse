import { EventCalendar } from '@/components/events/EventCalendar';
import { useEvents } from '@/hooks/useEvents';
import { Loader2, Calendar as CalendarIcon, Crown, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useFeatureAccess } from '@/hooks/auth/useFeatureAccess';
import { usePremiumUpgradeModal } from '@/hooks/usePremiumUpgradeModal';
import { AuroraUpgradeModal } from '@/components/ui/aurora-upgrade-modal';

const Events = () => {
  const { isLoading } = useEvents();
  const { hasFeatureAccess } = useFeatureAccess();
  const { modalState, showUpgradeModal, hideUpgradeModal } = usePremiumUpgradeModal();
  
  // Por enquanto, assumindo que events não tem restrições (pode ajustar depois)
  const hasAccess = hasFeatureAccess('events'); // Verificação correta sem default
  
  const handleClick = () => {
    if (!hasAccess) {
      showUpgradeModal('events');
    }
  };
  
  return (
    <>
      <div className="container py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-full bg-aurora-primary/10">
              <CalendarIcon className="w-6 h-6 text-aurora-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1 text-zinc-100">Calendário de Eventos</h1>
              <p className="text-muted-foreground">
                Acompanhe os próximos eventos e não perca nenhuma oportunidade.
              </p>
            </div>
          </div>
          
          {!hasAccess ? (
            <div 
              className="relative cursor-pointer rounded-2xl overflow-hidden"
              onClick={handleClick}
            >
              <div className="h-[700px] bg-gradient-to-br from-card via-card to-muted/50 border border-border/50 rounded-2xl relative">
                {/* Overlay Premium */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 z-30 flex items-center justify-center backdrop-blur-sm rounded-2xl">
                  <div className="text-center space-y-3">
                    <div className="p-3 bg-gradient-to-r from-aurora-primary via-aurora-primary/90 to-aurora-primary/80 rounded-full w-fit mx-auto shadow-2xl">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                    <Badge className="bg-gradient-to-r from-aurora-primary via-aurora-primary/90 to-aurora-primary/80 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
                      <Lock className="h-3 w-3 mr-2" />
                      PREMIUM
                    </Badge>
                    <p className="text-white/90 text-sm font-medium">Clique para fazer upgrade</p>
                  </div>
                </div>
                
                {/* Premium Badge no topo */}
                <Badge 
                  className="absolute top-4 right-4 bg-gradient-to-r from-aurora-primary via-aurora-primary/90 to-aurora-primary/80 text-white border-0 shadow-lg backdrop-blur-sm z-20"
                >
                  <Crown className="h-3 w-3 mr-1" />
                  PREMIUM
                </Badge>
                
                {/* Conteúdo simulado do calendário */}
                <div className="p-6 h-full">
                  <div className="grid grid-cols-7 gap-2 h-full">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <div key={i} className="bg-muted/30 rounded border border-border/30 flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">{(i % 31) + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {isLoading ? (
                <div className="flex justify-center items-center h-[700px]">
                  <Loader2 className="h-8 w-8 animate-spin text-aurora-primary" />
                </div>
              ) : (
                <EventCalendar />
              )}
            </>
          )}
        </div>
      </div>
      
      <AuroraUpgradeModal 
        open={modalState.open}
        onOpenChange={hideUpgradeModal}
        itemTitle={modalState.itemTitle || "Desbloquear Eventos Premium"}
        feature="solutions"
      />
    </>
  );
};
export default Events;