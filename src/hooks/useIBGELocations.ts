
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
        
        if (cidadesDoEstado && cidadesDoEstado.length > 0) {
          todasCidades[estado.code] = cidadesDoEstado.map(nomeCidade => ({
            name: nomeCidade,
            code: nomeCidade.replace(/\s+/g, '-').toLowerCase() // Gerando um code baseado no nome da cidade
          }));
        } else {
          // Caso a API não retorne cidades, adicionamos algumas cidades grandes para cada estado
          const cidadesGrandes = obterCidadesGrandes(estado.code);
          todasCidades[estado.code] = cidadesGrandes.map(nome => ({
            name: nome,
            code: nome.replace(/\s+/g, '-').toLowerCase()
          }));
        }
      });
      
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

  // Função para obter grandes cidades de cada estado como fallback
  const obterCidadesGrandes = (ufCode: string): string[] => {
    const cidadesFallback: Record<string, string[]> = {
      'AC': ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira'],
      'AL': ['Maceió', 'Arapiraca', 'Rio Largo'],
      'AM': ['Manaus', 'Parintins', 'Itacoatiara'],
      'AP': ['Macapá', 'Santana', 'Laranjal do Jari'],
      'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista'],
      'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte'],
      'DF': ['Brasília', 'Ceilândia', 'Taguatinga'],
      'ES': ['Vitória', 'Vila Velha', 'Cariacica'],
      'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis'],
      'MA': ['São Luís', 'Imperatriz', 'Timon'],
      'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem'],
      'MS': ['Campo Grande', 'Dourados', 'Três Lagoas'],
      'MT': ['Cuiabá', 'Várzea Grande', 'Rondonópolis'],
      'PA': ['Belém', 'Ananindeua', 'Santarém'],
      'PB': ['João Pessoa', 'Campina Grande', 'Santa Rita'],
      'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda'],
      'PI': ['Teresina', 'Parnaíba', 'Picos'],
      'PR': ['Curitiba', 'Londrina', 'Maringá'],
      'RJ': ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias'],
      'RN': ['Natal', 'Mossoró', 'Parnamirim'],
      'RO': ['Porto Velho', 'Ji-Paraná', 'Ariquemes'],
      'RR': ['Boa Vista', 'Rorainópolis', 'Caracaraí'],
      'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas'],
      'SC': ['Florianópolis', 'Joinville', 'Blumenau'],
      'SE': ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto'],
      'SP': ['São Paulo', 'Guarulhos', 'Campinas'],
      'TO': ['Palmas', 'Araguaína', 'Gurupi']
    };
    
    return cidadesFallback[ufCode] || ['Cidade principal'];
  };

  return {
    estados,
    cidadesPorEstado,
    isLoading
  };
};
