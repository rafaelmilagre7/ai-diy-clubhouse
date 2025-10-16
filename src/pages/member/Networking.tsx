import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSwipeCards } from "@/hooks/networking/useSwipeCards";
import { SwipeCard } from "@/components/networking/swipe/SwipeCard";
import { LoadMoreCard } from "@/components/networking/swipe/LoadMoreCard";
import { ContactModal } from "@/components/networking/modals/ContactModal";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Network, Brain } from "lucide-react";
import { motion } from "framer-motion";

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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="liquid-glass-card rounded-3xl p-12 border border-aurora/20 backdrop-blur-xl shadow-2xl">
              {/* Ícone decorativo melhorado */}
              <div className="flex justify-center mb-8">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-aurora via-viverblue to-operational opacity-20 blur-2xl rounded-full"></div>
                  <div className="relative inline-flex p-8 rounded-3xl bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm border border-aurora/30 shadow-lg">
                    <svg className="h-20 w-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(var(--aurora))" />
                          <stop offset="50%" stopColor="hsl(var(--viverblue))" />
                          <stop offset="100%" stopColor="hsl(var(--operational))" />
                        </linearGradient>
                      </defs>
                      <path d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" stroke="url(#iconGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </motion.div>
              </div>

              {/* Título com gradiente suave */}
              <div className="space-y-4 text-center mb-8">
                <h2 className="text-4xl font-heading font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
                  Descubra Conexões Estratégicas
                </h2>
                <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
                  {isGenerating 
                    ? 'Nossa IA está analisando perfis e criando suas conexões mais relevantes...' 
                    : 'Nossa IA analisará seu perfil e gerará matches personalizados para impulsionar seu negócio.'
                  }
                </p>
              </div>

              {/* Botão Via Aurora Style */}
              <div className="flex flex-col items-center gap-3 mb-8">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={() => generateMatches()}
                    disabled={isGenerating}
                    size="lg"
                    className="relative overflow-hidden gap-3 px-10 py-7 text-lg font-semibold bg-gradient-to-r from-aurora via-viverblue to-operational hover:from-aurora/90 hover:via-viverblue/90 hover:to-operational/90 text-white border-0 shadow-xl hover:shadow-2xl transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin relative z-10" />
                        <span className="relative z-10">Analisando perfis... (até 30s)</span>
                      </>
                    ) : (
                      <>
                        <Brain className="h-5 w-5 relative z-10" />
                        <span className="relative z-10">Gerar Conexões com IA</span>
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>

              {/* Features list com estilo Via Aurora */}
              {!isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-border/30"
                >
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold bg-gradient-to-r from-aurora to-aurora/80 bg-clip-text text-transparent">50+</div>
                    <div className="text-sm text-muted-foreground">Conexões Inteligentes</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold bg-gradient-to-r from-viverblue to-viverblue/80 bg-clip-text text-transparent">100%</div>
                    <div className="text-sm text-muted-foreground">Personalizado</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold bg-gradient-to-r from-operational to-operational/80 bg-clip-text text-transparent">IA</div>
                    <div className="text-sm text-muted-foreground">Match Score</div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
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

      <div className="relative container py-4 space-y-4 overflow-hidden">
        {/* Aurora Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 left-1/4 w-96 h-96 bg-aurora/5 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-viverblue/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-1/2 left-1/2 w-96 h-96 bg-operational/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>

        {/* Header Compacto */}
        <div className="relative text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-aurora/10 border border-aurora/20 backdrop-blur-sm">
            <Network className="h-4 w-4 text-aurora" />
            <span className="text-xs font-medium text-aurora">Powered by Viver de IA</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-aurora via-viverblue to-operational bg-clip-text text-transparent">
            Networking com IA
          </h1>
          
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
            Descubra conexões estratégicas com inteligência artificial
          </p>
        </div>

        {/* Container com card centralizado e botões nas laterais */}
        <div className="relative max-w-5xl mx-auto flex items-center justify-center gap-8">
          
          {/* Botão ANTERIOR - Lateral ESQUERDA com cores mais escuras */}
          <Button
            onClick={previousCard}
            disabled={!hasPrevious}
            size="lg"
            className="h-20 w-20 rounded-full shadow-2xl bg-gradient-to-br from-aurora-primary to-aurora-primary-dark hover:from-aurora-primary/90 hover:to-aurora-primary-dark/90 text-white border-0 disabled:opacity-20 transition-all shrink-0 hover:scale-110 disabled:hover:scale-100"
          >
            <ChevronLeft className="h-10 w-10" />
          </Button>

          {/* Card no centro ou LoadMore no último */}
          <div className="flex-1 max-w-md">
            {currentIndex === totalCards - 1 ? (
              <LoadMoreCard 
                onGenerateMore={() => generateMatches()}
                isGenerating={isGenerating}
              />
            ) : (
              <SwipeCard 
                card={currentCard} 
                onOpenContact={() => setIsContactModalOpen(true)}
                onNext={nextCard}
                onPrevious={previousCard}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
              />
            )}
          </div>

          {/* Botão PRÓXIMO - Lateral DIREITA com cores mais escuras */}
          <Button
            onClick={nextCard}
            disabled={!hasNext}
            size="lg"
            className="h-20 w-20 rounded-full shadow-2xl bg-gradient-to-br from-aurora-primary via-aurora-primary-dark to-aurora-primary-dark hover:from-aurora-primary/90 hover:via-aurora-primary-dark/90 hover:to-aurora-primary-dark/90 hover:shadow-aurora/30 text-white border-0 disabled:opacity-20 transition-all shrink-0 hover:scale-110 disabled:hover:scale-100"
          >
            <ChevronRight className="h-10 w-10" />
          </Button>
        </div>

        {/* Contador abaixo do card - mais sofisticado */}
        <div className="relative text-center space-y-3">
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