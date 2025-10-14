import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSwipeCards } from "@/hooks/networking/useSwipeCards";
import { SwipeCard } from "@/components/networking/swipe/SwipeCard";
import { ContactModal } from "@/components/networking/modals/ContactModal";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, Sparkles } from "lucide-react";
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

        <div className="container py-12 flex items-center justify-center min-h-[70vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando suas conexões estratégicas...</p>
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

        <div className="container py-12">
          <Card className="max-w-2xl mx-auto p-12 text-center space-y-6">
            <div className="flex justify-center">
              <Sparkles className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Nenhuma conexão disponível no momento</h2>
            <p className="text-muted-foreground">
              Estamos preparando conexões estratégicas para você. Volte em breve!
            </p>
            <Button onClick={refetch} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
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

      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-aurora via-aurora to-viverblue bg-clip-text text-transparent">
            Descubra Conexões Estratégicas
          </h1>
          <p className="text-muted-foreground text-sm">
            Matches personalizados por IA para o seu negócio
          </p>
          
          {/* Botão para forçar regeneração */}
          <div className="pt-4">
            <Button 
              onClick={() => generateMatches()}
              disabled={isGenerating}
              variant="outline"
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando conexões...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Gerar novas conexões
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Container com card centralizado e botões nas laterais */}
        <div className="relative max-w-4xl mx-auto flex items-center justify-center gap-6">
          
          {/* Botão ANTERIOR - Lateral ESQUERDA */}
          <Button
            onClick={previousCard}
            disabled={!hasPrevious}
            size="lg"
            className="h-20 w-20 rounded-full shadow-2xl bg-background hover:bg-accent border-2 border-border disabled:opacity-20 transition-all shrink-0"
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

          {/* Botão PRÓXIMO - Lateral DIREITA */}
          <Button
            onClick={nextCard}
            disabled={!hasNext}
            size="lg"
            className="h-20 w-20 rounded-full shadow-2xl bg-gradient-to-r from-aurora to-viverblue hover:opacity-90 text-white disabled:opacity-20 transition-all shrink-0"
          >
            <ChevronRight className="h-10 w-10" />
          </Button>
        </div>

        {/* Contador abaixo do card */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-border/50">
            <span className="text-sm font-medium text-muted-foreground">
              {currentIndex + 1} / {totalCards}
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