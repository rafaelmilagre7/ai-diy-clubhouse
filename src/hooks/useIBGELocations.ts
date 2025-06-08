
import { useState, useEffect } from 'react';

interface Estado {
  code: string;
  name: string;
}

interface Cidade {
  name: string;
}

interface IBGELocationsState {
  estados: Estado[];
  cidadesPorEstado: Record<string, Cidade[]>;
  isLoading: boolean;
  error: string | null;
}

export const useIBGELocations = () => {
  const [data, setData] = useState<IBGELocationsState>({
    estados: [],
    cidadesPorEstado: {},
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const loadEstados = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        console.log('[useIBGELocations] Carregando estados...');
        
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
        
        if (!response.ok) {
          throw new Error('Erro ao carregar estados');
        }
        
        const estados = await response.json();
        
        const estadosFormatados = estados.map((estado: any) => ({
          code: estado.sigla,
          name: estado.nome
        }));
        
        console.log('[useIBGELocations] Estados carregados:', estadosFormatados.length);
        
        setData(prev => ({
          ...prev,
          estados: estadosFormatados,
          isLoading: false
        }));
        
      } catch (error) {
        console.error('[useIBGELocations] Erro ao carregar estados:', error);
        
        // Fallback com estados principais
        const estadosFallback = [
          { code: 'SP', name: 'São Paulo' },
          { code: 'RJ', name: 'Rio de Janeiro' },
          { code: 'MG', name: 'Minas Gerais' },
          { code: 'RS', name: 'Rio Grande do Sul' },
          { code: 'PR', name: 'Paraná' },
          { code: 'SC', name: 'Santa Catarina' },
          { code: 'BA', name: 'Bahia' },
          { code: 'GO', name: 'Goiás' },
          { code: 'PE', name: 'Pernambuco' },
          { code: 'CE', name: 'Ceará' }
        ];
        
        setData(prev => ({
          ...prev,
          estados: estadosFallback,
          isLoading: false,
          error: 'Usando lista simplificada de estados'
        }));
      }
    };

    loadEstados();
  }, []);

  const loadCidades = async (estadoCode: string) => {
    if (data.cidadesPorEstado[estadoCode]) {
      return; // Já carregado
    }

    try {
      console.log('[useIBGELocations] Carregando cidades para:', estadoCode);
      
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoCode}/municipios?orderBy=nome`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao carregar cidades');
      }
      
      const cidades = await response.json();
      
      const cidadesFormatadas = cidades.map((cidade: any) => ({
        name: cidade.nome
      }));
      
      console.log('[useIBGELocations] Cidades carregadas para', estadoCode, ':', cidadesFormatadas.length);
      
      setData(prev => ({
        ...prev,
        cidadesPorEstado: {
          ...prev.cidadesPorEstado,
          [estadoCode]: cidadesFormatadas
        }
      }));
      
    } catch (error) {
      console.error('[useIBGELocations] Erro ao carregar cidades:', error);
      
      // Fallback com cidades principais do estado
      const cidadesFallback = [
        { name: 'Capital' },
        { name: 'Região Metropolitana' },
        { name: 'Interior' }
      ];
      
      setData(prev => ({
        ...prev,
        cidadesPorEstado: {
          ...prev.cidadesPorEstado,
          [estadoCode]: cidadesFallback
        }
      }));
    }
  };

  return {
    estados: data.estados,
    cidadesPorEstado: data.cidadesPorEstado,
    isLoading: data.isLoading,
    error: data.error,
    loadCidades
  };
};
