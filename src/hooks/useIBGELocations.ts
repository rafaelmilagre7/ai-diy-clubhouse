
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
        // A função getCities retorna um array de strings, precisamos converter para City[]
        const cidadesDoEstado = getCities(estado.code);
        todasCidades[estado.code] = cidadesDoEstado.map(nomeCidade => ({
          name: nomeCidade,
          code: nomeCidade.replace(/\s+/g, '-').toLowerCase() // Gerando um code baseado no nome da cidade
        }));
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
