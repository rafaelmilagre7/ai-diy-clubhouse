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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            Networking AI
          </h1>
          <p className="text-muted-foreground">
            Conexão {currentIndex + 1} de {totalCards}
          </p>
        </div>

        {/* Main Swipe Card */}
        <div className="relative">
          <SwipeCard 
            card={currentCard} 
            onOpenContact={() => setIsContactModalOpen(true)}
          />

          {/* Botões de Navegação */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none px-4">
            <Button
              onClick={previousCard}
              disabled={!hasPrevious}
              variant="outline"
              size="icon"
              className="pointer-events-auto h-12 w-12 rounded-full shadow-lg bg-background/95 backdrop-blur"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              onClick={nextCard}
              disabled={!hasNext}
              variant="outline"
              size="icon"
              className="pointer-events-auto h-12 w-12 rounded-full shadow-lg bg-background/95 backdrop-blur"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Indicador de Progresso */}
        <div className="flex gap-1 justify-center max-w-2xl mx-auto">
          {Array.from({ length: Math.min(totalCards, 10) }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
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