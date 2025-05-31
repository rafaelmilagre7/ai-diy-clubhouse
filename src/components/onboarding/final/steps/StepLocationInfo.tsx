
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowLeft, MapPin, Instagram, Linkedin } from 'lucide-react';
import { OnboardingStepComponentProps } from '@/types/onboardingFinal';
import { fetchBrazilianStates, fetchCitiesByState, IBGEState, IBGECity } from '@/utils/ibgeApi';

export const StepLocationInfo: React.FC<OnboardingStepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const [states, setStates] = useState<IBGEState[]>([]);
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    loadStates();
  }, []);

  useEffect(() => {
    // Se já tem estado selecionado nos dados, encontrar o ID e carregar cidades
    if (data.location_info.state && states.length > 0) {
      const state = states.find(s => s.nome === data.location_info.state);
      if (state && state.id !== selectedStateId) {
        setSelectedStateId(state.id);
        loadCitiesByState(state.id);
      }
    }
  }, [data.location_info.state, states]);

  const loadStates = async () => {
    try {
      setLoadingStates(true);
      const statesList = await fetchBrazilianStates();
      setStates(statesList);
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
    } finally {
      setLoadingStates(false);
    }
  };

  const loadCitiesByState = async (stateId: number) => {
    try {
      setLoadingCities(true);
      const citiesList = await fetchCitiesByState(stateId);
      setCities(citiesList);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleStateChange = (stateName: string) => {
    const state = states.find(s => s.nome === stateName);
    if (state) {
      setSelectedStateId(state.id);
      onUpdate('location_info', {
        ...data.location_info,
        state: stateName,
        city: '' // Limpar cidade quando trocar estado
      });
      loadCitiesByState(state.id);
    }
  };

  const isFormValid = () => {
    return data.location_info.state && data.location_info.city;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Onde você está localizado?
        </h2>
        <p className="text-gray-300">
          Essas informações nos ajudam a conectar você com pessoas da sua região.
        </p>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MapPin className="h-5 w-5 text-viverblue" />
            Localização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="state" className="text-white">Estado *</Label>
            <Select 
              value={data.location_info.state || ''} 
              onValueChange={handleStateChange}
              disabled={loadingStates}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder={loadingStates ? "Carregando estados..." : "Selecione seu estado"} />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.id} value={state.nome}>
                    {state.nome} ({state.sigla})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="city" className="text-white">Cidade *</Label>
            <Select 
              value={data.location_info.city || ''} 
              onValueChange={(value) => onUpdate('location_info', {
                ...data.location_info,
                city: value
              })}
              disabled={!selectedStateId || loadingCities}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder={
                  !selectedStateId ? "Primeiro selecione o estado" :
                  loadingCities ? "Carregando cidades..." :
                  "Selecione sua cidade"
                } />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.nome}>
                    {city.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Redes Sociais (Opcional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="instagram" className="text-white">Instagram</Label>
            <div className="relative">
              <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="instagram"
                value={data.location_info.instagram_url || ''}
                onChange={(e) => onUpdate('location_info', {
                  ...data.location_info,
                  instagram_url: e.target.value
                })}
                placeholder="https://instagram.com/seuusuario"
                className="bg-gray-700 border-gray-600 text-white pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="linkedin" className="text-white">LinkedIn</Label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="linkedin"
                value={data.location_info.linkedin_url || ''}
                onChange={(e) => onUpdate('location_info', {
                  ...data.location_info,
                  linkedin_url: e.target.value
                })}
                placeholder="https://linkedin.com/in/seuusuario"
                className="bg-gray-700 border-gray-600 text-white pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!isFormValid()}
          className="bg-viverblue hover:bg-viverblue/90"
        >
          Próxima Etapa
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="text-center text-sm text-gray-400">
        Etapa {currentStep} de {totalSteps}
      </div>
    </div>
  );
};
