
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, Target, BookOpen, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";

interface TrailFiltersBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export const TrailFiltersBar: React.FC<TrailFiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedType,
  onTypeChange,
  showFavoritesOnly,
  onToggleFavorites,
  onClearFilters,
  activeFiltersCount
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-gray-800 bg-gray-900/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search and main actions */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar soluções e aulas..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
                />
              </div>

              {/* Clear filters */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={onClearFilters}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                  <Badge className="ml-2 bg-viverblue/20 text-viverblue">
                    {activeFiltersCount}
                  </Badge>
                </Button>
              )}
            </div>

            {/* Filter options */}
            <div className="flex flex-wrap gap-3">
              {/* Type filter */}
              <Select value={selectedType} onValueChange={onTypeChange}>
                <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Tipo" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="solution">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Soluções
                    </div>
                  </SelectItem>
                  <SelectItem value="lesson">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Aulas
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Category filter */}
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-48 bg-gray-800/50 border-gray-700">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="Receita">Receita</SelectItem>
                  <SelectItem value="Operacional">Operacional</SelectItem>
                  <SelectItem value="Estratégia">Estratégia</SelectItem>
                </SelectContent>
              </Select>

              {/* Difficulty filter */}
              <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
                <SelectTrigger className="w-44 bg-gray-800/50 border-gray-700">
                  <SelectValue placeholder="Dificuldade" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">Todas as dificuldades</SelectItem>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>

              {/* Favorites toggle */}
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                onClick={onToggleFavorites}
                className={
                  showFavoritesOnly
                    ? "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                    : "border-gray-700 text-gray-300 hover:bg-gray-800"
                }
              >
                <Star className="h-4 w-4 mr-2" />
                Favoritos
              </Button>
            </div>

            {/* Active filters display */}
            {activeFiltersCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 pt-2 border-t border-gray-700"
              >
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  Filtros ativos:
                </span>
                
                {selectedType !== "all" && (
                  <Badge variant="outline" className="bg-viverblue/20 text-viverblue border-viverblue/30">
                    {selectedType === "solution" ? "Soluções" : "Aulas"}
                  </Badge>
                )}
                
                {selectedCategory !== "all" && (
                  <Badge variant="outline" className="bg-emerald-400/20 text-emerald-400 border-emerald-400/30">
                    {selectedCategory}
                  </Badge>
                )}
                
                {selectedDifficulty !== "all" && (
                  <Badge variant="outline" className="bg-amber-400/20 text-amber-400 border-amber-400/30">
                    {selectedDifficulty}
                  </Badge>
                )}
                
                {showFavoritesOnly && (
                  <Badge variant="outline" className="bg-red-400/20 text-red-400 border-red-400/30">
                    <Star className="h-3 w-3 mr-1" />
                    Favoritos
                  </Badge>
                )}
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
