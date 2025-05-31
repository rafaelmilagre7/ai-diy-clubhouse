
export interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
}

export interface IBGECity {
  id: number;
  nome: string;
}

// Cache para evitar múltiplas requisições
let statesCache: IBGEState[] | null = null;
const citiesCache = new Map<string, IBGECity[]>();

export const fetchBrazilianStates = async (): Promise<IBGEState[]> => {
  if (statesCache) {
    return statesCache;
  }

  try {
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
    if (!response.ok) {
      throw new Error('Erro ao buscar estados');
    }
    
    const states = await response.json();
    statesCache = states.map((state: any) => ({
      id: state.id,
      sigla: state.sigla,
      nome: state.nome
    }));
    
    return statesCache;
  } catch (error) {
    console.error('Erro ao buscar estados do IBGE:', error);
    
    // Fallback com estados principais
    const fallbackStates: IBGEState[] = [
      { id: 11, sigla: 'RO', nome: 'Rondônia' },
      { id: 12, sigla: 'AC', nome: 'Acre' },
      { id: 13, sigla: 'AM', nome: 'Amazonas' },
      { id: 14, sigla: 'RR', nome: 'Roraima' },
      { id: 15, sigla: 'PA', nome: 'Pará' },
      { id: 16, sigla: 'AP', nome: 'Amapá' },
      { id: 17, sigla: 'TO', nome: 'Tocantins' },
      { id: 21, sigla: 'MA', nome: 'Maranhão' },
      { id: 22, sigla: 'PI', nome: 'Piauí' },
      { id: 23, sigla: 'CE', nome: 'Ceará' },
      { id: 24, sigla: 'RN', nome: 'Rio Grande do Norte' },
      { id: 25, sigla: 'PB', nome: 'Paraíba' },
      { id: 26, sigla: 'PE', nome: 'Pernambuco' },
      { id: 27, sigla: 'AL', nome: 'Alagoas' },
      { id: 28, sigla: 'SE', nome: 'Sergipe' },
      { id: 29, sigla: 'BA', nome: 'Bahia' },
      { id: 31, sigla: 'MG', nome: 'Minas Gerais' },
      { id: 32, sigla: 'ES', nome: 'Espírito Santo' },
      { id: 33, sigla: 'RJ', nome: 'Rio de Janeiro' },
      { id: 35, sigla: 'SP', nome: 'São Paulo' },
      { id: 41, sigla: 'PR', nome: 'Paraná' },
      { id: 42, sigla: 'SC', nome: 'Santa Catarina' },
      { id: 43, sigla: 'RS', nome: 'Rio Grande do Sul' },
      { id: 50, sigla: 'MS', nome: 'Mato Grosso do Sul' },
      { id: 51, sigla: 'MT', nome: 'Mato Grosso' },
      { id: 52, sigla: 'GO', nome: 'Goiás' },
      { id: 53, sigla: 'DF', nome: 'Distrito Federal' }
    ];
    
    statesCache = fallbackStates;
    return fallbackStates;
  }
};

export const fetchCitiesByState = async (stateId: number): Promise<IBGECity[]> => {
  const cacheKey = stateId.toString();
  
  if (citiesCache.has(cacheKey)) {
    return citiesCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios?orderBy=nome`);
    if (!response.ok) {
      throw new Error('Erro ao buscar cidades');
    }
    
    const cities = await response.json();
    const citiesList = cities.map((city: any) => ({
      id: city.id,
      nome: city.nome
    }));
    
    citiesCache.set(cacheKey, citiesList);
    return citiesList;
  } catch (error) {
    console.error('Erro ao buscar cidades do IBGE:', error);
    return [];
  }
};
