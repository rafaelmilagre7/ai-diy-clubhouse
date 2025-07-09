
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
  'AC': [
    { name: 'Rio Branco' }, { name: 'Cruzeiro do Sul' }, { name: 'Sena Madureira' }, { name: 'Tarauacá' },
    { name: 'Feijó' }, { name: 'Brasileia' }, { name: 'Plácido de Castro' }, { name: 'Xapuri' },
    { name: 'Senador Guiomard' }, { name: 'Epitaciolândia' }, { name: 'Mâncio Lima' }, { name: 'Rodrigues Alves' }
  ],
  'AL': [
    { name: 'Maceió' }, { name: 'Arapiraca' }, { name: 'Rio Largo' }, { name: 'Palmeira dos Índios' },
    { name: 'União dos Palmares' }, { name: 'Penedo' }, { name: 'Coruripe' }, { name: 'Marechal Deodoro' },
    { name: 'São Miguel dos Campos' }, { name: 'Santana do Ipanema' }, { name: 'Delmiro Gouveia' }, { name: 'Campo Alegre' },
    { name: 'Murici' }, { name: 'Pilar' }, { name: 'Girau do Ponciano' }, { name: 'Igaci' }, { name: 'Porto Calvo' }, { name: 'Viçosa' }
  ],
  'AP': [
    { name: 'Macapá' }, { name: 'Santana' }, { name: 'Laranjal do Jari' }, { name: 'Oiapoque' },
    { name: 'Mazagão' }, { name: 'Porto Grande' }, { name: 'Tartarugalzinho' }, { name: 'Vitória do Jari' },
    { name: 'Amapá' }, { name: 'Ferreira Gomes' }, { name: 'Pracuúba' }, { name: 'Calçoene' }, { name: 'Cutias' }, { name: 'Itaubal' }
  ],
  'AM': [
    { name: 'Manaus' }, { name: 'Parintins' }, { name: 'Itacoatiara' }, { name: 'Manacapuru' },
    { name: 'Coari' }, { name: 'Tefé' }, { name: 'Tabatinga' }, { name: 'Maués' },
    { name: 'São Gabriel da Cachoeira' }, { name: 'Humaitá' }, { name: 'Lábrea' }, { name: 'Iranduba' },
    { name: 'Presidente Figueiredo' }, { name: 'Carauari' }
  ],
  'BA': [
    { name: 'Salvador' }, { name: 'Feira de Santana' }, { name: 'Vitória da Conquista' }, { name: 'Camaçari' },
    { name: 'Itabuna' }, { name: 'Juazeiro' }, { name: 'Lauro de Freitas' }, { name: 'Ilhéus' },
    { name: 'Jequié' }, { name: 'Teixeira de Freitas' }, { name: 'Alagoinhas' }, { name: 'Porto Seguro' },
    { name: 'Simões Filho' }, { name: 'Paulo Afonso' }, { name: 'Eunápolis' }, { name: 'Santo Antônio de Jesus' },
    { name: 'Valença' }, { name: 'Candeias' }, { name: 'Guanambi' }, { name: 'Jacobina' }, { name: 'Serrinha' }, { name: 'Senhor do Bonfim' }
  ],
  'CE': [
    { name: 'Fortaleza' }, { name: 'Caucaia' }, { name: 'Juazeiro do Norte' }, { name: 'Maracanaú' },
    { name: 'Sobral' }, { name: 'Crato' }, { name: 'Itapipoca' }, { name: 'Maranguape' },
    { name: 'Iguatu' }, { name: 'Quixadá' }, { name: 'Canindé' }, { name: 'Aquiraz' },
    { name: 'Pacatuba' }, { name: 'Crateús' }, { name: 'Russas' }, { name: 'Aracati' },
    { name: 'Cascavel' }, { name: 'Pacajus' }, { name: 'Icó' }, { name: 'Horizonte' },
    { name: 'Camocim' }, { name: 'Morada Nova' }, { name: 'Acaraú' }, { name: 'Viçosa do Ceará' }
  ],
  'DF': [
    { name: 'Brasília' }, { name: 'Gama' }, { name: 'Taguatinga' }, { name: 'Ceilândia' },
    { name: 'Sobradinho' }, { name: 'Planaltina' }, { name: 'Samambaia' }, { name: 'Santa Maria' },
    { name: 'São Sebastião' }, { name: 'Recanto das Emas' }, { name: 'Águas Claras' }, { name: 'Riacho Fundo' },
    { name: 'Guará' }, { name: 'Cruzeiro' }, { name: 'Sudoeste/Octogonal' }, { name: 'Vicente Pires' }
  ],
  'ES': [
    { name: 'Vitória' }, { name: 'Cariacica' }, { name: 'Vila Velha' }, { name: 'Serra' },
    { name: 'Cachoeiro de Itapemirim' }, { name: 'Linhares' }, { name: 'São Mateus' }, { name: 'Colatina' },
    { name: 'Guarapari' }, { name: 'Aracruz' }, { name: 'Viana' }, { name: 'Nova Venécia' },
    { name: 'Barra de São Francisco' }, { name: 'Santa Teresa' }, { name: 'Anchieta' }, { name: 'Castelo' },
    { name: 'Marataízes' }, { name: 'Itapemirim' }, { name: 'Domingos Martins' }
  ],
  'GO': [
    { name: 'Goiânia' }, { name: 'Aparecida de Goiânia' }, { name: 'Anápolis' }, { name: 'Rio Verde' },
    { name: 'Luziânia' }, { name: 'Águas Lindas de Goiás' }, { name: 'Valparaíso de Goiás' }, { name: 'Trindade' },
    { name: 'Formosa' }, { name: 'Novo Gama' }, { name: 'Itumbiara' }, { name: 'Senador Canedo' },
    { name: 'Catalão' }, { name: 'Jataí' }, { name: 'Planaltina' }, { name: 'Caldas Novas' },
    { name: 'Santo Antônio do Descoberto' }, { name: 'Goianésia' }, { name: 'Cidade Ocidental' }, { name: 'Mineiros' },
    { name: 'Cristalina' }, { name: 'Inhumas' }
  ],
  'MA': [
    { name: 'São Luís' }, { name: 'Imperatriz' }, { name: 'São José de Ribamar' }, { name: 'Timon' },
    { name: 'Caxias' }, { name: 'Codó' }, { name: 'Paço do Lumiar' }, { name: 'Açailândia' },
    { name: 'Bacabal' }, { name: 'Balsas' }, { name: 'Santa Inês' }, { name: 'Pinheiro' },
    { name: 'Pedreiras' }, { name: 'Chapadinha' }, { name: 'Santa Luzia' }, { name: 'Barra do Corda' },
    { name: 'Itapecuru Mirim' }, { name: 'Coroatá' }, { name: 'Rosário' }, { name: 'Viana' }
  ],
  'MT': [
    { name: 'Cuiabá' }, { name: 'Várzea Grande' }, { name: 'Rondonópolis' }, { name: 'Sinop' },
    { name: 'Tangará da Serra' }, { name: 'Cáceres' }, { name: 'Sorriso' }, { name: 'Lucas do Rio Verde' },
    { name: 'Barra do Garças' }, { name: 'Primavera do Leste' }, { name: 'Alta Floresta' }, { name: 'Poxoréu' },
    { name: 'Diamantino' }, { name: 'Juína' }, { name: 'Nova Mutum' }, { name: 'Colíder' },
    { name: 'Pontes e Lacerda' }, { name: 'Campo Verde' }
  ],
  'MS': [
    { name: 'Campo Grande' }, { name: 'Dourados' }, { name: 'Três Lagoas' }, { name: 'Corumbá' },
    { name: 'Ponta Porã' }, { name: 'Naviraí' }, { name: 'Nova Andradina' }, { name: 'Sidrolândia' },
    { name: 'Maracaju' }, { name: 'São Gabriel do Oeste' }, { name: 'Coxim' }, { name: 'Aquidauana' },
    { name: 'Paranaíba' }, { name: 'Cassilândia' }, { name: 'Amambai' }, { name: 'Ribas do Rio Pardo' },
    { name: 'Jardim' }, { name: 'Ivinhema' }, { name: 'Chapadão do Sul' }
  ],
  'MG': [
    { name: 'Belo Horizonte' }, { name: 'Uberlândia' }, { name: 'Contagem' }, { name: 'Juiz de Fora' },
    { name: 'Betim' }, { name: 'Montes Claros' }, { name: 'Ribeirão das Neves' }, { name: 'Uberaba' },
    { name: 'Governador Valadares' }, { name: 'Ipatinga' }, { name: 'Sete Lagoas' }, { name: 'Divinópolis' },
    { name: 'Santa Luzia' }, { name: 'Ibirité' }, { name: 'Poços de Caldas' }, { name: 'Patos de Minas' },
    { name: 'Pouso Alegre' }, { name: 'Teófilo Otoni' }, { name: 'Barbacena' }, { name: 'Sabará' },
    { name: 'Varginha' }, { name: 'Conselheiro Lafaiete' }, { name: 'Vespasiano' }
  ],
  'PA': [
    { name: 'Belém' }, { name: 'Ananindeua' }, { name: 'Santarém' }, { name: 'Marabá' },
    { name: 'Parauapebas' }, { name: 'Castanhal' }, { name: 'Abaetetuba' }, { name: 'Cametá' },
    { name: 'Marituba' }, { name: 'Altamira' }, { name: 'Tucuruí' }, { name: 'Bragança' },
    { name: 'Paragominas' }, { name: 'Redenção' }, { name: 'Barcarena' }, { name: 'Tailândia' },
    { name: 'Oriximiná' }, { name: 'Capanema' }, { name: 'Tome-Açu' }, { name: 'Vigia' }
  ],
  'PB': [
    { name: 'João Pessoa' }, { name: 'Campina Grande' }, { name: 'Santa Rita' }, { name: 'Patos' },
    { name: 'Bayeux' }, { name: 'Sousa' }, { name: 'Cajazeiras' }, { name: 'Cabedelo' },
    { name: 'Guarabira' }, { name: 'Mamanguape' }, { name: 'Sapé' }, { name: 'Desterro' },
    { name: 'Rio Tinto' }, { name: 'Conde' }, { name: 'Monteiro' }, { name: 'Picuí' },
    { name: 'Itabaiana' }, { name: 'Esperança' }, { name: 'Pombal' }, { name: 'Princesa Isabel' }
  ],
  'PR': [
    { name: 'Curitiba' }, { name: 'Londrina' }, { name: 'Maringá' }, { name: 'Ponta Grossa' },
    { name: 'Cascavel' }, { name: 'São José dos Pinhais' }, { name: 'Foz do Iguaçu' }, { name: 'Colombo' },
    { name: 'Guarapuava' }, { name: 'Paranaguá' }, { name: 'Araucária' }, { name: 'Toledo' },
    { name: 'Apucarana' }, { name: 'Pinhais' }, { name: 'Campo Largo' }, { name: 'Arapongas' },
    { name: 'Almirante Tamandaré' }, { name: 'Umuarama' }, { name: 'Piraquara' }, { name: 'Cambé' },
    { name: 'São Carlos' }, { name: 'Fazenda Rio Grande' }
  ],
  'PE': [
    { name: 'Recife' }, { name: 'Jaboatão dos Guararapes' }, { name: 'Olinda' }, { name: 'Caruaru' },
    { name: 'Petrolina' }, { name: 'Paulista' }, { name: 'Cabo de Santo Agostinho' }, { name: 'Camaragibe' },
    { name: 'Garanhuns' }, { name: 'Vitória de Santo Antão' }, { name: 'Igarassu' }, { name: 'São Lourenço da Mata' },
    { name: 'Santa Cruz do Capibaribe' }, { name: 'Abreu e Lima' }, { name: 'Ipojuca' }, { name: 'Serra Talhada' },
    { name: 'Araripina' }, { name: 'Gravatá' }, { name: 'Carpina' }, { name: 'Goiana' }, { name: 'Belo Jardim' }
  ],
  'PI': [
    { name: 'Teresina' }, { name: 'Parnaíba' }, { name: 'Picos' }, { name: 'Piripiri' },
    { name: 'Floriano' }, { name: 'Campo Maior' }, { name: 'União' }, { name: 'Altos' },
    { name: 'Pedro II' }, { name: 'Barras' }, { name: 'São Raimundo Nonato' }, { name: 'Valença do Piauí' },
    { name: 'Oeiras' }, { name: 'Esperantina' }, { name: 'José de Freitas' }, { name: 'Luís Correia' },
    { name: 'Bom Jesus' }, { name: 'Uruçuí' }
  ],
  'RJ': [
    { name: 'Rio de Janeiro' }, { name: 'São Gonçalo' }, { name: 'Duque de Caxias' }, { name: 'Nova Iguaçu' },
    { name: 'Niterói' }, { name: 'Belford Roxo' }, { name: 'São João de Meriti' }, { name: 'Campos dos Goytacazes' },
    { name: 'Petrópolis' }, { name: 'Volta Redonda' }, { name: 'Magé' }, { name: 'Itaboraí' },
    { name: 'Mesquita' }, { name: 'Nova Friburgo' }, { name: 'Barra Mansa' }, { name: 'Angra dos Reis' },
    { name: 'Resende' }, { name: 'Cabo Frio' }, { name: 'Queimados' }, { name: 'Teresópolis' },
    { name: 'Macaé' }, { name: 'Nilópolis' }, { name: 'Maricá' }, { name: 'Rio das Ostras' }
  ],
  'RN': [
    { name: 'Natal' }, { name: 'Mossoró' }, { name: 'Parnamirim' }, { name: 'São Gonçalo do Amarante' },
    { name: 'Macaíba' }, { name: 'Ceará-Mirim' }, { name: 'Caicó' }, { name: 'Assu' },
    { name: 'Currais Novos' }, { name: 'Nova Cruz' }, { name: 'São José de Mipibu' }, { name: 'Santa Cruz' },
    { name: 'Pau dos Ferros' }, { name: 'João Câmara' }, { name: 'Canguaretama' }, { name: 'Touros' },
    { name: 'Extremoz' }, { name: 'Apodi' }, { name: 'Goianinha' }
  ],
  'RS': [
    { name: 'Porto Alegre' }, { name: 'Caxias do Sul' }, { name: 'Pelotas' }, { name: 'Canoas' },
    { name: 'Santa Maria' }, { name: 'Gravataí' }, { name: 'Viamão' }, { name: 'Novo Hamburgo' },
    { name: 'São Leopoldo' }, { name: 'Rio Grande' }, { name: 'Alvorada' }, { name: 'Passo Fundo' },
    { name: 'Sapucaia do Sul' }, { name: 'Uruguaiana' }, { name: 'Santa Cruz do Sul' }, { name: 'Cachoeirinha' },
    { name: 'Bagé' }, { name: 'Bento Gonçalves' }, { name: 'Erechim' }, { name: 'Guaíba' },
    { name: 'Cachoeira do Sul' }, { name: 'Santana do Livramento' }, { name: 'Esteio' }, { name: 'Ijuí' }
  ],
  'RO': [
    { name: 'Porto Velho' }, { name: 'Ji-Paraná' }, { name: 'Ariquemes' }, { name: 'Vilhena' },
    { name: 'Cacoal' }, { name: 'Rolim de Moura' }, { name: 'Guajará-Mirim' }, { name: 'Jaru' },
    { name: 'Ouro Preto do Oeste' }, { name: 'Presidente Médici' }, { name: 'Espigão do Oeste' }, { name: 'Colorado do Oeste' },
    { name: 'Cerejeiras' }, { name: 'Buritis' }, { name: 'Alta Floresta do Oeste' }, { name: 'Pimenta Bueno' }
  ],
  'RR': [
    { name: 'Boa Vista' }, { name: 'Rorainópolis' }, { name: 'Caracaraí' }, { name: 'Alto Alegre' },
    { name: 'Mucajaí' }, { name: 'São João da Baliza' }, { name: 'São Luiz' }, { name: 'Bonfim' },
    { name: 'Cantá' }, { name: 'Normandia' }, { name: 'Pacaraima' }, { name: 'Iracema' },
    { name: 'Amajari' }, { name: 'Caroebe' }, { name: 'Uiramutã' }
  ],
  'SC': [
    { name: 'Florianópolis' }, { name: 'Joinville' }, { name: 'Blumenau' }, { name: 'São José' },
    { name: 'Criciúma' }, { name: 'Chapecó' }, { name: 'Itajaí' }, { name: 'Lages' },
    { name: 'Jaraguá do Sul' }, { name: 'Palhoça' }, { name: 'Balneário Camboriú' }, { name: 'Brusque' },
    { name: 'Tubarão' }, { name: 'São Bento do Sul' }, { name: 'Caçador' }, { name: 'Camboriú' },
    { name: 'Navegantes' }, { name: 'Concórdia' }, { name: 'Rio do Sul' }, { name: 'Araranguá' },
    { name: 'Gaspar' }, { name: 'Biguaçu' }, { name: 'Indaial' }, { name: 'Itapema' }
  ],
  'SP': [
    { name: 'São Paulo' }, { name: 'Guarulhos' }, { name: 'Campinas' }, { name: 'São Bernardo do Campo' },
    { name: 'Santo André' }, { name: 'Osasco' }, { name: 'Ribeirão Preto' }, { name: 'Sorocaba' },
    { name: 'Mauá' }, { name: 'São José dos Campos' }, { name: 'Santos' }, { name: 'Diadema' },
    { name: 'Jundiaí' }, { name: 'Carapicuíba' }, { name: 'Piracicaba' }, { name: 'Bauru' },
    { name: 'São Vicente' }, { name: 'Itaquaquecetuba' }, { name: 'Franca' }, { name: 'Guarujá' },
    { name: 'Taubaté' }, { name: 'Praia Grande' }, { name: 'Limeira' }, { name: 'Suzano' },
    { name: 'Americana' }, { name: 'Nova Iguaçu' }
  ],
  'SE': [
    { name: 'Aracaju' }, { name: 'Nossa Senhora do Socorro' }, { name: 'Lagarto' }, { name: 'Itabaiana' },
    { name: 'São Cristóvão' }, { name: 'Estância' }, { name: 'Tobias Barreto' }, { name: 'Simão Dias' },
    { name: 'Propriá' }, { name: 'Barra dos Coqueiros' }, { name: 'Laranjeiras' }, { name: 'Capela' },
    { name: 'Ribeirópolis' }, { name: 'Poço Redondo' }, { name: 'Canindé de São Francisco' }
  ],
  'TO': [
    { name: 'Palmas' }, { name: 'Araguaína' }, { name: 'Gurupi' }, { name: 'Porto Nacional' },
    { name: 'Paraíso do Tocantins' }, { name: 'Colinas do Tocantins' }, { name: 'Guaraí' }, { name: 'Tocantinópolis' },
    { name: 'Miracema do Tocantins' }, { name: 'Araguatins' }, { name: 'Dianópolis' }, { name: 'Augustinópolis' },
    { name: 'Pedro Afonso' }, { name: 'Xambioá' }
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

    // Primeiro, usar dados de fallback imediatamente para melhor UX
    const cidadesFallback = CIDADES_FALLBACK[estadoCode];
    if (cidadesFallback) {
      console.log('[useIBGELocations] Carregando dados de fallback para', estadoCode, ':', cidadesFallback.length);
      setData(prev => ({
        ...prev,
        cidadesPorEstado: {
          ...prev.cidadesPorEstado,
          [estadoCode]: cidadesFallback
        }
      }));
    }

    // Tentar carregar da API em segundo plano (apenas como enhancement)
    try {
      console.log('[useIBGELocations] Tentando carregar cidades da API para:', estadoCode);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Timeout maior para estados grandes
      
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoCode}/municipios?orderBy=nome`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const cidades = await response.json();
      
      // Só atualizar se trouxer dados significativamente melhores
      if (cidades && cidades.length > 0) {
        const cidadesFormatadas = cidades.map((cidade: any) => ({
          name: cidade.nome
        }));
        
        console.log('[useIBGELocations] Cidades da API carregadas para', estadoCode, ':', cidadesFormatadas.length);
        
        // Só substituir se a API trouxer mais cidades que o fallback
        if (!cidadesFallback || cidadesFormatadas.length > cidadesFallback.length) {
          setData(prev => ({
            ...prev,
            cidadesPorEstado: {
              ...prev.cidadesPorEstado,
              [estadoCode]: cidadesFormatadas
            }
          }));
        }
      }
      
    } catch (error) {
      console.log('[useIBGELocations] API indisponível para', estadoCode, '- mantendo dados de fallback:', error.message);
      
      // Se não conseguiu carregar fallback antes, usar dados básicos
      if (!cidadesFallback) {
        const cidadesBasicas = [
          { name: 'Capital' },
          { name: 'Região Metropolitana' },
          { name: 'Interior' },
          { name: 'Outros municípios' }
        ];
        
        setData(prev => ({
          ...prev,
          cidadesPorEstado: {
            ...prev.cidadesPorEstado,
            [estadoCode]: cidadesBasicas
          }
        }));
      }
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
