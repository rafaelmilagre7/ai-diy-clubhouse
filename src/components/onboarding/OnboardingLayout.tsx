import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  onPrevious?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  isLoading?: boolean;
  loadingMessage?: string;
  canProceed?: boolean;
  completedSteps: number[];
}
export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  currentStep,
  totalSteps,
  title,
  subtitle,
  onPrevious,
  onNext,
  nextLabel = 'Continuar',
  isLoading = false,
  loadingMessage = 'Carregando...',
  canProceed = true,
  completedSteps
}) => {
  const progressPercentage = completedSteps.length / totalSteps * 100;
  return <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-blur-circle h-blur-circle bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-[spin_20s_linear_infinite]" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">VIA</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Configuração Inicial
                </h1>
              </div>
            </div>

            {/* Progress Steps - Condicional para não mostrar no step 0 */}
            {currentStep > 0 && (
              <div className="flex items-center space-x-3">
                {Array.from({
                length: totalSteps
              }, (_, i) => i + 1).map(step => <div key={step} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${completedSteps.includes(step) ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : step === currentStep ? 'bg-primary/20 text-primary border-2 border-primary/30' : 'bg-muted text-muted-foreground'}`}>
                    {completedSteps.includes(step) ? <Check className="w-4 h-4" /> : step}
                  </div>)}
              </div>
            )}
          </div>

          {/* Progress Bar - Condicional para não mostrar no step 0 */}
          {currentStep > 0 && (
            <div className="mt-4">
              <Progress value={progressPercentage} className="h-2 bg-muted" />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Etapa {currentStep} de {totalSteps}</span>
                <span>{Math.round(progressPercentage)}% completo</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-6 min-h-viewport-onboarding flex items-center">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="max-w-5xl mx-auto w-full">
          {/* Step Header - Condicional para não mostrar no step 0 */}
          {currentStep > 0 && (
            <div className="text-center mb-8">
              <motion.div initial={{
              scale: 0.8,
              opacity: 0
            }} animate={{
              scale: 1,
              opacity: 1
            }} transition={{
              delay: 0.2,
              duration: 0.5
            }} className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-2xl shadow-primary/25">
                <span className="text-xl font-bold text-primary-foreground">
                  {currentStep}
                </span>
              </motion.div>

              <motion.h2 initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.3,
              duration: 0.5
            }} className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {title}
              </motion.h2>

              <motion.p initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.4,
              duration: 0.5
            }} className="text-base sm:text-lg text-muted-foreground">
                {subtitle}
              </motion.p>
            </div>
          )}

          {/* Step Content */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.5,
          duration: 0.5
        }} className={currentStep === 0 ? "" : "bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 p-6 sm:p-8 shadow-2xl shadow-black/5"}>
            {children}
          </motion.div>

          {/* Navigation - Escondido no step 0 */}
          {currentStep > 0 && (
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.6,
            duration: 0.5
          }} className="flex items-center justify-between mt-8">
              <Button variant="ghost" onClick={onPrevious} disabled={currentStep === 1} className="group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar
              </Button>

              {onNext && (
                <Button 
                  onClick={onNext} 
                  disabled={!canProceed || isLoading}
                  className="group bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {loadingMessage}
                    </>
                  ) : (
                    <>
                      {nextLabel}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>;
};