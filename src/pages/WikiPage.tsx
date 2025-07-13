import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, BookOpen, Clock, Eye, Tag, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useWikiCategories, useWikiArticles, useFeaturedWikiArticles } from "@/hooks/useWiki";
import { WikiCategoryCard } from "@/components/wiki/WikiCategoryCard";
import { WikiArticleCard } from "@/components/wiki/WikiArticleCard";
import { FeaturedArticles } from "@/components/wiki/FeaturedArticles";

export const WikiPage = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories, isLoading: categoriesLoading } = useWikiCategories();
  const { data: articles, isLoading: articlesLoading } = useWikiArticles(categorySlug, searchQuery);
  const { data: featuredArticles } = useFeaturedWikiArticles();

  const currentCategory = categories?.find(cat => cat.slug === categorySlug);
  const showingCategory = !!categorySlug;
  const showingSearch = !!searchQuery;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (categorySlug && value) {
      navigate('/wiki'); // Voltar para a página principal ao pesquisar
    }
  };

  const handleBackToCategories = () => {
    navigate('/wiki');
    setSearchQuery("");
  };

  if (categoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-muted rounded-lg mb-4"></div>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          {showingCategory && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToCategories}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">
            {showingCategory ? currentCategory?.name : "Wiki de IA"}
          </h1>
        </div>
        
        {!showingCategory && (
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Seu guia completo sobre Inteligência Artificial, Agentes, Automação e muito mais.
            Explore conceitos, aprenda sobre ferramentas e domine o futuro da tecnologia.
          </p>
        )}

        {showingCategory && currentCategory?.description && (
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {currentCategory.description}
          </p>
        )}

        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar artigos..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Featured Articles - Only show on main page */}
      {!showingCategory && !showingSearch && featuredArticles && featuredArticles.length > 0 && (
        <>
          <FeaturedArticles articles={featuredArticles} />
          <Separator />
        </>
      )}

      {/* Categories Grid - Only show on main page without search */}
      {!showingCategory && !showingSearch && (
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-center">Explore por Categoria</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories?.map((category) => (
              <WikiCategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      )}

      {/* Articles List - Show when in category or searching */}
      {(showingCategory || showingSearch) && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              {showingSearch ? `Resultados para "${searchQuery}"` : "Artigos"}
            </h2>
            <Badge variant="secondary">
              {articles?.length || 0} {articles?.length === 1 ? 'artigo' : 'artigos'}
            </Badge>
          </div>
          
          {articlesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-6 bg-muted rounded mb-4"></div>
                    <div className="h-16 bg-muted rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-4 w-16 bg-muted rounded"></div>
                      <div className="h-4 w-12 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <WikiArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum artigo encontrado</h3>
              <p className="text-muted-foreground">
                {showingSearch 
                  ? "Tente ajustar os termos da sua pesquisa"
                  : "Esta categoria ainda não possui artigos publicados"
                }
              </p>
            </Card>
          )}
        </div>
      )}

      {/* All Articles - Only show on main page without search */}
      {!showingCategory && !showingSearch && (
        <>
          <Separator />
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-center">Artigos Recentes</h2>
            {articlesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-6 bg-muted rounded mb-4"></div>
                      <div className="h-16 bg-muted rounded mb-4"></div>
                      <div className="flex gap-2">
                        <div className="h-4 w-16 bg-muted rounded"></div>
                        <div className="h-4 w-12 bg-muted rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles?.slice(0, 9).map((article) => (
                  <WikiArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};