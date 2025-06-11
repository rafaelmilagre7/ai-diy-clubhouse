
import React, { useEffect } from 'react';
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

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedState,
  selectedCity,
  onStateChange,
  onCityChange,
  getFieldError
}) => {
  const { estados, cidadesPorEstado, isLoading, loadCidades } = useIBGELocations();

  // Carregar cidades quando estado for selecionado
  useEffect(() => {
    if (selectedState && !cidadesPorEstado[selectedState]) {
      loadCidades(selectedState);
    }
  }, [selectedState, cidadesPorEstado, loadCidades]);

  // Limpar cidade quando estado mudar
  const handleStateChange = (stateCode: string) => {
    onStateChange(stateCode);
    onCityChange(''); // Limpar cidade selecionada
  };

  const citiesForSelectedState = selectedState ? cidadesPorEstado[selectedState] || [] : [];
  const isCitiesLoading = selectedState && !cidadesPorEstado[selectedState];

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
          <SelectContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm">Carregando estados...</span>
              </div>
            ) : (
              estados.map((estado) => (
                <SelectItem key={estado.code} value={estado.code}>
                  {estado.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {getFieldError?.('state') && (
          <p className="text-red-400 text-sm mt-1">{getFieldError('state')}</p>
        )}
      </div>

      {/* Seleção de Cidade */}
      <div>
        <Label htmlFor="city" className="text-slate-200">
          Cidade *
        </Label>
        <Select 
          value={selectedCity || ''} 
          onValueChange={onCityChange}
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
          <SelectContent>
            {isCitiesLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm">Carregando cidades...</span>
              </div>
            ) : citiesForSelectedState.length > 0 ? (
              citiesForSelectedState.map((cidade) => (
                <SelectItem key={cidade.name} value={cidade.name}>
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
        {getFieldError?.('city') && (
          <p className="text-red-400 text-sm mt-1">{getFieldError('city')}</p>
        )}
      </div>
    </div>
  );
};
