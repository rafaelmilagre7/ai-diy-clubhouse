
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
      
      // Cidades adicionais para SC (Santa Catarina) caso a API não retorne
      const cidadesSC = [
        "Florianópolis", "Joinville", "Blumenau", "São José", "Chapecó", 
        "Criciúma", "Itajaí", "Jaraguá do Sul", "Lages", "Palhoça",
        "Balneário Camboriú", "Brusque", "Tubarão", "Camboriú", "Navegantes",
        "Concórdia", "Rio do Sul", "Caçador", "Araranguá", "Canoinhas"
      ];
      
      todosEstados.forEach(estado => {
        // A função getCities retorna um array de strings, precisamos converter para City[]
        const cidadesDoEstado = getCities(estado.code);
        
        // Verificar se temos cidades e adicionar as especiais para SC
        if (estado.code === "SC" && (!cidadesDoEstado || cidadesDoEstado.length === 0)) {
          console.log("Adicionando cidades manualmente para SC");
          todasCidades["SC"] = cidadesSC.map(nome => ({
            name: nome,
            code: nome.replace(/\s+/g, '-').toLowerCase()
          }));
        } else {
          todasCidades[estado.code] = cidadesDoEstado.map(nomeCidade => ({
            name: nomeCidade,
            code: nomeCidade.replace(/\s+/g, '-').toLowerCase() // Gerando um code baseado no nome da cidade
          }));
        }
      });
      
      // Garantir que SC tenha algumas cidades mesmo que a API tenha retornado algumas
      if (todasCidades["SC"] && todasCidades["SC"].length < 10) {
        console.log("Complementando cidades de SC");
        const cidadesExistentes = new Set(todasCidades["SC"].map(c => c.name));
        const cidadesComplementares = cidadesSC
          .filter(nome => !cidadesExistentes.has(nome))
          .map(nome => ({
            name: nome,
            code: nome.replace(/\s+/g, '-').toLowerCase()
          }));
        
        todasCidades["SC"] = [...todasCidades["SC"], ...cidadesComplementares];
      }
      
      console.log("Cidades carregadas:", Object.keys(todasCidades).map(uf => 
        `${uf}: ${todasCidades[uf]?.length || 0} cidades`
      ));
      
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
