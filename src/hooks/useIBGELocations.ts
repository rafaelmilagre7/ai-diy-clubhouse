
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

// Dados de fallback para estados e principais cidades
const ESTADOS_FALLBACK = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
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

const CIDADES_FALLBACK: Record<string, Cidade[]> = {
  'SC': [
    { name: 'Florianópolis' },
    { name: 'Joinville' },
    { name: 'Blumenau' },
    { name: 'São José' },
    { name: 'Criciúma' },
    { name: 'Chapecó' },
    { name: 'Itajaí' },
    { name: 'Lages' },
    { name: 'Palhoça' },
    { name: 'Balneário Camboriú' },
    { name: 'Brusque' },
    { name: 'Tubarão' },
    { name: 'São Bento do Sul' },
    { name: 'Caçador' },
    { name: 'Concórdia' }
  ],
  'SP': [
    { name: 'São Paulo' },
    { name: 'Guarulhos' },
    { name: 'Campinas' },
    { name: 'São Bernardo do Campo' },
    { name: 'Santo André' },
    { name: 'Osasco' },
    { name: 'Ribeirão Preto' },
    { name: 'Sorocaba' },
    { name: 'Santos' },
    { name: 'Mauá' },
    { name: 'São José dos Campos' },
    { name: 'Mogi das Cruzes' },
    { name: 'Diadema' },
    { name: 'Jundiaí' },
    { name: 'Piracicaba' }
  ],
  'RJ': [
    { name: 'Rio de Janeiro' },
    { name: 'São Gonçalo' },
    { name: 'Duque de Caxias' },
    { name: 'Nova Iguaçu' },
    { name: 'Niterói' },
    { name: 'Belford Roxo' },
    { name: 'São João de Meriti' },
    { name: 'Campos dos Goytacazes' },
    { name: 'Petrópolis' },
    { name: 'Volta Redonda' },
    { name: 'Magé' },
    { name: 'Itaboraí' },
    { name: 'Mesquita' },
    { name: 'Nova Friburgo' },
    { name: 'Barra Mansa' }
  ],
  'MG': [
    { name: 'Belo Horizonte' },
    { name: 'Uberlândia' },
    { name: 'Contagem' },
    { name: 'Juiz de Fora' },
    { name: 'Betim' },
    { name: 'Montes Claros' },
    { name: 'Ribeirão das Neves' },
    { name: 'Uberaba' },
    { name: 'Governador Valadares' },
    { name: 'Ipatinga' },
    { name: 'Sete Lagoas' },
    { name: 'Divinópolis' },
    { name: 'Santa Luzia' },
    { name: 'Ibirité' },
    { name: 'Poços de Caldas' }
  ],
  'RS': [
    { name: 'Porto Alegre' },
    { name: 'Caxias do Sul' },
    { name: 'Pelotas' },
    { name: 'Canoas' },
    { name: 'Santa Maria' },
    { name: 'Gravataí' },
    { name: 'Viamão' },
    { name: 'Novo Hamburgo' },
    { name: 'São Leopoldo' },
    { name: 'Rio Grande' },
    { name: 'Alvorada' },
    { name: 'Passo Fundo' },
    { name: 'Sapucaia do Sul' },
    { name: 'Uruguaiana' },
    { name: 'Santa Cruz do Sul' }
  ],
  'PR': [
    { name: 'Curitiba' },
    { name: 'Londrina' },
    { name: 'Maringá' },
    { name: 'Ponta Grossa' },
    { name: 'Cascavel' },
    { name: 'São José dos Pinhais' },
    { name: 'Foz do Iguaçu' },
    { name: 'Colombo' },
    { name: 'Guarapuava' },
    { name: 'Paranaguá' },
    { name: 'Araucária' },
    { name: 'Toledo' },
    { name: 'Apucarana' },
    { name: 'Pinhais' },
    { name: 'Campo Largo' }
  ]
};

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
        
        console.log('[useIBGELocations] Tentando carregar estados da API do IBGE...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 segundos
        
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const estados = await response.json();
        
        const estadosFormatados = estados.map((estado: any) => ({
          code: estado.sigla,
          name: estado.nome
        }));
        
        console.log('[useIBGELocations] Estados carregados da API:', estadosFormatados.length);
        
        setData(prev => ({
          ...prev,
          estados: estadosFormatados,
          isLoading: false
        }));
        
      } catch (error) {
        console.error('[useIBGELocations] Erro ao carregar estados da API:', error);
        console.log('[useIBGELocations] Usando dados de fallback para estados');
        
        setData(prev => ({
          ...prev,
          estados: ESTADOS_FALLBACK,
          isLoading: false,
          error: 'Usando lista local de estados (API indisponível)'
        }));
      }
    };

    loadEstados();
  }, []);

  const loadCidades = async (estadoCode: string) => {
    if (data.cidadesPorEstado[estadoCode]) {
      console.log('[useIBGELocations] Cidades já carregadas para:', estadoCode);
      return;
    }

    try {
      console.log('[useIBGELocations] Tentando carregar cidades da API para:', estadoCode);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoCode}/municipios?orderBy=nome`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const cidades = await response.json();
      
      const cidadesFormatadas = cidades.map((cidade: any) => ({
        name: cidade.nome
      }));
      
      console.log('[useIBGELocations] Cidades carregadas da API para', estadoCode, ':', cidadesFormatadas.length);
      
      setData(prev => ({
        ...prev,
        cidadesPorEstado: {
          ...prev.cidadesPorEstado,
          [estadoCode]: cidadesFormatadas
        }
      }));
      
    } catch (error) {
      console.error('[useIBGELocations] Erro ao carregar cidades da API para', estadoCode, ':', error);
      
      // Usar dados de fallback se disponíveis
      const cidadesFallback = CIDADES_FALLBACK[estadoCode] || [
        { name: 'Capital' },
        { name: 'Região Metropolitana' },
        { name: 'Interior' },
        { name: 'Outros municípios' }
      ];
      
      console.log('[useIBGELocations] Usando dados de fallback para', estadoCode, ':', cidadesFallback.length);
      
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
