import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

/**
 * ✅ MELHORIA #3: Barra de busca com debounce
 * Evita queries excessivas ao banco de dados
 */
export const SearchBar = ({ onSearch, placeholder = 'Buscar por nome, empresa ou cargo...' }: SearchBarProps) => {
  const [searchValue, setSearchValue] = useState('');
  const debouncedValue = useDebounce(searchValue, 500); // 500ms de delay

  // Disparar callback apenas quando o valor debounced mudar
  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        className="pl-10"
        aria-label="Buscar perfis"
      />
    </div>
  );
};
