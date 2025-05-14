
import { useState, useCallback } from "react";

interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

interface Cidade {
  id: number;
  nome: string;
}

export function useIBGELocations() {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [errorEstados, setErrorEstados] = useState<Error | null>(null);
  const [errorCidades, setErrorCidades] = useState<Error | null>(null);

  const buscarEstados = useCallback(async () => {
    if (estados.length > 0) return; // Evitar buscas desnecessárias se já tivermos os dados
    
    setLoadingEstados(true);
    setErrorEstados(null);
    
    try {
      const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar estados: ${response.status}`);
      }
      
      const data: Estado[] = await response.json();
      setEstados(data);
    } catch (error) {
      console.error("Erro ao buscar estados:", error);
      setErrorEstados(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoadingEstados(false);
    }
  }, [estados.length]);

  const buscarCidades = useCallback(async (uf: string) => {
    setLoadingCidades(true);
    setErrorCidades(null);
    
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar cidades: ${response.status}`);
      }
      
      const data: Cidade[] = await response.json();
      setCidades(data);
    } catch (error) {
      console.error("Erro ao buscar cidades:", error);
      setErrorCidades(error instanceof Error ? error : new Error(String(error)));
      setCidades([]); // Reset cidades em caso de erro
    } finally {
      setLoadingCidades(false);
    }
  }, []);

  return {
    estados,
    cidades,
    loadingEstados,
    loadingCidades,
    errorEstados,
    errorCidades,
    buscarEstados,
    buscarCidades,
  };
}
