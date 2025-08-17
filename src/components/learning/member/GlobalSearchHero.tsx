import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, BookOpen, Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GlobalSearchHeroProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
  isLoading?: boolean;
  totalResults?: number;
}

export const GlobalSearchHero: React.FC<GlobalSearchHeroProps> = ({
  onSearchChange,
  searchQuery,
  isLoading = false,
  totalResults = 0
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onSearchChange("");
  };

  const hasResults = searchQuery.length > 0;

  // Sugestões de busca rápida
  const quickSearches = [
    { text: "Inteligência Artificial", icon: "🤖" },
    { text: "Dashboard", icon: "📊" },
    { text: "Programação", icon: "💻" },
    { text: "Analytics", icon: "📈" }
  ];

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
            <div className="p-3 bg-aurora/10 rounded-xl">
              <Sparkles className="h-6 w-6 text-aurora" />
            </div>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Sugestões de busca rápida */}
        <AnimatePresence>
          {!hasResults && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <span className="text-sm text-muted-foreground mb-2 sm:mb-0">Buscas populares:</span>
              {quickSearches.map((search, index) => (
                <motion.button
                  key={search.text}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSearchChange(search.text)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-muted/80 hover:bg-muted text-sm rounded-full transition-all duration-200 hover:shadow-md"
                >
                  <span>{search.icon}</span>
                  {search.text}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

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