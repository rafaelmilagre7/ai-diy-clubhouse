import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Loader2, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  resultsCount?: number;
}

/**
 * ✅ UPGRADE: Barra de busca com debounce + loading state + clear button
 * - Feedback visual durante busca
 * - Contador de resultados
 * - Botão para limpar busca
 */
export const SearchBar = ({ 
  onSearch, 
  placeholder = 'Buscar por nome, empresa ou cargo...',
  isLoading,
  resultsCount
}: SearchBarProps) => {
  const [searchValue, setSearchValue] = useState('');
  const debouncedValue = useDebounce(searchValue, 500);
  const [isSearching, setIsSearching] = useState(false);

  // Disparar callback apenas quando o valor debounced mudar
  useEffect(() => {
    if (searchValue !== debouncedValue) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
    onSearch(debouncedValue);
  }, [debouncedValue, searchValue, onSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setSearchValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className="space-y-2">
      <div className="relative">
        {/* Ícone de busca */}
        <Search className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
          isSearching ? "text-aurora" : "text-muted-foreground"
        )} />
        
        {/* Input */}
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={handleChange}
          className={cn(
            "pl-10 pr-20 transition-all",
            searchValue && "border-aurora/40"
          )}
          aria-label="Buscar perfis"
        />

        {/* Loading indicator ou Clear button */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isSearching && (
            <Loader2 className="h-4 w-4 text-aurora animate-spin" />
          )}
          
          {searchValue && !isSearching && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 px-2 hover:bg-muted"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Contador de resultados */}
      {searchValue && !isSearching && resultsCount !== undefined && (
        <p className="text-xs text-muted-foreground px-1">
          {resultsCount === 0 ? (
            'Nenhum resultado encontrado'
          ) : (
            <>
              {resultsCount} {resultsCount === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </>
          )}
        </p>
      )}
    </div>
  );
};
