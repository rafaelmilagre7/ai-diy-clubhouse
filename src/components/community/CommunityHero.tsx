
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, Users, PlusCircle } from "lucide-react";
import { CreateTopicDialog } from "./CreateTopicDialog";
import { useState } from "react";
import { CommunityFilterType } from "@/types/communityTypes";
import { cn } from "@/lib/utils";

interface CommunityHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: CommunityFilterType;
  onFilterChange: (filter: CommunityFilterType) => void;
}

export const CommunityHero = ({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange
}: CommunityHeroProps) => {
  const [createTopicOpen, setCreateTopicOpen] = useState(false);

  const filterOptions = [
    { key: "recentes" as CommunityFilterType, label: "Recentes", icon: MessageSquare },
    { key: "populares" as CommunityFilterType, label: "Populares", icon: Users },
    { key: "sem-respostas" as CommunityFilterType, label: "Sem Respostas", icon: MessageSquare },
  ];

  return (
    <div className="relative overflow-hidden animate-fade-in">
      {/* Hero Background - Novo design claro e vibrante */}
      <div className="absolute inset-0">
        {/* Gradiente base suave */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background"></div>
        
        {/* Efeitos de luz Aurora */}
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
        </div>
        
        {/* Grid pattern sutil */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
      </div>
      
      {/* Content */}
      <div className="relative px-4 md:px-8 py-12 md:py-16 text-center">
        {/* Title with Better Contrast */}
        <div className="mb-8">
          {/* Badge superior */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Comunidade Exclusiva</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Comunidade VIVER DE IA
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed font-light">
            Conecte-se, compartilhe conhecimento e construa o futuro da IA junto com nossa comunidade exclusiva
          </p>
        </div>

        {/* Enhanced Search Bar with Glassmorphism */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative group">
            {/* Glow effect apenas no hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
            
            {/* Card glassmorphism */}
            <div className="relative bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-lg overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Buscar discussões, tópicos ou membros..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="border-0 bg-transparent text-base placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:outline-none flex-1"
                />
                <Button 
                  onClick={() => setCreateTopicOpen(true)}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-6 py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 flex-shrink-0"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Criar Tópico</span>
                  <span className="sm:hidden">Criar</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Filter Tags */}
        <div className="flex flex-wrap justify-center gap-3">
          {filterOptions.map((filter) => {
            const Icon = filter.icon;
            const isActive = selectedFilter === filter.key;
            
            return (
              <Badge
                key={filter.key}
                variant={isActive ? "default" : "secondary"}
                className={cn(
                  "px-4 py-2 cursor-pointer transition-all duration-300 border",
                  isActive 
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-105" 
                    : "bg-card/60 backdrop-blur-sm hover:bg-card border-border hover:border-primary/30 hover:scale-105"
                )}
                onClick={() => onFilterChange(filter.key)}
              >
                <Icon className="h-3.5 w-3.5 mr-2" />
                {filter.label}
              </Badge>
            );
          })}
        </div>
      </div>

      <CreateTopicDialog open={createTopicOpen} onOpenChange={setCreateTopicOpen} />
    </div>
  );
};
