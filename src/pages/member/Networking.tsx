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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-aurora via-aurora to-viverblue bg-clip-text text-transparent">
            Descubra Conexões Estratégicas
          </h1>
          <p className="text-muted-foreground text-sm">
            Matches personalizados por IA para o seu negócio
          </p>
        </div>

        {/* Main Swipe Card com controles integrados */}
        <div className="relative max-w-md mx-auto pb-24">
          <SwipeCard 
            card={currentCard} 
            onOpenContact={() => setIsContactModalOpen(true)}
          />

          {/* Controles de Navegação - Abaixo do card */}
          <div className="absolute -bottom-4 left-0 right-0 flex items-center justify-center gap-6">
            <Button
              onClick={previousCard}
              disabled={!hasPrevious}
              size="lg"
              className="h-16 w-16 rounded-full shadow-2xl bg-background hover:bg-accent border-2 border-border disabled:opacity-20 transition-all"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            
            {/* Contador numérico */}
            <div className="text-sm font-medium text-muted-foreground px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-border/50">
              {currentIndex + 1} / {totalCards}
            </div>
            
            <Button
              onClick={nextCard}
              disabled={!hasNext}
              size="lg"
              className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-aurora to-viverblue hover:opacity-90 text-white disabled:opacity-20 transition-all"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
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