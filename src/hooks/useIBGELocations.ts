
import { useState, useEffect } from 'react';
import { getAllCities, getAllStates, State, City } from '@brazilian-utils/brazilian-utils';

export const useIBGELocations = () => {
  const [estados, setEstados] = useState<State[]>([]);
  const [cidadesPorEstado, setCidadesPorEstado] = useState<Record<string, City[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Carrega todos os estados
      const todosEstados = getAllStates();
      setEstados(todosEstados);

      // Cria um objeto com todas as cidades por estado
      const todasCidades: Record<string, City[]> = {};
      todosEstados.forEach(estado => {
        todasCidades[estado.code] = getAllCities(estado.code);
      });
      
      setCidadesPorEstado(todasCidades);
    } catch (error) {
      console.error("Erro ao carregar estados e cidades:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    estados,
    cidadesPorEstado,
    isLoading
  };
};
