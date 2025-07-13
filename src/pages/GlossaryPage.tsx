import React, { useState } from "react";
import { useGlossaryCategories, useGlossaryTerms } from "@/hooks/useGlossary";
import { GlossaryCategoryCard } from "@/components/glossary/GlossaryCategoryCard";
import { GlossaryTermCard } from "@/components/glossary/GlossaryTermCard";
import { FeaturedTerms } from "@/components/glossary/FeaturedTerms";
import { Input } from "@/components/ui/input";
import { Search, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const GlossaryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  
  const { data: categories, isLoading: categoriesLoading } = useGlossaryCategories();
  const { data: terms, isLoading: termsLoading } = useGlossaryTerms(selectedCategory, searchTerm);

  const selectedCategoryData = categories?.find(cat => cat.slug === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Glossário de IA
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Seu dicionário completo de termos e conceitos de Inteligência Artificial
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar termos, definições..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Category Filter */}
      {!searchTerm && (
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge 
            variant={!selectedCategory ? "default" : "outline"}
            className="cursor-pointer px-4 py-2"
            onClick={() => setSelectedCategory(undefined)}
          >
            Todos
          </Badge>
          {categories?.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.slug ? "default" : "outline"}
              className="cursor-pointer px-4 py-2"
              onClick={() => setSelectedCategory(category.slug)}
              style={{ 
                borderColor: selectedCategory === category.slug ? category.color : undefined,
                backgroundColor: selectedCategory === category.slug ? category.color : undefined
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
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold" style={{ color: selectedCategoryData.color }}>
            {selectedCategoryData.name}
          </h2>
          <p className="text-muted-foreground">{selectedCategoryData.description}</p>
        </div>
      )}

      {/* Search Results or Category Terms */}
      {searchTerm || selectedCategory ? (
        <div className="space-y-6">
          {searchTerm && (
            <div className="text-center">
              <h2 className="text-xl font-semibold">
                Resultados para "{searchTerm}"
              </h2>
              <p className="text-muted-foreground">
                {terms?.length || 0} termos encontrados
              </p>
            </div>
          )}
          
          <div className="grid gap-4 md:gap-6">
            {termsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Carregando termos...</p>
              </div>
            ) : terms && terms.length > 0 ? (
              terms.map((term) => (
                <GlossaryTermCard key={term.id} term={term} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum termo encontrado</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Categories Grid */
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">Categorias</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoriesLoading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Carregando categorias...</p>
              </div>
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
  );
};