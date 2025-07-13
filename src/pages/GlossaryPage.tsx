import React, { useState } from "react";
import { useGlossaryCategories, useGlossaryTerms } from "@/hooks/useGlossary";
import { GlossaryCategoryCard } from "@/components/glossary/GlossaryCategoryCard";
import { GlossaryTermCard } from "@/components/glossary/GlossaryTermCard";
import { FeaturedTerms } from "@/components/glossary/FeaturedTerms";
import { Input } from "@/components/ui/input";
import { Search, Brain, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const GlossaryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  
  const { data: categories, isLoading: categoriesLoading } = useGlossaryCategories();
  const { data: terms, isLoading: termsLoading } = useGlossaryTerms(selectedCategory, searchTerm);

  const selectedCategoryData = categories?.find(cat => cat.slug === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Hero Header */}
        <div className="text-center space-y-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl blur-3xl -z-10"></div>
          
          <div className="relative">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <Brain className="h-12 w-12 text-primary" />
                <Sparkles className="h-6 w-6 text-primary/60 absolute -top-2 -right-2 animate-pulse" />
              </div>
              <div className="text-left">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                  Glossário IA
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Zap className="h-4 w-4 text-primary/70" />
                  <span className="text-sm text-primary/70 font-medium">Inteligência para Empresários</span>
                </div>
              </div>
            </div>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Domine os conceitos essenciais de Inteligência Artificial.<br />
              <span className="text-primary font-semibold">Explicações diretas, exemplos práticos, resultados reais.</span>
            </p>
          </div>
        </div>

        {/* Advanced Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Pesquisar conceitos de IA..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 h-14 text-lg bg-transparent border-0 focus-visible:ring-0 placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        {!searchTerm && (
          <div className="flex flex-wrap gap-3 justify-center">
            <Badge 
              variant={!selectedCategory ? "default" : "outline"}
              className="cursor-pointer px-6 py-3 text-sm font-medium rounded-full border-2 transition-all duration-200 hover:scale-105"
              onClick={() => setSelectedCategory(undefined)}
            >
              Todos os Conceitos
            </Badge>
            {categories?.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                className="cursor-pointer px-6 py-3 text-sm font-medium rounded-full border-2 transition-all duration-200 hover:scale-105"
                onClick={() => setSelectedCategory(category.slug)}
                style={{ 
                  borderColor: selectedCategory === category.slug ? category.color : undefined,
                  backgroundColor: selectedCategory === category.slug ? category.color : undefined,
                  color: selectedCategory === category.slug ? 'white' : category.color
                }}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Featured Terms */}
        {!searchTerm && !selectedCategory && <FeaturedTerms />}

        {/* Selected Category Header */}
        {selectedCategoryData && !searchTerm && (
          <div className="text-center space-y-4 py-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card/50 border border-border/50">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: selectedCategoryData.color }}
              ></div>
              <h2 className="text-2xl font-bold" style={{ color: selectedCategoryData.color }}>
                {selectedCategoryData.name}
              </h2>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {selectedCategoryData.description}
            </p>
          </div>
        )}

        {/* Search Results or Category Terms */}
        {searchTerm || selectedCategory ? (
          <div className="space-y-8">
            {searchTerm && (
              <div className="text-center py-4">
                <h2 className="text-2xl font-bold mb-2">
                  Resultados para <span className="text-primary">"{searchTerm}"</span>
                </h2>
                <p className="text-muted-foreground">
                  {terms?.length || 0} conceitos encontrados
                </p>
              </div>
            )}
            
            <div className="grid gap-6 lg:gap-8">
              {termsLoading ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando conceitos...</p>
                </div>
              ) : terms && terms.length > 0 ? (
                terms.map((term) => (
                  <GlossaryTermCard key={term.id} term={term} />
                ))
              ) : (
                <div className="text-center py-16">
                  <Brain className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">Nenhum conceito encontrado</p>
                  <p className="text-sm text-muted-foreground/70">Tente pesquisar com outros termos</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Categories Grid */
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Categorias de Conhecimento</h2>
              <p className="text-muted-foreground text-lg">Explore os fundamentos da IA por área de aplicação</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoriesLoading ? (
                <>
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-48 bg-card/50 rounded-2xl animate-pulse"></div>
                  ))}
                </>
              ) : (
                categories?.map((category) => (
                  <GlossaryCategoryCard 
                    key={category.id} 
                    category={category} 
                    onClick={() => setSelectedCategory(category.slug)}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};