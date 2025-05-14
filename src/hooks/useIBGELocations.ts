
import { useState, useEffect, useCallback } from 'react';

export interface Estado {
  code: string;
  name: string;
}

export interface Cidade {
  code: string;
  name: string;
}

interface CidadesPorEstado {
  [estadoCode: string]: Cidade[];
}

export const useIBGELocations = () => {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidadesPorEstado, setCidadesPorEstado] = useState<CidadesPorEstado>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Cache de estados e cidades para evitar múltiplas requisições
  const estadosCache = useState<Estado[]>([]);
  const cidadesCache = useState<CidadesPorEstado>({});

  // Função para buscar estados da API do IBGE
  const fetchEstados = useCallback(async () => {
    // Se já temos estados em cache, usamos eles
    if (estadosCache[0].length > 0) {
      setEstados(estadosCache[0]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar estados: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Mapear e formatar dados
      const formattedEstados = data.map((estado: any) => ({
        code: estado.sigla,
        name: estado.nome
      }));
      
      // Ordenar alfabeticamente
      formattedEstados.sort((a: Estado, b: Estado) => a.name.localeCompare(b.name));
      
      setEstados(formattedEstados);
      estadosCache[0] = formattedEstados;
    } catch (err: any) {
      console.error('Erro ao buscar estados:', err);
      setError(err);
      
      // Em caso de erro, usar lista básica de estados
      const basicStates = [
        { code: 'AC', name: 'Acre' },
        { code: 'AL', name: 'Alagoas' },
        { code: 'AM', name: 'Amazonas' },
        { code: 'AP', name: 'Amapá' },
        { code: 'BA', name: 'Bahia' },
        { code: 'CE', name: 'Ceará' },
        { code: 'DF', name: 'Distrito Federal' },
        { code: 'ES', name: 'Espírito Santo' },
        { code: 'GO', name: 'Goiás' },
        { code: 'MA', name: 'Maranhão' },
        { code: 'MT', name: 'Mato Grosso' },
        { code: 'MS', name: 'Mato Grosso do Sul' },
        { code: 'MG', name: 'Minas Gerais' },
        { code: 'PA', name: 'Pará' },
        { code: 'PB', name: 'Paraíba' },
        { code: 'PR', name: 'Paraná' },
        { code: 'PE', name: 'Pernambuco' },
        { code: 'PI', name: 'Piauí' },
        { code: 'RJ', name: 'Rio de Janeiro' },
        { code: 'RN', name: 'Rio Grande do Norte' },
        { code: 'RS', name: 'Rio Grande do Sul' },
        { code: 'RO', name: 'Rondônia' },
        { code: 'RR', name: 'Roraima' },
        { code: 'SC', name: 'Santa Catarina' },
        { code: 'SP', name: 'São Paulo' },
        { code: 'SE', name: 'Sergipe' },
        { code: 'TO', name: 'Tocantins' }
      ];
      
      setEstados(basicStates);
      estadosCache[0] = basicStates;
    } finally {
      setIsLoading(false);
    }
  }, [estadosCache]);

  // Função para buscar cidades de um estado específico
  const fetchCidadesPorEstado = useCallback(async (estadoCode: string) => {
    // Se já temos cidades deste estado em cache, usamos elas
    if (cidadesCache[0][estadoCode]) {
      setCidadesPorEstado(prev => ({
        ...prev,
        [estadoCode]: cidadesCache[0][estadoCode]
      }));
      return;
    }
    
    // Se estado não foi fornecido, não fazemos nada
    if (!estadoCode) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoCode}/municipios?orderBy=nome`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar cidades: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Mapear e formatar dados
      const formattedCidades = data.map((cidade: any) => ({
        code: cidade.id.toString(),
        name: cidade.nome
      }));
      
      // Ordenar alfabeticamente
      formattedCidades.sort((a: Cidade, b: Cidade) => a.name.localeCompare(b.name));
      
      // Atualizar estado e cache
      setCidadesPorEstado(prev => ({
        ...prev,
        [estadoCode]: formattedCidades
      }));
      
      cidadesCache[0] = {
        ...cidadesCache[0],
        [estadoCode]: formattedCidades
      };
      
    } catch (err: any) {
      console.error(`Erro ao buscar cidades do estado ${estadoCode}:`, err);
      setError(err);
      
      // Em caso de erro, definir array vazio para evitar erros na interface
      setCidadesPorEstado(prev => ({
        ...prev,
        [estadoCode]: []
      }));
    } finally {
      setIsLoading(false);
    }
  }, [cidadesCache]);

  // Retornar estados, cidades e funções de busca
  return {
    estados,
    cidadesPorEstado,
    isLoading,
    error,
    fetchEstados,
    fetchCidadesPorEstado
  };
};
