import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSwipeCards } from "@/hooks/networking/useSwipeCards";
import { SwipeCard } from "@/components/networking/swipe/SwipeCard";
import { ContactModal } from "@/components/networking/modals/ContactModal";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Network, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

const Networking = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const {
    currentCard,
    nextCard,
    previousCard,
    hasNext,
    hasPrevious,
    isLoadingCards,
    totalCards,
    currentIndex,
    refetch,
    generateMatches,
    isGenerating,
  } = useSwipeCards();

  if (isLoadingCards) {
    return (
      <>
        <Helmet>
          <title>Networking AI | Viver de IA</title>
          <meta name="description" content="Descubra conexões estratégicas com IA na comunidade Viver de IA" />
        </Helmet>

        <div className="relative container py-12 flex items-center justify-center min-h-[70vh] overflow-hidden">
          {/* Aurora Background Blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-aurora/10 rounded-full blur-3xl animate-blob" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-viverblue/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-operational/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
          </div>
          
          <div className="relative text-center space-y-6">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-aurora/20 to-viverblue/20 backdrop-blur-sm border border-aurora/30">
              <Loader2 className="h-12 w-12 animate-spin text-aurora" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-aurora via-viverblue to-operational bg-clip-text text-transparent">
                Analisando sua rede
              </h2>
              <p className="text-muted-foreground">Carregando suas conexões estratégicas...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!currentCard || totalCards === 0) {
    return (
      <>
        <Helmet>
          <title>Networking AI | Viver de IA</title>
          <meta name="description" content="Descubra conexões estratégicas com IA na comunidade Viver de IA" />
        </Helmet>

        <div className="relative container py-12 overflow-hidden">
          {/* Aurora Background Blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-aurora/10 rounded-full blur-3xl animate-blob" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-viverblue/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-operational/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
          </div>

          <Card className="relative max-w-2xl mx-auto p-12 text-center space-y-8 liquid-glass-card border-aurora/20 shadow-2xl shadow-aurora/5">
            {/* Icon com gradiente e glow */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-aurora to-viverblue opacity-20 blur-2xl rounded-full" />
                <div className="relative inline-flex p-6 rounded-2xl bg-gradient-to-br from-aurora/20 to-viverblue/20 backdrop-blur-sm border border-aurora/30">
                  <Network className="h-16 w-16 text-aurora" />
                </div>
              </div>
            </div>

            {/* Título com gradiente */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-aurora via-viverblue to-operational bg-clip-text text-transparent">
                Descubra Conexões Estratégicas
              </h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                Nossa IA irá analisar seu perfil e gerar {isGenerating ? 'suas conexões mais relevantes...' : '50 matches personalizados para impulsionar seu negócio.'}
              </p>
            </div>

            {/* Botão melhorado */}
            <Button 
              onClick={() => generateMatches()}
              disabled={isGenerating}
              size="lg"
              className="gap-3 px-8 py-6 text-base font-semibold bg-gradient-to-r from-aurora to-viverblue hover:from-aurora/90 hover:to-viverblue/90 shadow-lg shadow-aurora/20 transition-all hover:shadow-xl hover:shadow-aurora/30 hover:scale-105"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analisando perfis... (até 30s)
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Gerar Conexões com IA
                </>
              )}
            </Button>

            {/* Features list */}
            {!isGenerating && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border/50">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-aurora">50+</div>
                  <div className="text-xs text-muted-foreground">Conexões IA</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-viverblue">100%</div>
                  <div className="text-xs text-muted-foreground">Personalizado</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-operational">Smart</div>
                  <div className="text-xs text-muted-foreground">Match Score</div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Networking AI | Viver de IA</title>
        <meta name="description" content="Descubra conexões estratégicas com IA na comunidade Viver de IA" />
      </Helmet>

      <div className="relative container py-8 space-y-8 overflow-hidden">
        {/* Aurora Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 left-1/4 w-96 h-96 bg-aurora/5 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-viverblue/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-1/2 left-1/2 w-96 h-96 bg-operational/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>

        {/* Header */}
        <div className="relative text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-aurora/10 border border-aurora/20 backdrop-blur-sm">
            <Network className="h-4 w-4 text-aurora" />
            <span className="text-xs font-medium text-aurora">Powered by Viver de IA</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-aurora via-viverblue to-operational bg-clip-text text-transparent">
            Networking com IA
          </h1>
          
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            Descubra conexões estratégicas com inteligência artificial
          </p>
          
          {/* Botão para forçar regeneração - mais sofisticado */}
          <div className="pt-2">
            <Button 
              onClick={() => generateMatches()}
              disabled={isGenerating}
              variant="outline"
              className="gap-2 border-aurora/30 hover:bg-aurora/5 hover:border-aurora/50 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-aurora" />
                  <span>Gerando conexões...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 text-aurora" />
                  <span>Gerar novas conexões</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Container com card centralizado e botões nas laterais */}
        <div className="relative max-w-5xl mx-auto flex items-center justify-center gap-8">
          
          {/* Botão ANTERIOR - Lateral ESQUERDA com cores mais escuras */}
          <Button
            onClick={previousCard}
            disabled={!hasPrevious}
            size="lg"
            className="h-20 w-20 rounded-full shadow-2xl bg-gradient-to-br from-[#0ABAB5] to-[#065F5D] hover:from-[#088A87] hover:to-[#044D4B] text-white border-0 disabled:opacity-20 transition-all shrink-0 hover:scale-110 disabled:hover:scale-100"
          >
            <ChevronLeft className="h-10 w-10" />
          </Button>

          {/* Card no centro */}
          <div className="flex-1 max-w-md">
            <SwipeCard 
              card={currentCard} 
              onOpenContact={() => setIsContactModalOpen(true)}
            />
          </div>

          {/* Botão PRÓXIMO - Lateral DIREITA com cores mais escuras */}
          <Button
            onClick={nextCard}
            disabled={!hasNext}
            size="lg"
            className="h-20 w-20 rounded-full shadow-2xl bg-gradient-to-br from-[#0ABAB5] via-[#088A87] to-[#065F5D] hover:from-[#088A87] hover:via-[#065F5D] hover:to-[#044D4B] hover:shadow-aurora/30 text-white border-0 disabled:opacity-20 transition-all shrink-0 hover:scale-110 disabled:hover:scale-100"
          >
            <ChevronRight className="h-10 w-10" />
          </Button>
        </div>

        {/* Contador abaixo do card - mais sofisticado */}
        <div className="relative text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full liquid-glass-card border border-aurora/20 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-aurora animate-pulse" />
              <span className="text-sm font-semibold text-foreground">
                {currentIndex + 1}
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm text-muted-foreground">
              de {totalCards}
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Contato */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        card={currentCard}
      />
    </>
  );
};

export default Networking;