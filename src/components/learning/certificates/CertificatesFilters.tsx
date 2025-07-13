
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, SortDesc } from "lucide-react";
import { motion } from "framer-motion";

interface CertificatesFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export const CertificatesFilters = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange
}: CertificatesFiltersProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl p-6 bg-card/50 backdrop-blur-sm border border-border/50"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              <Input
                placeholder="Buscar certificados por nome..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 h-12 bg-background/80 border-border/50 hover:border-primary/50 focus:border-primary transition-all duration-300"
              />
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 lg:w-auto">
            {/* Filtro por Categoria */}
            <div className="w-full sm:w-48">
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="h-12 bg-background/80 border-border/50 hover:border-primary/50 transition-all duration-300">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
                  <SelectItem value="all">📋 Todas as categorias</SelectItem>
                  <SelectItem value="courses">📚 Cursos</SelectItem>
                  <SelectItem value="solutions">💡 Soluções</SelectItem>
                  <SelectItem value="receita">💰 Receita</SelectItem>
                  <SelectItem value="operacional">⚙️ Operacional</SelectItem>
                  <SelectItem value="estrategia">🎯 Estratégia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Ordenação */}
            <div className="w-full sm:w-48">
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="h-12 bg-background/80 border-border/50 hover:border-primary/50 transition-all duration-300">
                  <SortDesc className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
                  <SelectItem value="recent">🕒 Mais Recentes</SelectItem>
                  <SelectItem value="oldest">📅 Mais Antigos</SelectItem>
                  <SelectItem value="name">🔤 Nome A-Z</SelectItem>
                  <SelectItem value="name-desc">🔤 Nome Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
