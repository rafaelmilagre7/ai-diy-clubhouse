
import React, { useEffect, useMemo, useCallback, memo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIBGELocations } from '@/hooks/useIBGELocations';
import { Loader2 } from 'lucide-react';

interface LocationSelectorProps {
  selectedState?: string;
  selectedCity?: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  getFieldError?: (field: string) => string | undefined;
}

const LocationSelector: React.FC<LocationSelectorProps> = memo(({
  selectedState,
  selectedCity,
  onStateChange,
  onCityChange,
  getFieldError
}) => {
  const { estados, cidadesPorEstado, isLoading, loadCidades } = useIBGELocations();

  // Memoizar as cidades para evitar re-renders desnecessários
  const citiesForSelectedState = useMemo(() => {
    return selectedState ? cidadesPorEstado[selectedState] || [] : [];
  }, [selectedState, cidadesPorEstado]);

  const isCitiesLoading = useMemo(() => {
    return selectedState && !cidadesPorEstado[selectedState];
  }, [selectedState, cidadesPorEstado]);

  // Carregar cidades quando estado for selecionado
  useEffect(() => {
    if (selectedState && !cidadesPorEstado[selectedState]) {
      console.log('[LocationSelector] Carregando cidades para estado:', selectedState);
      loadCidades(selectedState);
    }
  }, [selectedState, cidadesPorEstado, loadCidades]);

  // Usar useCallback para evitar re-criação das funções
  const handleStateChange = useCallback((stateCode: string) => {
    console.log('[LocationSelector] Estado selecionado:', stateCode);
    onStateChange(stateCode);
    
    // Só limpar cidade se realmente mudou o estado
    if (selectedState !== stateCode) {
      console.log('[LocationSelector] Limpando cidade selecionada');
      onCityChange('');
    }
  }, [onStateChange, onCityChange, selectedState]);

  const handleCityChange = useCallback((cityName: string) => {
    console.log('[LocationSelector] Cidade selecionada:', cityName);
    onCityChange(cityName);
  }, [onCityChange]);

  // Memoizar erros para evitar re-renders
  const stateError = useMemo(() => getFieldError?.('state'), [getFieldError]);
  const cityError = useMemo(() => getFieldError?.('city'), [getFieldError]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Seleção de Estado */}
      <div>
        <Label htmlFor="state" className="text-slate-200">
          Estado *
        </Label>
        <Select value={selectedState || ''} onValueChange={handleStateChange}>
          <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
            <SelectValue placeholder={isLoading ? "Carregando estados..." : "Selecione seu estado"} />
          </SelectTrigger>
          <SelectContent className="bg-[#151823] border-white/20 z-50">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm">Carregando estados...</span>
              </div>
            ) : (
              estados.map((estado) => (
                <SelectItem 
                  key={`state-${estado.code}`}
                  value={estado.code}
                  className="text-white hover:bg-white/10"
                >
                  {estado.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {stateError && (
          <p className="text-red-400 text-sm mt-1">{stateError}</p>
        )}
      </div>

      {/* Seleção de Cidade */}
      <div>
        <Label htmlFor="city" className="text-slate-200">
          Cidade *
        </Label>
        <Select 
          value={selectedCity || ''} 
          onValueChange={handleCityChange}
          disabled={!selectedState}
        >
          <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
            <SelectValue 
              placeholder={
                !selectedState 
                  ? "Primeiro selecione o estado"
                  : isCitiesLoading 
                    ? "Carregando cidades..."
                    : "Selecione sua cidade"
              } 
            />
          </SelectTrigger>
          <SelectContent className="bg-[#151823] border-white/20 z-50">
            {isCitiesLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm">Carregando cidades...</span>
              </div>
            ) : citiesForSelectedState.length > 0 ? (
              citiesForSelectedState.map((cidade) => (
                <SelectItem 
                  key={`city-${selectedState}-${cidade.name}`}
                  value={cidade.name}
                  className="text-white hover:bg-white/10"
                >
                  {cidade.name}
                </SelectItem>
              ))
            ) : selectedState ? (
              <div className="p-4 text-center text-sm text-slate-400">
                Nenhuma cidade encontrada
              </div>
            ) : null}
          </SelectContent>
        </Select>
        {cityError && (
          <p className="text-red-400 text-sm mt-1">{cityError}</p>
        )}
      </div>
    </div>
  );
});

LocationSelector.displayName = 'LocationSelector';

export { LocationSelector };
