import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Clock, X, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GlobalSearchHeroProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
  isLoading?: boolean;
  totalResults?: number;
  onRefresh?: () => void;
}

export const GlobalSearchHero: React.FC<GlobalSearchHeroProps> = ({
  onSearchChange,
  searchQuery,
  isLoading = false,
  totalResults = 0,
  onRefresh
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onSearchChange("");
  };

  const hasResults = searchQuery.length > 0;


  return (
    <div className="relative">
      {/* Background gradiente */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-aurora/10 rounded-2xl blur-xl" />
      
      <Card className="relative p-8 border-0 bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="p-3 bg-primary/10 rounded-xl">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Encontre qualquer aula
            </h2>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Busque por qualquer tópico, curso ou aula específica. Nossa busca inteligente encontra exatamente o que você precisa.
          </motion.p>
        </div>

        {/* Barra de busca principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative mb-6"
        >
          <div className={`relative transition-all duration-300 ${
            isFocused ? 'scale-105 shadow-2xl shadow-primary/20' : ''
          }`}>
            <div className="absolute left-6 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <Search className={`h-6 w-6 transition-colors duration-200 ${
                isFocused ? 'text-primary' : 'text-muted-foreground'
              }`} />
              {isLoading && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            
            <Input
              type="text"
              placeholder="Ex: 'IA para dashboard', 'programação', 'automação'..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`pl-16 pr-16 h-16 text-lg bg-background/50 backdrop-blur-sm border-2 transition-all duration-300 ${
                isFocused 
                  ? 'border-primary/60 shadow-lg shadow-primary/10' 
                  : 'border-border/50 hover:border-primary/40'
              }`}
            />
            
            <AnimatePresence>
              {hasResults && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2"
                >
                  <div className="text-sm text-muted-foreground bg-muted/80 px-3 py-1 rounded-full">
                    {totalResults} resultado{totalResults !== 1 ? 's' : ''}
                  </div>
                  {onRefresh && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRefresh}
                      className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-full"
                      title="Atualizar resultados"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full"
                    title="Limpar busca"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>


        {/* Estatísticas da busca */}
        <AnimatePresence>
          {hasResults && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/30"
            >
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>
                    <span className="font-bold text-primary">{totalResults}</span> aulas encontradas
                  </span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Busca em tempo real</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};