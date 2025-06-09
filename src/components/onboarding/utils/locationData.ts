
export const brazilianStates = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

export const getCitiesByState = (state: string): string[] => {
  const citiesByState: Record<string, string[]> = {
    'SP': [
      'São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André',
      'Osasco', 'Ribeirão Preto', 'Sorocaba', 'Mauá', 'São José dos Campos',
      'Santos', 'Diadema', 'Jundiaí', 'Carapicuíba', 'Piracicaba', 'Bauru',
      'São Vicente', 'Itaquaquecetuba', 'Franca', 'Guarujá', 'Taubaté',
      'Praia Grande', 'Limeira', 'Suzano', 'Americana', 'Nova Iguaçu'
    ],
    'RJ': [
      'Rio de Janeiro', 'Niterói', 'Nova Iguaçu', 'Duque de Caxias', 'São Gonçalo',
      'Volta Redonda', 'Petrópolis', 'Magé', 'Itaboraí', 'Mesquita',
      'Nova Friburgo', 'Barra Mansa', 'São João de Meriti', 'Campos dos Goytacazes',
      'Belford Roxo', 'Angra dos Reis', 'Resende', 'Cabo Frio', 'Queimados',
      'Teresópolis', 'Macaé', 'Nilópolis', 'Maricá', 'Rio das Ostras'
    ],
    'MG': [
      'Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim',
      'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares',
      'Ipatinga', 'Sete Lagoas', 'Divinópolis', 'Santa Luzia', 'Ibirité',
      'Poços de Caldas', 'Patos de Minas', 'Pouso Alegre', 'Teófilo Otoni',
      'Barbacena', 'Sabará', 'Varginha', 'Conselheiro Lafaiete', 'Vespasiano'
    ],
    'RS': [
      'Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria',
      'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande',
      'Alvorada', 'Passo Fundo', 'Sapucaia do Sul', 'Uruguaiana', 'Santa Cruz do Sul',
      'Cachoeirinha', 'Bagé', 'Bento Gonçalves', 'Erechim', 'Guaíba',
      'Cachoeira do Sul', 'Santana do Livramento', 'Esteio', 'Ijuí'
    ],
    'PR': [
      'Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel',
      'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava',
      'Paranaguá', 'Araucária', 'Toledo', 'Apucarana', 'Pinhais',
      'Campo Largo', 'Arapongas', 'Almirante Tamandaré', 'Umuarama',
      'Piraquara', 'Cambé', 'São Carlos', 'Fazenda Rio Grande'
    ],
    'SC': [
      'Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma',
      'Chapecó', 'Itajaí', 'Lages', 'Jaraguá do Sul', 'Palhoça',
      'Balneário Camboriú', 'Brusque', 'Tubarão', 'São Bento do Sul',
      'Caçador', 'Camboriú', 'Navegantes', 'Concórdia', 'Rio do Sul',
      'Araranguá', 'Gaspar', 'Biguaçu', 'Indaial', 'Itapema'
    ],
    'BA': [
      'Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari',
      'Itabuna', 'Juazeiro', 'Lauro de Freitas', 'Ilhéus', 'Jequié',
      'Teixeira de Freitas', 'Alagoinhas', 'Porto Seguro', 'Simões Filho',
      'Paulo Afonso', 'Eunápolis', 'Santo Antônio de Jesus', 'Valença',
      'Candeias', 'Guanambi', 'Jacobina', 'Serrinha', 'Senhor do Bonfim'
    ],
    'GO': [
      'Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia',
      'Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Trindade', 'Formosa',
      'Novo Gama', 'Itumbiara', 'Senador Canedo', 'Catalão', 'Jataí',
      'Planaltina', 'Caldas Novas', 'Santo Antônio do Descoberto', 'Goianésia',
      'Cidade Ocidental', 'Mineiros', 'Cristalina', 'Inhumas'
    ],
    'CE': [
      'Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral',
      'Crato', 'Itapipoca', 'Maranguape', 'Iguatu', 'Quixadá',
      'Canindé', 'Aquiraz', 'Pacatuba', 'Crateús', 'Russas',
      'Aracati', 'Cascavel', 'Pacajus', 'Icó', 'Horizonte',
      'Camocim', 'Morada Nova', 'Acaraú', 'Viçosa do Ceará'
    ],
    'PE': [
      'Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina',
      'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns',
      'Vitória de Santo Antão', 'Igarassu', 'São Lourenço da Mata',
      'Santa Cruz do Capibaribe', 'Abreu e Lima', 'Ipojuca', 'Serra Talhada',
      'Araripina', 'Gravatá', 'Carpina', 'Goiana', 'Belo Jardim'
    ],
    'PA': [
      'Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas',
      'Castanhal', 'Abaetetuba', 'Cametá', 'Marituba', 'Altamira',
      'Tucuruí', 'Bragança', 'Paragominas', 'Redenção', 'Barcarena',
      'Tailândia', 'Oriximiná', 'Capanema', 'Tome-Açu', 'Vigia'
    ],
    'MA': [
      'São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias',
      'Codó', 'Paço do Lumiar', 'Açailândia', 'Bacabal', 'Balsas',
      'Santa Inês', 'Pinheiro', 'Pedreiras', 'Chapadinha', 'Santa Luzia',
      'Barra do Corda', 'Itapecuru Mirim', 'Coroatá', 'Rosário', 'Viana'
    ],
    'PB': [
      'João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux',
      'Sousa', 'Cajazeiras', 'Cabedelo', 'Guarabira', 'Mamanguape',
      'Sapé', 'Desterro', 'Rio Tinto', 'Conde', 'Monteiro',
      'Picuí', 'Itabaiana', 'Esperança', 'Pombal', 'Princesa Isabel'
    ],
    'AL': [
      'Maceió', 'Arapiraca', 'Rio Largo', 'Palmeira dos Índios', 'União dos Palmares',
      'Penedo', 'Coruripe', 'Marechal Deodoro', 'São Miguel dos Campos',
      'Santana do Ipanema', 'Delmiro Gouveia', 'Campo Alegre', 'Murici',
      'Pilar', 'Girau do Ponciano', 'Igaci', 'Porto Calvo', 'Viçosa'
    ],
    'RN': [
      'Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba',
      'Ceará-Mirim', 'Caicó', 'Assu', 'Currais Novos', 'Nova Cruz',
      'São José de Mipibu', 'Santa Cruz', 'Pau dos Ferros', 'João Câmara',
      'Canguaretama', 'Touros', 'Extremoz', 'Apodi', 'Goianinha'
    ],
    'SE': [
      'Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão',
      'Estância', 'Tobias Barreto', 'Simão Dias', 'Propriá', 'Barra dos Coqueiros',
      'Laranjeiras', 'Capela', 'Ribeirópolis', 'Poço Redondo', 'Canindé de São Francisco'
    ],
    'PI': [
      'Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano',
      'Campo Maior', 'União', 'Altos', 'Pedro II', 'Barras',
      'São Raimundo Nonato', 'Valença do Piauí', 'Oeiras', 'Esperantina',
      'José de Freitas', 'Luís Correia', 'Bom Jesus', 'Uruçuí'
    ],
    'MT': [
      'Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra',
      'Cáceres', 'Sorriso', 'Lucas do Rio Verde', 'Barra do Garças',
      'Primavera do Leste', 'Alta Floresta', 'Poxoréu', 'Diamantino',
      'Juína', 'Nova Mutum', 'Colíder', 'Pontes e Lacerda', 'Campo Verde'
    ],
    'MS': [
      'Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã',
      'Naviraí', 'Nova Andradina', 'Sidrolândia', 'Maracaju', 'São Gabriel do Oeste',
      'Coxim', 'Aquidauana', 'Paranaíba', 'Cassilândia', 'Amambai',
      'Ribas do Rio Pardo', 'Jardim', 'Ivinhema', 'Chapadão do Sul'
    ],
    'ES': [
      'Vitória', 'Cariacica', 'Vila Velha', 'Serra', 'Cachoeiro de Itapemirim',
      'Linhares', 'São Mateus', 'Colatina', 'Guarapari', 'Aracruz',
      'Viana', 'Nova Venécia', 'Barra de São Francisco', 'Santa Teresa',
      'Anchieta', 'Castelo', 'Marataízes', 'Itapemirim', 'Domingos Martins'
    ],
    'RO': [
      'Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal',
      'Rolim de Moura', 'Guajará-Mirim', 'Jaru', 'Ouro Preto do Oeste',
      'Presidente Médici', 'Espigão do Oeste', 'Colorado do Oeste',
      'Cerejeiras', 'Buritis', 'Alta Floresta do Oeste', 'Pimenta Bueno'
    ],
    'AC': [
      'Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá',
      'Feijó', 'Brasileia', 'Plácido de Castro', 'Xapuri',
      'Senador Guiomard', 'Epitaciolândia', 'Mâncio Lima', 'Rodrigues Alves'
    ],
    'AM': [
      'Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari',
      'Tefé', 'Tabatinga', 'Maués', 'São Gabriel da Cachoeira',
      'Humaitá', 'Lábrea', 'Iranduba', 'Presidente Figueiredo', 'Carauari'
    ],
    'AP': [
      'Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Mazagão',
      'Porto Grande', 'Tartarugalzinho', 'Vitória do Jari', 'Amapá',
      'Ferreira Gomes', 'Pracuúba', 'Calçoene', 'Cutias', 'Itaubal'
    ],
    'RR': [
      'Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre', 'Mucajaí',
      'São João da Baliza', 'São Luiz', 'Bonfim', 'Cantá', 'Normandia',
      'Pacaraima', 'Iracema', 'Amajari', 'Caroebe', 'Uiramutã'
    ],
    'TO': [
      'Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins',
      'Colinas do Tocantins', 'Guaraí', 'Tocantinópolis', 'Miracema do Tocantins',
      'Araguatins', 'Dianópolis', 'Augustinópolis', 'Pedro Afonso', 'Xambioá'
    ],
    'DF': [
      'Brasília', 'Gama', 'Taguatinga', 'Ceilândia', 'Sobradinho',
      'Planaltina', 'Samambaia', 'Santa Maria', 'São Sebastião',
      'Recanto das Emas', 'Águas Claras', 'Riacho Fundo', 'Guará',
      'Cruzeiro', 'Sudoeste/Octogonal', 'Vicente Pires'
    ]
  };

  return citiesByState[state] || [];
};
