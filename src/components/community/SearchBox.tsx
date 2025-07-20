
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  id: string;
  title: string;
  content_preview: string;
  category_name?: string;
  view_count: number;
}

interface SearchBoxProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBox = ({ 
  value, 
  onValueChange, 
  placeholder = "Pesquisar discussões, categorias..." 
}: SearchBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedSearchTerm = useDebounce(value, 300);

  // Carregar pesquisas recentes do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('communityRecentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Salvar pesquisa no histórico
  const saveSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('communityRecentSearches', JSON.stringify(updated));
  };

  // Buscar sugestões
  const { data: suggestions } = useQuery({
    queryKey: ['searchSuggestions', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm.trim() || debouncedSearchTerm.length < 2) return [];

      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          content,
          view_count,
          forum_categories:category_id(name)
        `)
        .or(`title.ilike.%${debouncedSearchTerm}%,content.ilike.%${debouncedSearchTerm}%`)
        .order('view_count', { ascending: false })
        .limit(5);

      if (error) return [];

      return data?.map(topic => ({
        id: topic.id,
        title: topic.title,
        content_preview: topic.content.substring(0, 100) + '...',
        category_name: (topic.forum_categories as any)?.name,
        view_count: topic.view_count || 0
      })) || [];
    },
    enabled: debouncedSearchTerm.length >= 2
  });

  const handleSearch = (searchTerm: string) => {
    onValueChange(searchTerm);
    saveSearch(searchTerm);
    setIsOpen(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('communityRecentSearches');
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 h-12 text-base bg-background/60 backdrop-blur-sm border-border/50 focus:bg-background focus:border-viverblue/50 transition-all"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onValueChange('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dropdown de sugestões */}
      {isOpen && (
        <>
          {/* Overlay para fechar */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          <Card className="absolute top-full left-0 right-0 mt-2 z-20 shadow-xl border-border/50 bg-background/95 backdrop-blur-md">
            <CardContent className="p-4">
              {/* Sugestões baseadas na busca */}
              {suggestions && suggestions.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Sugestões
                  </h4>
                  <div className="space-y-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSearch(suggestion.title)}
                        className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <div className="font-medium text-sm group-hover:text-viverblue transition-colors">
                          {suggestion.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {suggestion.content_preview}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {suggestion.category_name && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">
                              {suggestion.category_name}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {suggestion.view_count} visualizações
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pesquisas recentes */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Pesquisas recentes
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRecentSearches}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Limpar
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Estado vazio */}
              {(!suggestions || suggestions.length === 0) && recentSearches.length === 0 && (
                <div className="text-center py-4">
                  <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Digite para pesquisar na comunidade
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
