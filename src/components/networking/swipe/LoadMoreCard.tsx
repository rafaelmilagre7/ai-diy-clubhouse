import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Brain, Loader2, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoadMoreCardProps {
  onGenerateMore: () => void;
  isGenerating: boolean;
}

export const LoadMoreCard = ({ onGenerateMore, isGenerating }: LoadMoreCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <LiquidGlassCard 
        className="w-full h-calendar flex flex-col items-center justify-center p-8 text-center"
        variant="premium"
        hoverable={false}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Users className="h-16 w-16 text-aurora mb-6" />
        </motion.div>
        
        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-aurora to-viverblue bg-clip-text text-transparent">
          Chegou ao fim das conexões
        </h3>
        
        <p className="text-muted-foreground mb-8 max-w-sm">
          Gere mais recomendações personalizadas com base no seu perfil
        </p>
        
        <Button
          onClick={onGenerateMore}
          disabled={isGenerating}
          size="lg"
          className="gap-2 bg-gradient-to-r from-aurora to-viverblue hover:from-aurora/90 hover:to-viverblue/90 text-white shadow-lg hover:shadow-xl transition-all px-8"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Gerando...</span>
            </>
          ) : (
            <>
              <Brain className="h-5 w-5" />
              <span>Gerar Mais Conexões</span>
            </>
          )}
        </Button>
      </LiquidGlassCard>
    </motion.div>
  );
};
