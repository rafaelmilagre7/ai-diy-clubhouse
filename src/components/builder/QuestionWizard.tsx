import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { cn } from '@/lib/utils';

interface Question {
  category: string;
  question: string;
  why_important: string;
}

interface QuestionWizardProps {
  questions: Question[];
  onComplete: (answers: Array<{ question: string; answer: string }>) => void;
  onCancel: () => void;
}

export const QuestionWizard: React.FC<QuestionWizardProps> = ({
  questions,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(''));
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const isLastStep = currentStep === questions.length - 1;
  const canProceed = answers[currentStep]?.trim().length >= 10;

  const handleNext = () => {
    if (!canProceed) return;
    
    if (isLastStep) {
      const formattedAnswers = questions.map((q, idx) => ({
        question: q.question,
        answer: answers[idx],
      }));
      onComplete(formattedAnswers);
    } else {
      setDirection('forward');
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection('backward');
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = value;
    setAnswers(newAnswers);
  };

  const variants = {
    enter: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background via-background to-surface-elevated/20">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="h-6 w-6 text-aurora-primary" />
            <h2 className="text-2xl font-bold">Miracle AI</h2>
          </div>
          <p className="text-muted-foreground">
            Vamos entender melhor sua ideia para criar uma solução DEVASTADORA
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">
              Pergunta {currentStep + 1} de {questions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress 
            value={progress} 
            className="h-2"
            indicatorClassName="bg-gradient-to-r from-aurora-primary via-aurora-primary-light to-aurora-primary"
          />
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <LiquidGlassCard className="p-6 mb-6">
              {/* Category Badge */}
              <div className="flex items-start justify-between mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-aurora-primary/10 text-aurora-primary border border-aurora-primary/20">
                  {currentQuestion.category.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs text-muted-foreground">
                  {answers.filter(a => a.trim().length >= 10).length}/{questions.length} respondidas
                </span>
              </div>

              {/* Question */}
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {currentQuestion.question}
              </h3>

              {/* Why Important */}
              <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-sm text-muted-foreground">
                  💡 <span className="font-medium">Por que isso importa:</span> {currentQuestion.why_important}
                </p>
              </div>

              {/* Answer Input */}
              <Textarea
                value={answers[currentStep]}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Digite sua resposta aqui... (mínimo 10 caracteres)"
                className="min-h-[120px] resize-none"
                autoFocus
              />

              {/* Character Counter */}
              <div className="mt-2 flex justify-between items-center">
                <p className={cn(
                  "text-xs transition-colors",
                  answers[currentStep]?.length >= 10 
                    ? "text-status-success" 
                    : "text-muted-foreground"
                )}>
                  {answers[currentStep]?.length || 0} caracteres
                  {answers[currentStep]?.length >= 10 && " ✓"}
                </p>
              </div>
            </LiquidGlassCard>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3"
        >
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancelar
          </Button>

          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex-1"
          >
            {isLastStep ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Finalizar e Gerar
              </>
            ) : (
              <>
                Próxima
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </motion.div>

        {/* Steps Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-2 mt-6"
        >
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                idx === currentStep 
                  ? "w-8 bg-aurora-primary" 
                  : idx < currentStep
                  ? "w-2 bg-aurora-primary/50"
                  : "w-2 bg-muted"
              )}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};
