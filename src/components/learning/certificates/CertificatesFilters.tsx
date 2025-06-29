
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, SortAsc } from "lucide-react";

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
    <div className="bg-[#151823]/80 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar certificados..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-[#1A1E2E] border-neutral-600 text-white placeholder:text-gray-400"
          />
        </div>
        
        {/* Filtro por Categoria */}
        <div className="w-full md:w-48">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="bg-[#1A1E2E] border-neutral-600 text-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1E2E] border-neutral-600">
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="courses">Cursos</SelectItem>
              <SelectItem value="solutions">Soluções</SelectItem>
              <SelectItem value="receita">Receita</SelectItem>
              <SelectItem value="operacional">Operacional</SelectItem>
              <SelectItem value="estrategia">Estratégia</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Ordenação */}
        <div className="w-full md:w-48">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="bg-[#1A1E2E] border-neutral-600 text-white">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1E2E] border-neutral-600">
              <SelectItem value="recent">Mais Recentes</SelectItem>
              <SelectItem value="oldest">Mais Antigos</SelectItem>
              <SelectItem value="name">Nome A-Z</SelectItem>
              <SelectItem value="name-desc">Nome Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
