
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, X, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  id: string;
  title: string;
  content: string;
  created_at: string;
  forum_categories?: Array<{
    name: string;
  }>;
  profiles?: Array<{
    name: string;
  }>;
}

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onCategoryFilter?: (category: string) => void;
}

export const SearchBox = ({ value, onChange, onCategoryFilter }: SearchBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(value, 300);

  // Carregar histórico do localStorage
  useEffect(() => {
    const history = localStorage.getItem('community-search-history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Buscar resultados em tempo real
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['searchTopics', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) return [];

      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          content,
          created_at,
          forum_categories:category_id(name),
          profiles:user_id(name)
        `)
        .or(`title.ilike.%${debouncedSearch}%,content.ilike.%${debouncedSearch}%`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: debouncedSearch.length >= 2
  });

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchTerm: string) => {
    onChange(searchTerm);
    setIsOpen(true);

    // Adicionar ao histórico se não for vazio
    if (searchTerm.trim() && !searchHistory.includes(searchTerm)) {
      const newHistory = [searchTerm, ...searchHistory.slice(0, 4)];
      setSearchHistory(newHistory);
      localStorage.setItem('community-search-history', JSON.stringify(newHistory));
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('community-search-history');
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar na comunidade..."
          className="pl-10 pr-10"
          value={value}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Histórico de pesquisa */}
          {!value && searchHistory.length > 0 && (
            <div className="p-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Pesquisas recentes</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="h-6 text-xs"
                >
                  Limpar
                </Button>
              </div>
              <div className="space-y-1">
                {searchHistory.map((term, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded flex items-center gap-2"
                    onClick={() => handleSearch(term)}
                  >
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resultados da pesquisa */}
          {value && value.length >= 2 && (
            <div className="p-3">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {searchResults.length} resultado{searchResults.length > 1 ? 's' : ''} encontrado{searchResults.length > 1 ? 's' : ''}
                  </span>
                  {searchResults.map((result) => (
                    <Link
                      key={result.id}
                      to={`/comunidade/topico/${result.id}`}
                      className="block p-2 hover:bg-muted rounded"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="font-medium text-sm line-clamp-1"
                        dangerouslySetInnerHTML={{
                          __html: highlightMatch(result.title, value)
                        }}
                      />
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        {result.forum_categories?.[0]?.name && (
                          <Badge variant="outline" className="text-xs">
                            {result.forum_categories[0].name}
                          </Badge>
                        )}
                        <span>por {result.profiles?.[0]?.name || 'Usuário'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Nenhum resultado encontrado
                </p>
              )}
            </div>
          )}

          {/* Dicas de pesquisa */}
          {!value && (
            <div className="p-3 border-t">
              <p className="text-xs text-muted-foreground">
                Digite pelo menos 2 caracteres para buscar tópicos
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
