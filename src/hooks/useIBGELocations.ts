
import { useState, useEffect } from 'react';
import { getCities, getStates } from '@brazilian-utils/brazilian-utils';

// Criando interfaces já que a biblioteca não as exporta
export interface State {
  code: string;
  name: string;
}

export interface City {
  name: string;
  code: string;
}

export const useIBGELocations = () => {
  const [estados, setEstados] = useState<State[]>([]);
  const [cidadesPorEstado, setCidadesPorEstado] = useState<Record<string, City[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Carrega todos os estados
      const todosEstados = getStates();
      setEstados(todosEstados);

      // Cria um objeto com todas as cidades por estado
      const todasCidades: Record<string, City[]> = {};
      todosEstados.forEach(estado => {
        todasCidades[estado.code] = getCities(estado.code);
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
