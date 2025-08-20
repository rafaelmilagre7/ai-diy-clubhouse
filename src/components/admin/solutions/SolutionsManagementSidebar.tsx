import React from "react";
import { Search, Filter, RotateCcw, BookOpen, Globe, Clock, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";

interface SolutionsManagementSidebarProps {
  filters: {
    searchTerm: string;
    category: string;
    status: string;
    difficulty: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onResetFilters: () => void;
  totalSolutions: number;
  filteredCount: number;
}

export const SolutionsManagementSidebar = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalSolutions,
  filteredCount
}: SolutionsManagementSidebarProps) => {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-5 w-5" />
          <h2 className="font-semibold">Filtros</h2>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filteredCount} de {totalSolutions}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onResetFilters}
            className="h-auto p-1"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        {/* Search */}
        <SidebarGroup>
          <SidebarGroupLabel>Busca</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar soluções..."
                value={filters.searchTerm}
                onChange={(e) => onFilterChange('searchTerm', e.target.value)}
                className="pl-8"
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-4" />

        {/* Status Filter */}
        <SidebarGroup>
          <SidebarGroupLabel>Status</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2">
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant={filters.status === 'all' ? 'default' : 'ghost'}
                className="justify-start gap-2 h-8"
                onClick={() => onFilterChange('status', 'all')}
              >
                <BookOpen className="h-4 w-4" />
                Todas
              </Button>
              <Button
                variant={filters.status === 'published' ? 'default' : 'ghost'}
                className="justify-start gap-2 h-8"
                onClick={() => onFilterChange('status', 'published')}
              >
                <Globe className="h-4 w-4" />
                Publicadas
              </Button>
              <Button
                variant={filters.status === 'draft' ? 'default' : 'ghost'}
                className="justify-start gap-2 h-8"
                onClick={() => onFilterChange('status', 'draft')}
              >
                <Clock className="h-4 w-4" />
                Rascunhos
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-4" />

        {/* Category Filter */}
        <SidebarGroup>
          <SidebarGroupLabel>Categoria</SidebarGroupLabel>
          <SidebarGroupContent>
            <Select value={filters.category} onValueChange={(value) => onFilterChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="automation">Automação</SelectItem>
                <SelectItem value="productivity">Produtividade</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Vendas</SelectItem>
                <SelectItem value="finance">Financeiro</SelectItem>
                <SelectItem value="operations">Operações</SelectItem>
              </SelectContent>
            </Select>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-4" />

        {/* Difficulty Filter */}
        <SidebarGroup>
          <SidebarGroupLabel>Dificuldade</SidebarGroupLabel>
          <SidebarGroupContent>
            <Select value={filters.difficulty} onValueChange={(value) => onFilterChange('difficulty', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as dificuldades</SelectItem>
                <SelectItem value="beginner">Iniciante</SelectItem>
                <SelectItem value="intermediate">Intermediário</SelectItem>
                <SelectItem value="advanced">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};