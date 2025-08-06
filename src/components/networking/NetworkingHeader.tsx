import { Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useNetworkingStats } from '@/hooks/useNetworkingStats';

interface NetworkingHeaderProps {
  // Removidas props de tab já que agora só temos uma seção
}

export const NetworkingHeader = ({}: NetworkingHeaderProps) => {
  const { data: stats } = useNetworkingStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
              <Brain className="relative h-8 w-8 text-primary" />
            </div>
            Networking AI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Sua IA especialista em networking empresarial e parcerias estratégicas
          </p>
        </div>
        
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative bg-primary/10 backdrop-blur border border-primary/30 rounded-xl px-4 py-2">
            <div className="flex items-center gap-2 text-primary font-medium">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              ✨ Powered by AI
            </div>
          </div>
        </div>
      </div>

      {/* Header com contador de matches */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative bg-card/80 backdrop-blur-xl border border-border/30 rounded-2xl p-6 shadow-xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3"
          >
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Matches IA</span>
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
              {stats?.matches || 0} matches
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};