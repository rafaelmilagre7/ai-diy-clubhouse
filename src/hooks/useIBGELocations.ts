
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

// Estados brasileiros - dados locais instantâneos
const ESTADOS_BRASILEIROS: Estado[] = [
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

// Principais cidades por estado - dados locais instantâneos
const CIDADES_POR_ESTADO: Record<string, Cidade[]> = {
  'AC': [
    { name: 'Rio Branco' }, { name: 'Cruzeiro do Sul' }, { name: 'Sena Madureira' }, { name: 'Tarauacá' },
    { name: 'Feijó' }, { name: 'Brasileia' }, { name: 'Plácido de Castro' }, { name: 'Xapuri' }
  ],
  'AL': [
    { name: 'Maceió' }, { name: 'Arapiraca' }, { name: 'Rio Largo' }, { name: 'Palmeira dos Índios' },
    { name: 'União dos Palmares' }, { name: 'Penedo' }, { name: 'Coruripe' }, { name: 'Marechal Deodoro' }
  ],
  'AP': [
    { name: 'Macapá' }, { name: 'Santana' }, { name: 'Laranjal do Jari' }, { name: 'Oiapoque' },
    { name: 'Mazagão' }, { name: 'Porto Grande' }, { name: 'Tartarugalzinho' }
  ],
  'AM': [
    { name: 'Manaus' }, { name: 'Parintins' }, { name: 'Itacoatiara' }, { name: 'Manacapuru' },
    { name: 'Coari' }, { name: 'Tefé' }, { name: 'Tabatinga' }, { name: 'Maués' }
  ],
  'BA': [
    { name: 'Salvador' }, { name: 'Feira de Santana' }, { name: 'Vitória da Conquista' }, { name: 'Camaçari' },
    { name: 'Itabuna' }, { name: 'Juazeiro' }, { name: 'Lauro de Freitas' }, { name: 'Ilhéus' }
  ],
  'CE': [
    { name: 'Fortaleza' }, { name: 'Caucaia' }, { name: 'Juazeiro do Norte' }, { name: 'Maracanaú' },
    { name: 'Sobral' }, { name: 'Crato' }, { name: 'Itapipoca' }, { name: 'Maranguape' }
  ],
  'DF': [
    { name: 'Brasília' }, { name: 'Gama' }, { name: 'Taguatinga' }, { name: 'Ceilândia' },
    { name: 'Sobradinho' }, { name: 'Planaltina' }, { name: 'Samambaia' }
  ],
  'ES': [
    { name: 'Vitória' }, { name: 'Cariacica' }, { name: 'Vila Velha' }, { name: 'Serra' },
    { name: 'Cachoeiro de Itapemirim' }, { name: 'Linhares' }, { name: 'São Mateus' }
  ],
  'GO': [
    { name: 'Goiânia' }, { name: 'Aparecida de Goiânia' }, { name: 'Anápolis' }, { name: 'Rio Verde' },
    { name: 'Luziânia' }, { name: 'Águas Lindas de Goiás' }, { name: 'Valparaíso de Goiás' }
  ],
  'MA': [
    { name: 'São Luís' }, { name: 'Imperatriz' }, { name: 'São José de Ribamar' }, { name: 'Timon' },
    { name: 'Caxias' }, { name: 'Codó' }, { name: 'Paço do Lumiar' }
  ],
  'MT': [
    { name: 'Cuiabá' }, { name: 'Várzea Grande' }, { name: 'Rondonópolis' }, { name: 'Sinop' },
    { name: 'Tangará da Serra' }, { name: 'Cáceres' }, { name: 'Sorriso' }
  ],
  'MS': [
    { name: 'Campo Grande' }, { name: 'Dourados' }, { name: 'Três Lagoas' }, { name: 'Corumbá' },
    { name: 'Ponta Porã' }, { name: 'Naviraí' }, { name: 'Nova Andradina' }
  ],
  'MG': [
    { name: 'Belo Horizonte' }, { name: 'Uberlândia' }, { name: 'Contagem' }, { name: 'Juiz de Fora' },
    { name: 'Betim' }, { name: 'Montes Claros' }, { name: 'Ribeirão das Neves' }
  ],
  'PA': [
    { name: 'Belém' }, { name: 'Ananindeua' }, { name: 'Santarém' }, { name: 'Marabá' },
    { name: 'Parauapebas' }, { name: 'Castanhal' }, { name: 'Abaetetuba' }
  ],
  'PB': [
    { name: 'João Pessoa' }, { name: 'Campina Grande' }, { name: 'Santa Rita' }, { name: 'Patos' },
    { name: 'Bayeux' }, { name: 'Sousa' }, { name: 'Cajazeiras' }
  ],
  'PR': [
    { name: 'Curitiba' }, { name: 'Londrina' }, { name: 'Maringá' }, { name: 'Ponta Grossa' },
    { name: 'Cascavel' }, { name: 'São José dos Pinhais' }, { name: 'Foz do Iguaçu' }
  ],
  'PE': [
    { name: 'Recife' }, { name: 'Jaboatão dos Guararapes' }, { name: 'Olinda' }, { name: 'Caruaru' },
    { name: 'Petrolina' }, { name: 'Paulista' }, { name: 'Cabo de Santo Agostinho' }
  ],
  'PI': [
    { name: 'Teresina' }, { name: 'Parnaíba' }, { name: 'Picos' }, { name: 'Piripiri' },
    { name: 'Floriano' }, { name: 'Campo Maior' }, { name: 'União' }
  ],
  'RJ': [
    { name: 'Rio de Janeiro' }, { name: 'São Gonçalo' }, { name: 'Duque de Caxias' }, { name: 'Nova Iguaçu' },
    { name: 'Niterói' }, { name: 'Belford Roxo' }, { name: 'São João de Meriti' }
  ],
  'RN': [
    { name: 'Natal' }, { name: 'Mossoró' }, { name: 'Parnamirim' }, { name: 'São Gonçalo do Amarante' },
    { name: 'Macaíba' }, { name: 'Ceará-Mirim' }, { name: 'Caicó' }
  ],
  'RS': [
    { name: 'Porto Alegre' }, { name: 'Caxias do Sul' }, { name: 'Pelotas' }, { name: 'Canoas' },
    { name: 'Santa Maria' }, { name: 'Gravataí' }, { name: 'Viamão' }
  ],
  'RO': [
    { name: 'Porto Velho' }, { name: 'Ji-Paraná' }, { name: 'Ariquemes' }, { name: 'Vilhena' },
    { name: 'Cacoal' }, { name: 'Rolim de Moura' }, { name: 'Guajará-Mirim' }
  ],
  'RR': [
    { name: 'Boa Vista' }, { name: 'Rorainópolis' }, { name: 'Caracaraí' }, { name: 'Alto Alegre' },
    { name: 'Mucajaí' }, { name: 'São João da Baliza' }
  ],
  'SC': [
    { name: 'Florianópolis' }, { name: 'Joinville' }, { name: 'Blumenau' }, { name: 'São José' },
    { name: 'Criciúma' }, { name: 'Chapecó' }, { name: 'Itajaí' }
  ],
  'SP': [
    { name: 'São Paulo' }, { name: 'Guarulhos' }, { name: 'Campinas' }, { name: 'São Bernardo do Campo' },
    { name: 'Santo André' }, { name: 'Osasco' }, { name: 'Ribeirão Preto' }
  ],
  'SE': [
    { name: 'Aracaju' }, { name: 'Nossa Senhora do Socorro' }, { name: 'Lagarto' }, { name: 'Itabaiana' },
    { name: 'São Cristóvão' }, { name: 'Estância' }, { name: 'Tobias Barreto' }
  ],
  'TO': [
    { name: 'Palmas' }, { name: 'Araguaína' }, { name: 'Gurupi' }, { name: 'Porto Nacional' },
    { name: 'Paraíso do Tocantins' }, { name: 'Colinas do Tocantins' }
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
    console.log('[useIBGELocations] Carregando estados com dados locais...');
    
    // Dados carregados instantaneamente - sem API
    setData({
      estados: ESTADOS_BRASILEIROS,
      cidadesPorEstado: {},
      isLoading: false,
      error: null
    });
    
    console.log('[useIBGELocations] Estados carregados:', ESTADOS_BRASILEIROS.length);
  }, []);

  const loadCidades = (estadoCode: string) => {
    if (data.cidadesPorEstado[estadoCode]) {
      console.log('[useIBGELocations] Cidades já carregadas para:', estadoCode);
      return;
    }

    console.log('[useIBGELocations] Carregando cidades para:', estadoCode);
    
    // Buscar cidades do estado nos dados locais
    const cidadesDoEstado = CIDADES_POR_ESTADO[estadoCode] || [];
    
    console.log('[useIBGELocations] Cidades carregadas para', estadoCode, ':', cidadesDoEstado.length);
    
    setData(prev => ({
      ...prev,
      cidadesPorEstado: {
        ...prev.cidadesPorEstado,
        [estadoCode]: cidadesDoEstado
      }
    }));
  };

  return {
    estados: data.estados,
    cidadesPorEstado: data.cidadesPorEstado,
    isLoading: data.isLoading,
    error: data.error,
    loadCidades
  };
};
