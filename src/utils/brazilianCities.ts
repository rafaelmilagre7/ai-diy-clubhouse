// Utilitário para estados e cidades brasileiras
// Utilizando dados oficiais para máxima cobertura

export interface State {
  code: string;
  name: string;
}

export const BRAZILIAN_STATES: State[] = [
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

// Lista completa de cidades brasileiras por estado (principais)
// Expandida com cidades médias e pequenas importantes
export const CITIES_BY_STATE: Record<string, string[]> = {
  'AC': [
    'Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó', 
    'Brasiléia', 'Plácido de Castro', 'Xapuri', 'Epitaciolândia', 'Mâncio Lima',
    'Rodrigues Alves', 'Porto Walter', 'Marechal Thaumaturgo', 'Jordão', 'Santa Rosa do Purus',
    'Manoel Urbano', 'Senador Guiomard', 'Capixaba', 'Acrelândia', 'Assis Brasil',
    'Bujari', 'Porto Acre'
  ],
  'AL': [
    'Maceió', 'Arapiraca', 'Palmeira dos Índios', 'Rio Largo', 'Penedo', 'União dos Palmares',
    'Coruripe', 'São Miguel dos Campos', 'Santana do Ipanema', 'Delmiro Gouveia',
    'Campo Alegre', 'Viçosa', 'Marechal Deodoro', 'Pilar', 'São Sebastião',
    'Murici', 'Porto Calvo', 'Atalaia', 'São Luís do Quitunde', 'Porto de Pedras',
    'Girau do Ponciano', 'Água Branca', 'Pão de Açúcar', 'Piranhas', 'Mata Grande',
    'Santana do Mundaú', 'Igreja Nova', 'Junqueiro', 'Craíbas', 'São José da Laje'
  ],
  'AP': [
    'Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Mazagão',
    'Porto Grande', 'Pedra Branca do Amapari', 'Vitória do Jari', 'Tartarugalzinho',
    'Amapá', 'Ferreira Gomes', 'Pracuúba', 'Calçoene', 'Itaubal',
    'Cutias', 'Serra do Navio'
  ],
  'AM': [
    'Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari', 'Tefé',
    'Tabatinga', 'Maués', 'São Gabriel da Cachoeira', 'Humaitá',
    'Lábrea', 'Eirunepé', 'Manicoré', 'Carauari', 'Autazes',
    'Barcelos', 'Borba', 'Nova Olinda do Norte', 'Presidente Figueiredo', 'Iranduba',
    'Rio Preto da Eva', 'Urucará', 'São Paulo de Olivença', 'Benjamin Constant', 'Fonte Boa',
    'Jutaí', 'Tonantins', 'Amaturá', 'Santo Antônio do Içá', 'Atalaia do Norte'
  ],
  'BA': [
    'Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro', 'Ilhéus', 'Itabuna', 'Lauro de Freitas',
    'Jequié', 'Teixeira de Freitas', 'Alagoinhas', 'Porto Seguro', 'Simões Filho', 'Paulo Afonso', 'Eunápolis',
    'Santo Antônio de Jesus', 'Valença', 'Candeias', 'Guanambi', 'Jacobina', 'Serrinha', 'Senhor do Bonfim',
    'Dias d\'Ávila', 'Luís Eduardo Magalhães', 'Itapetinga', 'Irecê', 'Campo Formoso', 'Casa Nova', 'Bom Jesus da Lapa',
    'Conceição do Coité', 'Itamaraju', 'Itaberaba', 'Cruz das Almas', 'Ipirá', 'Seabra', 'Ribeira do Pombal',
    'Livramento de Nossa Senhora', 'Cachoeira', 'Itanhém', 'Catu', 'Esplanada', 'Monte Santo', 'Itaparica',
    'Una', 'Tucano', 'Brumado', 'Caetité', 'São Francisco do Conde', 'Entre Rios', 'Madre de Deus'
  ],
  'CE': [
    'Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca',
    'Maranguape', 'Iguatu', 'Quixadá', 'Canindé', 'Aquiraz', 'Pacatuba', 'Crateús',
    'Russas', 'Boa Viagem', 'Limoeiro do Norte', 'Jijoca de Jericoacoara', 'Aracati', 'Cascavel',
    'Pacajus', 'Icó', 'Horizonte', 'Camocim', 'Morada Nova', 'Acaraú', 'Viçosa do Ceará',
    'Barbalha', 'Baturité', 'Tianguá', 'Tauá', 'São Gonçalo do Amarante', 'Granja', 'Paracuru',
    'Guaraciaba do Norte', 'Ipu', 'Ubajara', 'Novo Oriente', 'Independência', 'Quixeramobim'
  ],
  'DF': [
    'Brasília', 'Taguatinga', 'Ceilândia', 'Samambaia', 'Planaltina', 'Águas Claras',
    'Guará', 'Sobradinho', 'Gama', 'Santa Maria', 'São Sebastião', 'Recanto das Emas',
    'Paranoá', 'Núcleo Bandeirante', 'Riacho Fundo', 'Candangolândia', 'Brazlândia',
    'Lago Sul', 'Lago Norte', 'Park Way', 'Cruzeiro', 'Sudoeste/Octogonal'
  ],
  'ES': [
    'Vitória', 'Vila Velha', 'Cariacica', 'Serra', 'Guarapari', 'Linhares', 'São Mateus', 'Colatina', 'Cachoeiro de Itapemirim',
    'Aracruz', 'Viana', 'Nova Venécia', 'Barra de São Francisco', 'Santa Teresa', 'Domingos Martins',
    'Piúma', 'Marataízes', 'Itapemirim', 'Anchieta', 'Alfredo Chaves', 'Santa Maria de Jetibá',
    'João Neiva', 'Fundão', 'Conceição da Barra', 'Pedro Canário', 'Jaguaré', 'Sooretama',
    'Rio Bananal', 'Baixo Guandu', 'Governador Lindenberg', 'Marilândia', 'São Gabriel da Palha',
    'Vila Pavão', 'Pancas', 'São Domingos do Norte', 'Águia Branca', 'Mantenópolis'
  ],
  'GO': [
    'Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás', 'Valparaíso de Goiás',
    'Trindade', 'Formosa', 'Novo Gama', 'Itumbiara', 'Senador Canedo', 'Catalão', 'Jataí',
    'Planaltina', 'Caldas Novas', 'Santo Antônio do Descoberto', 'Goiás', 'Cidade Ocidental', 'Mineiros',
    'Cristalina', 'Inhumas', 'Iporá', 'Uruaçu', 'Porangatu', 'Quirinópolis', 'Goianésia',
    'Hidrolândia', 'Ceres', 'São Luís de Montes Belos', 'Alexânia', 'Morrinhos', 'Piracanjuba',
    'Bom Jesus de Goiás', 'Cabeceiras', 'Padre Bernardo', 'Ipameri', 'Goiatuba', 'Silvânia'
  ],
  'MA': [
    'São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias', 'Codó', 'Paço do Lumiar',
    'Açailândia', 'Bacabal', 'Balsas', 'Santa Inês', 'Pinheiro', 'Pedreiras', 'Barra do Corda',
    'Chapadinha', 'Santa Luzia', 'Viana', 'Grajaú', 'Itapecuru Mirim', 'Coelho Neto',
    'Presidente Dutra', 'São João Batista', 'Rosário', 'Tutóia', 'Barreirinhas', 'Carolina',
    'Estreito', 'Porto Franco', 'Riachão', 'Colinas', 'Buriti Bravo', 'Lago da Pedra',
    'São Raimundo das Mangabeiras', 'Tuntum', 'Mata Roma', 'São Domingos do Maranhão'
  ],
  'MT': [
    'Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Cáceres', 'Barra do Garças',
    'Primavera do Leste', 'Alta Floresta', 'Sorriso', 'Lucas do Rio Verde', 'Diamantino',
    'Nova Mutum', 'Poconé', 'Juína', 'Colíder', 'Água Boa', 'Pontes e Lacerda', 'Campo Verde',
    'Guarantã do Norte', 'Peixoto de Azevedo', 'São José do Rio Claro', 'Nova Olímpia', 'Matupá',
    'Jaciara', 'São José dos Quatro Marcos', 'Araputanga', 'Mirassol d\'Oeste', 'Chapada dos Guimarães',
    'São Félix do Araguaia', 'Campo Novo do Parecis', 'Brasnorte', 'Feliz Natal', 'Terra Nova do Norte'
  ],
  'MS': [
    'Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã', 'Aquidauana',
    'Sidrolândia', 'Naviraí', 'Nova Andradina', 'Maracaju', 'Coxim', 'São Gabriel do Oeste',
    'Paranaíba', 'Bonito', 'Miranda', 'Ribas do Rio Pardo', 'Chapadão do Sul', 'Jardim',
    'Iguatemi', 'Cassilândia', 'Anastácio', 'Amambai', 'Ivinhema', 'Bataguassu',
    'Nova Alvorada do Sul', 'Costa Rica', 'Rio Brilhante', 'Eldorado', 'Aparecida do Taboado',
    'Caarapó', 'Bela Vista', 'Angélica', 'Glória de Dourados', 'Mundo Novo'
  ],
  'MG': [
    'Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba',
    'Governador Valadares', 'Ipatinga', 'Sete Lagoas', 'Divinópolis', 'Santa Luzia', 'Ibirité', 'Poços de Caldas',
    'Patos de Minas', 'Pouso Alegre', 'Teófilo Otoni', 'Barbacena', 'Sabará', 'Vespasiano', 'Conselheiro Lafaiete',
    'Varginha', 'Araguari', 'Ituiutaba', 'Passos', 'Coronel Fabriciano', 'Muriaé', 'Boa Esperança', 'Ubá',
    'Alfenas', 'João Monlevade', 'Três Corações', 'Viçosa', 'Cataguases', 'Ouro Preto', 'Janaúba',
    'São João del Rei', 'Patrocínio', 'Timóteo', 'Manhuaçu', 'Unaí', 'Curvelo', 'Alfenas', 'Lavras',
    'Nova Lima', 'Pará de Minas', 'Itabira', 'Paracatu', 'Caratinga', 'Nova Serrana', 'São Sebastião do Paraíso'
  ],
  'PA': [
    'Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas', 'Castanhal', 'Abaetetuba',
    'Cametá', 'Marituba', 'Tucuruí', 'Bragança', 'Paragominas', 'Redenção', 'Altamira',
    'Itaituba', 'Oriximiná', 'Breves', 'Benevides', 'Capanema', 'Tailândia',
    'Barcarena', 'Moju', 'Tome-Açu', 'Vigia', 'São Felix do Xingu', 'Conceição do Araguaia',
    'Dom Eliseu', 'Capitão Poço', 'Marapanim', 'Salinópolis', 'Xinguara', 'Óbidos',
    'Monte Alegre', 'Soure', 'São Miguel do Guamá', 'Igarapé-Miri', 'Santa Isabel do Pará'
  ],
  'PB': [
    'João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa', 'Cajazeiras',
    'Guarabira', 'Sapé', 'Cabedelo', 'Mamanguape', 'São Bento', 'Esperança', 'Mari',
    'Conde', 'Monteiro', 'Picuí', 'Itabaiana', 'Alagoa Grande', 'Princesa Isabel',
    'Bananeiras', 'Pombal', 'Cruz do Espírito Santo', 'Solânea', 'Queimadas',
    'Areia', 'Cuité', 'Desterro', 'Lucena', 'Rio Tinto', 'São João do Cariri',
    'Umbuzeiro', 'Taperoá', 'Alagoinha', 'Catolé do Rocha', 'Ingá'
  ],
  'PE': [
    'Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho',
    'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão', 'São Lourenço da Mata', 'Arcoverde', 'Igarassu',
    'Abreu e Lima', 'Ipojuca', 'Serra Talhada', 'Araripina', 'Gravatá', 'Carpina', 'Goiana',
    'Belo Jardim', 'Ouricuri', 'Escada', 'Pesqueira', 'Surubim', 'Palmares', 'Bezerros',
    'São José do Egito', 'Timbaúba', 'Limoeiro', 'Paudalho', 'Buíque', 'Afogados da Ingazeira',
    'Santa Cruz do Capibaribe', 'São Bento do Una', 'Moreno', 'Nazaré da Mata', 'Salgueiro'
  ],
  'PI': [
    'Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano', 'Campo Maior', 'Barras',
    'União', 'Altos', 'Pedro II', 'Esperantina', 'José de Freitas', 'Oeiras', 'Valença',
    'São Raimundo Nonato', 'Bom Jesus', 'Corrente', 'Uruçuí', 'Amarante', 'Regeneração',
    'Luzilândia', 'Cocal', 'São João do Piauí', 'Piracuruca', 'Água Branca', 'Simplício Mendes',
    'Buriti dos Lopes', 'Marcos Parente', 'Demerval Lobão', 'Miguel Alves', 'Fronteiras',
    'Inhuma', 'Canto do Buriti', 'Beneditinos', 'Gilbués', 'Cristino Castro'
  ],
  'PR': [
    'Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo',
    'Guarapuava', 'Paranaguá', 'Apucarana', 'Toledo', 'Pinhais', 'Campo Largo', 'Arapongas',
    'Almirante Tamandaré', 'Umuarama', 'Paranavaí', 'Cambé', 'Araucária', 'Fazenda Rio Grande', 'Sarandi',
    'São Carlos', 'Francisco Beltrão', 'Cianorte', 'Telêmaco Borba', 'Castro', 'Rolândia',
    'Irati', 'União da Vitória', 'Ibiporã', 'Prudentópolis', 'Marechal Cândido Rondon', 'Cornélio Procópio',
    'São Mateus do Sul', 'Palmas', 'Ivaiporã', 'Santo Antônio da Platina', 'Jacarezinho', 'Bandeirantes'
  ],
  'RJ': [
    'Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Belford Roxo', 'Campos dos Goytacazes', 'São João de Meriti',
    'Petrópolís', 'Volta Redonda', 'Magé', 'Mesquita', 'Nova Friburgo', 'Barra Mansa', 'Macaé',
    'Cabo Frio', 'Nilópolis', 'Teresópolis', 'Resende', 'Angra dos Reis', 'Itaboraí', 'Queimados',
    'Japeri', 'Itaguaí', 'São Pedro da Aldeia', 'Araruama', 'Barra do Piraí', 'Seropédica',
    'Rio das Ostras', 'Saquarema', 'Três Rios', 'Valença', 'Rio Bonito', 'Paraíba do Sul',
    'São Francisco de Itabapoana', 'Itaperuna', 'Cachoeiras de Macacu', 'Casimiro de Abreu', 'Tanguá'
  ],
  'RN': [
    'Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba', 'Ceará-Mirim',
    'Caicó', 'Açu', 'Currais Novos', 'Santa Cruz', 'São José de Mipibu', 'Nova Cruz',
    'João Câmara', 'Pau dos Ferros', 'Extremoz', 'Touros', 'Apodi', 'Areia Branca',
    'Baía Formosa', 'Canguaretama', 'São Paulo do Potengi', 'Pedro Velho', 'Nísia Floresta',
    'Monte Alegre', 'São Miguel', 'Goianinha', 'Vera Cruz', 'Tibau do Sul', 'Macau',
    'Parelhas', 'Jucurutu', 'Martins', 'Patu', 'Alexandria', 'Caraúbas'
  ],
  'RO': [
    'Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal', 'Rolim de Moura',
    'Guajará-Mirim', 'Jaru', 'Ouro Preto do Oeste', 'Buritis', 'Machadinho d\'Oeste',
    'Colorado do Oeste', 'Cerejeiras', 'Espigão d\'Oeste', 'Pimenta Bueno', 'Presidente Médici',
    'São Miguel do Guaporé', 'Cujubim', 'Nova Brasilândia d\'Oeste', 'Ministro Andreazza',
    'Theobroma', 'Rio Crespo', 'Candeias do Jamari', 'Itapuã do Oeste', 'São Francisco do Guaporé',
    'Chupinguaia', 'Santa Luzia d\'Oeste', 'Corumbiara', 'Cacaulândia', 'Governador Jorge Teixeira'
  ],
  'RR': [
    'Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre', 'Mucajaí',
    'São Luiz', 'São João da Baliza', 'Bonfim', 'Normandia', 'Pacaraima',
    'Iracema', 'Amajari', 'Cantá', 'Caroebe', 'Uiramutã'
  ],
  'RS': [
    'Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo',
    'São Leopoldo', 'Rio Grande', 'Alvorada', 'Passo Fundo', 'Sapucaia do Sul', 'Uruguaiana', 'Santa Cruz do Sul',
    'Cachoeirinha', 'Bagé', 'Bento Gonçalves', 'Erechim', 'Guaíba', 'Cachoeira do Sul', 'Santana do Livramento',
    'Ijuí', 'Camaquã', 'Santo Ângelo', 'Lajeado', 'Sapiranga', 'São Borja', 'Cruz Alta',
    'Montenegro', 'São Gabriel', 'Carazinho', 'Taquara', 'Alegrete', 'Parobé', 'Torres',
    'Vacaria', 'Farroupilha', 'Feliz', 'Estância Velha', 'Venâncio Aires', 'Rosário do Sul', 'Osório'
  ],
  'SC': [
    'Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma', 'Chapecó', 'Itajaí', 'Lages',
    'Jaraguá do Sul', 'Palhoça', 'Balneário Camboriú', 'Biguaçu', 'Tubarão', 'São Bento do Sul', 'Caçador',
    'Camboriú', 'Navegantes', 'Concórdia', 'Rio do Sul', 'Araranguá', 'Gaspar', 'Brusque',
    'Itapema', 'Canoinhas', 'São Francisco do Sul', 'Videira', 'Indaial', 'Mafra',
    'Xanxerê', 'Joaçaba', 'Içara', 'Herval d\'Oeste', 'Curitibanos', 'São Miguel do Oeste',
    'Tijucas', 'Pomerode', 'São Ludgero', 'Sombrio', 'Maravilha', 'Braço do Norte'
  ],
  'SE': [
    'Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'Estância',
    'Tobias Barreto', 'Simão Dias', 'Nossa Senhora da Glória', 'Propriá', 'Barra dos Coqueiros',
    'Ribeirópolis', 'Paripiranga', 'São Cristóvão', 'Carmópolis', 'Aquidabã',
    'Porto da Folha', 'Poço Redondo', 'Canindé de São Francisco', 'Gararu', 'Neópolis',
    'Capela', 'Riachuelo', 'Maruim', 'Rosário do Catete', 'Santo Amaro das Brotas',
    'Divina Pastora', 'General Maynard', 'Japaratuba', 'Pirambu', 'Boquim'
  ],
  'SP': [
    'São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'Ribeirão Preto', 'Sorocaba',
    'Santos', 'Mauá', 'São José dos Campos', 'Mogi das Cruzes', 'Diadema', 'Jundiaí', 'Carapicuíba', 'Piracicaba',
    'Bauru', 'São Vicente', 'Itaquaquecetuba', 'Franca', 'Guarujá', 'Taubaté', 'Praia Grande', 'Limeira',
    'Suzano', 'Taboão da Serra', 'Sumaré', 'São José do Rio Preto', 'Americana', 'Presidente Prudente',
    'Araraquara', 'Santa Bárbara d\'Oeste', 'Rio Claro', 'Jacareí', 'Araras', 'Indaiatuba',
    'Cotia', 'Marília', 'São Carlos', 'Barueri', 'Itu', 'Hortolândia', 'Paulínia', 'Ferraz de Vasconcelos',
    'Francisco Morato', 'Itapevi', 'Mongaguá', 'Peruíbe', 'Caraguatatuba', 'Valinhos', 'Vinhedo'
  ],
  'TO': [
    'Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins',
    'Tocantinópolis', 'Araguatins', 'Colinas do Tocantins', 'Guaraí', 'Formoso do Araguaia',
    'Miranorte', 'Dianópolis', 'Taguatinga', 'Pedro Afonso', 'Arraias',
    'Miracema do Tocantins', 'Xambioá', 'Augustinópolis', 'Alvorada', 'Wanderlândia',
    'Natividade', 'Araguacema', 'Peixe', 'Cristalândia', 'Nova Olinda',
    'Goiatins', 'Filadélfia', 'Ponte Alta do Tocantins', 'Conceição do Tocantins', 'Buriti do Tocantins'
  ]
};

// Função para buscar cidades por estado
export const getCitiesByState = (stateCode: string): string[] => {
  return CITIES_BY_STATE[stateCode] || [];
};

// Função para validar se uma cidade existe em um estado
export const isCityInState = (city: string, stateCode: string): boolean => {
  const cities = getCitiesByState(stateCode);
  return cities.includes(city);
};

// Função para buscar estado por nome
export const getStateByName = (stateName: string): State | undefined => {
  return BRAZILIAN_STATES.find(state => state.name === stateName);
};

// Função para buscar estado por código
export const getStateByCode = (stateCode: string): State | undefined => {
  return BRAZILIAN_STATES.find(state => state.code === stateCode);
};