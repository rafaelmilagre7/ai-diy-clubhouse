import { getSupabaseServiceClient } from '../_shared/supabase-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseServiceClient();
    
    console.log('🔄 [CSV-IMPORT] Iniciando importação do CSV...');
    
    // Dados do CSV incorporados diretamente
    const csvText = `Nome,Email,Telefone,Data de Entrada (Mesmo de compra),Categorização Membro,Valor,Renovação em,Acesso vinculado a
Marco Amorim, marco@devantsolucoes.com.br,19 99301-8602,,Usuário do time,,,
Abner Nascimento Bonfim,abnerbonfim10@gmail.com,+55 27 99829-7257,,Usuário do time,,,ronivon10@gmail.com
Abraão Castro,abraaomacielvoos@gmail.com,74991194352,,Usuário do time,,,umerickmaciel@gmail.com
Arthur Bruno,abruno@signhouse.com.br,11999061559,,Usuário do time,,,ssorrentino@signhouse.com.br
José Adilmo Antônio Guimarães,adilmo.staff@gmail.com,81993542964,,Usuário do time,,,andrevitorio10@gmail.com
Abraão Putz Borges de Sampaio,admin@braparas.com.br,41988944606,,Usuário do time,,,ruan@braparas.com.br
Débora Santos Cavalcanti Barbosa,administrativo@imagemcor.com.br,(81)997935622,,Usuário do time,,,andrevitorio10@gmail.com
Ricardo,Administrativo6@cozapi.com.br,48 9831-0769,,Usuário do time,,,Comercial2@cozapi.com.br
Afonso João Alves Neto,afonsoalves.eng@gmail.com,47999945758,,Usuário do time,,,thaisgonzaga.tg@gmail.com
Anderson Fontinelle,afontineli@gmail.com,61984261131,,Usuário do time,,,clebergengnagel@gmail.com
Gabriela Lewis,akos.gabriela@gmail.com,(21) 98086-5311,,Usuário do time,,,alexandrelessa100@gmail.com
Alef Pereira,alef.pereira@hubnexxo.com.br,71991357631,,Usuário do time,,,paulo.neto@hubnexxo.com.br
Alexandre Schardosim Scherer,alexandre@grupopremiertech.com.br,+5551981062779,,Usuário do time,,,grkoerich@gmail.com
Alexandre Di Giovanni Gouvêa,alexandre@systemway.com.br,14981842535,,Usuário do time,,,murilo@systemway.com.br
Alexandre Oliveira,alexandreoliveira.anuncio03@gmail.com,11913341156,,Usuário do time,,,gislenegaruffi@gmail.com
Alexandre Paggi,alexandrepaggi@outlook.com,49 9999-7232,,Usuário do time,,,brayan.rampin@eag.com.br
Alexssandro André Gottschalk,alexssandro@truckpag.com.br,11954730811,,Usuário do time,,,felipe.batista@truckpag.com.br
Alice Borges,alice.santos@cupola.com.br,41998118463,,Usuário do time,,,keity.marques@cupola.com.br
Aline Kuchenbecker,aline@hiper.com.br,(47) 98477-3353,,Usuário do time,,,pricila.kloppel@hiper.com.br
ALLISON YURI,allison.yuri@primesecure.com.br,11982081761,,Usuário do time,,,rmilharezi@primesecure.com.br
Allison Yuri,alllison.yuri@primesecure.com.br,11982081761,,Usuário do time,,,rmilharezi@primesecure.com.br
Egio  Ameida,almeidaegio@gmail.com,+5531991888632,,Usuário do time,,,verenice.oliveira@contourline.com.br
Ana Claudia Nunes,anaestrategista@gmail.com,5531989137371,,Usuário do time,,,contato@geracaodeatletas.com
Enzo Alves Ortiz de Oliveira,analistaadmsport@gmail.com,+55 359 8867-5296,,Usuário do time,,,hermesoliveira@gmail.com
Ana Paula,anapaula@lbacapital.com.br,11953865998,,Usuário do time,,,bruno@lbacapital.com.br
Anderson Barbosa,anderson.barbosa@medassistservicos.com.br,(11) 98538-3929,,Usuário do time,,,caio@medassistservicos.com.br
André Alvim,andre.alvim81@gmail.com,32998265333,,Usuário do time,,,saluswatercursos@gmail.com
André Gonçales,andre.goncales@acquanobilis.com.br,12997477935,,Usuário do time,,,guilherme.marcuschi@acquanobilis.com.br
Andrei Antônio Klinkoski,andreyklinkoski7@gmail.com,54999116692,,Usuário do time,,,dheikson@gmail.com
Andreza Scolari,andrezascolaricorretora@gmail.com,+5547997858556,,Usuário do time,,,zacarias.kelly@gmail.com
Anesia Dorna,anesia.dorna@protecom.com.br,48-99147-1834,31/07/2025,Usuário do time,,31/07/2026,rafael@protecon.com.br
ANESIA APARECIDA GAMBALI DORNA,anesia.dorna@protecon.com.br,48991471834,,Usuário do time,,,rafael@protecon.com.br
Anna Luisa Ubarana,annaluisa@corplawadvogados.com.br,(84) 92001-5713,,Usuário do time,,,contato@carvalhomoreira.com.br
Antonio Leo,antonio@mosaicai.com.br,16 99796-5930,,Usuário do time,,,clovis@mosaicai.com.br
Arthur G,arthur.g@lesco.com.br,51991014717,,Usuário do time,,,lucasavila83@gmail.com
Arthur Godoy,arthur.ndag@gmail.com,41 99681-6578,,Usuário do time,,,contato@geracaodeatletas.com
Ashley Cordeiro,ashley@grupoa4.al,82 99121-7205,,Usuário do time,,,andrevitorio10@gmail.com
Ashley Cordeiro,ashleygcordeiro@gmail.com, 82 9121-7205,29/07/2025,Usuário do time,,29/07/2026,andrevitorio10@gmail.com
Rafael Silva Ferreira,atendimento2@maxseal.com.br,22988353500,,Usuário do time,,,arthurthedim@hotmail.com
Ayla Farias,ayla.atendimento@gmail.com,+5511981446994,,Usuário do time,,,gislenegaruffi@gmail.com
Beatriz Pinho Andriolli,beatriz@lbacapital.com.br,11948411663,,Usuário do time,,,bruno@lbacapital.com.br
Bernardo K,bernardo.k@lesco.com.br,47988817898,,Usuário do time,,,lucasavila83@gmail.com
Beatriz Okamoto,bia@vidabela.com.br,51984219527,,Usuário do time,,,edison@vidabela.com.br
Bianca Holler Sotto Mayor de Moraes,bianca.moraes@mnadvocacia.com.br,(48) 99972-4878,31/07/2025,Usuário do time,,31/07/2026,gabrielle.b@mnadvocacia.com.br
Breno Mesquita,breno.mesquita@crossercapital.com,31 9869-7950,,Usuário do time,,,fernando.mourao@crossercapital.com
Breno Oliveira,breno.oliveira@soucentroeuropeu.com.br,41998678252,28/07/2025,Usuário do time,,28/07/2026,financeiro@centroeuropeu.com.br
Bruno Dias,bruhdias09@gmail.com,31 7132-2912,,Usuário do time,,,verenice.oliveira@contourline.com.br
Bruna Caroline de Oliveira Lucci,bruna.lucci@mnadvocacia.com.br,(47) 99713-9190,31/07/2025,Usuário do time,,31/07/2026,gabrielle.b@mnadvocacia.com.br
Bruna Westhofer,bruna.westhofer@institutogl.com,11944676701,,Usuário do time,,,naerte.junior@gmail.com
Bruno,bruno@besserhome.com.br,62 99326-4260,,Usuário do time,,,ronan@besserhome.com.br
Bruno Carlos Franceschini,bruno@braparas.com.br,41991922231,,Usuário do time,,,ruan@braparas.com.br
Bruno Dias,bruno@contourline.com.br,31971322912,,Usuário do time,,,verenice.oliveira@contourline.com.br
Bruno Panizze,bruno@ibotiadvogados.com.br,+55 51 98022-3200,,Usuário do time,,,iboti@ibotiadvogados.com.br
Bryan Hansel,bryan.hansel@crossercapital.com,31 9503-5738,,Usuário do time,,,fernando.mourao@crossercapital.com
BRUNO SANTOS VALENTE,bsvalente@hotmail.com,11947649010,,Usuário do time,,,bruno@pontopromotora.com.br
Clayton Rafael Ribeiro Junior,c.rafael@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Caio Torres,c.torres@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Carolina Zanetti,c.zanetti@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Caina Meneses,caina.box@gmail.com,+55 11 94037-2992,,Usuário do time,,,vitorsimoescoelho@gmail.com
Caio Santos,caio.santos@medassistservicos.com.br,(11) 96082-8449,,Usuário do time,,,caio@medassistservicos.com.br
Caio Cortez Mauad,caiocortez_mauad@hotmail.com,35999977866,,Usuário do time,,,rafaelmarcondesmartins@hotmail.com
Caio Petri,caiopetri.tenorio@gmail.com,27 99581-9111,,Usuário do time,,,copywriter@vitormadruga.com
Camila Drumond,camila@sogalpoes.com.br,3197113222,,Usuário do time,,,tiago@sogalpoes.com.br
Carlos Eduardo Godoy,carlos.godoy@biogenesisbago.com,41999570271,,Usuário do time,,,renato.santos@biogenesisbago.com
Carlos de Carvalho Macedo Neto,carlos.macedo@outliers.adv.br,21982488717,,Usuário do time,,,samuel@outliers.adv.br
Carlos Eduardo,carlos@emballerge.com.br,19991466886,,Usuário do time,,,neto_cavalari@hotmail.com
Carlos H Almeida ReMax,Carlosdealmeida@remax.com.br,35 9236-6386,31/07/2025,Usuário do time,,31/07/2026,julio@makedistribuidora.com.br
Caroline Souto Vencato,carol.agrovale@hotmail.com,85 99129-0719,,Usuário do time,,,raphaelvencato@agrovaletransportes.com.br
CAROLINA COUTO SILVA,carolina.couto@protecon.com.br,11913083596,,Usuário do time,,,rafael@protecon.com.br
Carolina de Andrade Mendonça,carolina@amfoods.com.br,5196497201,,Usuário do time,,,fernando@pecorino.com.br
Caroline Macarini,caroline.macarini@institutogl.com,11997013123,,Usuário do time,,,naerte.junior@gmail.com
Carol Lischt,carolinelischt@wra-usa.com,+1 (321)9466727,,Usuário do time,,,tdarealtor@gmail.com
Laryssa de Castro Santos,castrolaryssa163@gmail.com,47997032762,,Usuário do time,,,elainecdtarelho@gmail.com
Ana Carolina Claudino Dragone,ccd@besten.com.br,+5519991549117,,Usuário do time,,,financeirobesten@cpfabrasil.com.br
Célia Hatori,Celia.hatori@gmail.com,4199602-4717,,Usuário do time,,,hatorimirian@gmail.com
Carlos,chdallagnol@oragoapp.com.br,48 8833-5086,,Usuário do time,,,institutoneurosciences@gmail.com
Christian Henrique MIlharezi Silva,christian@primesecure.com.br,11 971368871,,Usuário do time,,,rmilharezi@primesecure.com.br
Christine BRITES,christine.brites@hotmail.com,48 9663-2059,,Usuário do time,,,brayan.rampin@eag.com.br
Christopher Oliveira,christopher.oliveira@truckpag.com.br,45999927853,,Usuário do time,,,felipe.batista@truckpag.com.br
Christopher Ramos,christopher@ibotiadvogados.com.br,+55 51 98575-7192,,Usuário do time,,,iboti@ibotiadvogados.com.br
Cinthia Chieza de Freitas Nápoles Coelho,cinthia.coelho@cmtimoveis.com.br,31991341306,,Usuário do time,,,bruno.coelho@comiteco.com.br
Cíntia Samara dos Santos,cintia@uraniaplanetario.com.br,11967322868,,Usuário do time,,,tiago@uraniafulldome.com.br
Ciríaco Neto,ciriaconeto.cis@gmail.com,48988065677,,Usuário do time,,,elainecdtarelho@gmail.com
Clara Lima,clara.lima@outliers.adv.br,11951200949,,Usuário do time,,,samuel@outliers.adv.br
Claudia Lemme,claudialemme@uol.com.br,,,Usuário do time,,,brayan.rampin@eag.com.br
Cláudio Roberto Cordeiro Rui,claudio.rui@ecopontes.com.br,18981728502,,Usuário do time,,,fhungaro@ecopontes.com.br
Claudio Morgenstern,claudiomorgenstern@rpmdigitalbusiness.com,11 95901-9211,,Usuário do time,,,ricpad34@gmail.com
Cleiton Masche,cleiton.masche@hiper.com.br,(47) 99231-4747,,Usuário do time,,,pricila.kloppel@hiper.com.br
Cleyton Campos,cleytoncampos@assessoriamap.com.br,21991868487,,Usuário do time,,,victorborges@assessoriamap.com.br
Cyro Trova,cluitrova@cyft.com.br,11 93397-6767,,Usuário do time,,,diego@devantsolucoes.com.br
Cyo Trova,cluiztrova@cyft.com.br,,,Usuário do time,,,diego@devantsolucoes.com.br
Fabrício Coitinho,coitinho.fabricio@gmail.com,11 98082-3550,,Usuário do time,,,brayan.rampin@eag.com.br
Jheniffer Silva,comercial@amplifybr.com.br,19998090225,,Usuário do time,,,diego@devantsolucoes.com.br
Lavínia Domeneguetti,comercial@braparas.com.br,41 98823-2459,,Usuário do time,,,ruan@braparas.com.br
João marcos Custódio de Souza,Comercial@cozapi.com.br,48 9691-1303,,Usuário do time,,,Comercial2@cozapi.com.br
Marco Schappo,comercial@premacar.com.br,49 99918-1213,,Usuário do time,,,petersonkolling@gmail.com
Ana Karina de Andrada Veríssimo Gomes,comercialbj@imagemcor.com.br,(81) 98196 6068,,Usuário do time,,,andrevitorio10@gmail.com
Karine Rodrigues,comunicao@valoreimoveis.com.br,31 9550-0049,,Usuário do time,,,
Lorena Fernandes da Silva,consultoria@sprintbr.com.br,48 99946-5039,,Usuário do time,,,brayan.rampin@eag.com.br
Anderson Diniz,contato.andersondinizep@gmail.com,+55 13 98875-0362,,Usuário do time,,,miguel.altieri@gmail.com
Anndrea Nariane Franco,contato@anndreafranco.com.br,51998332112,,Usuário do time,,,lucas@interlinkcargo.com.br
Victória Orlando,contato@carvalhomoreira.com.br,84991607171,,Usuário do time,,,contato@carvalhomoreira.com.br
Lael Almeida,contato@enctec.com.br,85986142049,,Usuário do time,,,gg@ecpmais.com.br
Cledir Nunes,contatocledir@gmail.com,48 99691-1268,,Usuário do time,,,matheus@pgsinalizacoes.com
Elisa Peres,conteudo@mktefetivo.com,16997754854,,Usuário do time,,,contato@mktefetivo.com
Cristiane Hasegawar,cris.hasegawa11@gmail.com,43999013411,31/07/2025,Usuário do time,,31/07/2026,
CRISTIANE RECH,Crisrech08@hotmail.com,+55 43 99181-9222,,Usuário do time,,,adriano@jacometo.com.br
Caio Tavares,ctavares@agmoonflag.com.br,11 91428-5686,,Usuário do time,,,dbatista@agmoonflag.com.br
Cyro Luiz Trova,ctrova@cyft.com.br,(11) 93397-6767,31/07/2025,Usuário do time,,31/07/2026,diego@devantsolucoes.com.br
Lais Araujo,ctt.laisalves@gmail.com,+5587981416546,,Usuário do time,,,andremariga2005@gmail.com
Diego Amorim,d.amorim@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Diego Camargo,d.camargo@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Douglas Ferreira,dados@agenciabesouro.com,51991172641,,Usuário do time,,,viniciusmendeslima@agenciabesouro.com
Joao Victor Quirino,dados@mktefetivo.com,11943887412,,Usuário do time,,,contato@mktefetivo.com
Daiana Winkelmann,daiana1510@gmail.com,,,Usuário do time,,,guilherme@winke.com.br
Daiany,Daiany.antolie@gmail.com,,,Usuário do time,,,viniciusbalatore@gmail.com
Daniel Chinzarian,daniel.chinzarian@outliers.adv.br,11973437776,,Usuário do time,,,samuel@outliers.adv.br
Daniel da Silva Ferreira,daniel.ferreira@gsp.com.br,+5511996979796,,Usuário do time,,,gerencia@hoteisportosol.com.br
Daniel Dias Flamia,daniel.flamia@hiper.com.br,(49) 98828-5805,,Usuário do time,,,pricila.kloppel@hiper.com.br
Daniel Mendes Lisboa,daniellisboa714@gmail.com,11970615096,,Usuário do time,,,pnoleto24@gmail.com
Davi Francisco da Silva Pereira,davi.francisco@imbprime.com,51981406924,,Usuário do time,,,eduardo.duarte@imbprime.com
Davi dos Santos Souza,davi.santos@hiper.com.br,(19) 97128-5461,,Usuário do time,,,pricila.kloppel@hiper.com.br
Davi dos Santos,davi@mosaicai.com.br,48 9128-3828,,Usuário do time,,,clovis@mosaicai.com.br
Davi Fernandes Vieira,davieiraf9@gmail.com,12988863032,,Usuário do time,,,pedro@taharamedical.com.br
Gustavo Batista dos Santos,dbatis@agmoonflag.ocm.br,11989978269,,Usuário do time,,,dbatista@agmoonflag.com.br
Denise Torquato,denise.torquato@biogenesisbago.com,4199499206,,Usuário do time,,,renato.santos@biogenesisbago.com
Felipe Almeida,dev@rjhabitat.com,12992371948,,Usuário do time,,,diogo@rjhabitat.com
Diego Pereira de Lima,diego.lima@clinicaunirad.com.br,51999110101,,Usuário do time,,,adm@clinicaunirad.com.br
Diego Moraes,diego@bastosmoraesadvocacia.com.br,48 9212-1212,,Usuário do time,,,renato@moreiramendes.com.br
Gabriel de Carvalho Aguiar,digital01@primebaby.com.br,11 97996-2445,31/07/2025,Usuário do time,,31/07/2026,alessandra@primebaby.com.br
Luan de Oliveira Gomes ,digital02@primebaby.com.br,11 98193-7585,31/07/2025,Usuário do time,,31/07/2026,alessandra@primebaby.com.br
Daniela Landin,dlandin0184@gmail.com,11950771610,,Usuário do time,,,julio.feltrim@feltrimcorrea.com.br
Daniel Moraes Cardoso,dmc@besten.com.br,+5511976944746,,Usuário do time,,,financeirobesten@cpfabrasil.com.br
Thomaz Bobel,documentacao@imbprime.com,51996082665,,Usuário do time,,,eduardo.duarte@imbprime.com
Amanda Bruna,Documentos@devantsolucoes.com.br,19 98755-9335,,Usuário do time,,,diego@devantsolucoes.com.br
Denis Poggian,dpoggian@omz.ag,11948828621,,Usuário do time,,,smagalhaes@omz.ag
Duílio Soares Ribeiro,duilio@zaya.it,34 9 9828 3243,29/07/2025,Usuário do time,,29/07/2026,paulo@zaya.it
,e.guedes@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Eduarda Bruna,eduardabruna@rpmdigitalbusiness.com,54 9920-9284,,Usuário do time,,,ricpad34@gmail.com
Eduardo Augusto Berti,eduardo.berti@leveluplatam.com,11995914004,,Usuário do time,,,rodrigo.dias@leveluplatam.com
Eduardo Ribeiro,eduardo@mosaicai.com.br,48 9944-2618,,Usuário do time,,,clovis@mosaicai.com.br
Eduardo Watanabe,eduardowatanabe94@gmail.com,41 9 9972-6521,,Usuário do time,,,ruan@braparas.com.br
Elemar Almeida Junior,elemar@lbacapital.com.br,11989026101,,Usuário do time,,,bruno@lbacapital.com.br
Elias Soares Pedrosa,elias@mendesishak.com.br,91985980047,,Usuário do time,,,caio@mendesishak.com.br
Elin Cristina Primo do Prado,elin.prado@hiper.com.br,(49) 99957-4725,,Usuário do time,,,pricila.kloppel@hiper.com.br
Elis Rabelo,elis.rabelo@feltrimcorrea.com.br,13997709227,,Usuário do time,,,julio.feltrim@feltrimcorrea.com.br
Elizabeth Franca de Moura,elizabeth.moura@hiper.com.br,(62) 98328-3756,,Usuário do time,,,pricila.kloppel@hiper.com.br
EMANUELE DELAGNOLI MARQUES,emanuele@efrate.com.br,47999910900,,Usuário do time,,,elainecdtarelho@gmail.com
EMANUELLE VALENTE,emanuelle@pontopromotora.com.br,11974619386,,Usuário do time,,,bruno@pontopromotora.com.br
Emerson Castilho,emerson@squadon.com.br,4491319189,,Usuário do time,,,victorborges@assessoriamap.com.br
João Victor de Almeida,eng@rjhabitat.com,8896109661,,Usuário do time,,,diogo@rjhabitat.com
Enzo Modolin,enzo@saopratico.com.br,11941442514,,Usuário do time,,,renato@saopratico.com.br
Eric Tomboly,eric.tomboly@nitro.com.br,,,Usuário do time,,,rodrigo.dsilva@nitro.com.br
Erick Santana,erick.santana@cupola.com.br,4199955-9683,,Usuário do time,,,keity.marques@cupola.com.br
Ernesto da Cunha Moretzsohn Quintão,Ernestoquintao@gmail.com,31999732994,,Usuário do time,,,gustavoballesterosr@hotmail.com
Esther Sales,esther@corplawadvogados.com.br,(84) 99133-9942,,Usuário do time,,,contato@carvalhomoreira.com.br
Marco Antônio Corrêa Miranda,eumarcodigital@gmail.com,(239) 600-9229,,Usuário do time,,,ricpad34@gmail.com
Evandro Luiz dos Santos Carvalho,evandrolsc@gmail.com,35987087375,,Usuário do time,,,rafaelmarcondesmartins@hotmail.com
Everton Hamann Gonçalves,everton.hamann@hiper.com.br,(47) 99183-9654,,Usuário do time,,,pricila.kloppel@hiper.com.br
Everton Henklein Jr,everton@digitronbalancas.com.br,41988781522,,Usuário do time,,,jessel@digitronbalancas.com.br
Flamur bakalli,F.a.bakalli@gmail.com,+377 45 642 539,,Usuário do time,,,miguel.altieri@gmail.com
,f.marques@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Felipe Vieira,f.vieira@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Fabiani Raimundo,fabiani@fortunare.com.br,51 98248-6666,,Usuário do time,,,brayan.rampin@eag.com.br
Fabio Liger,fabio.liger@nitro.com.br,,,Usuário do time,,,rodrigo.dsilva@nitro.com.br
Fabrizio Horacio Rocha Lima,fabriziohrl@hotmail.com,47984885560,,Usuário do time,,,marceloborgonovo@me.com
Giovana Giroto,faturamento@jacometo.com.br,+55 43 98816-4224,,Usuário do time,,,adriano@jacometo.com.br
Isabella Ramblas,faturamento@primebaby.com.br,11951198792,,Usuário do time,,,alessandra@primebaby.com.br
Frederico Borges,fborges@dinizbh.com.br,31 994121555,29/07/2025,Usuário do time,,29/07/2026,bruno@dinizbh.com.br
José Feliciano da Cunha Moretzsohn Quintão,felicianomoretzsohn@gmail.com,31987359666,,Usuário do time,,,gustavoballesterosr@hotmail.com
Felipe Ribeiro,felipe.ribeiro@diamantematriz.com.br,34998944117,30/07/2025,Usuário do time,,30/07/2026,gabrielbprates@hotmail.com
FELIPE JACOMETO,felipe@jacometo.com.br,+55 43 99160-5007,,Usuário do time,,,adriano@jacometo.com.br
Felipe Pimentel,felipepimenta07@gmail.com,+55 11 94948-3711,,Usuário do time,,,vitorsimoescoelho@gmail.com
Felipe Tadeu Soares Moreira,felipetadeu@wmi.solutions,31998981745,,Usuário do time,,,rebeca@wmi.solutions
Felipe Villarta,felipevillarta@gmail.com,21971920532,,Usuário do time,,,diogo@rjhabitat.com
Felipe Wagner,felipewagner@sbtrade.com.br,(48) 99607-0078,,Usuário do time,,,Bethyela@gmail.com
Felippe de Lima Moraes,felippe.moraes@leveluplatam.com,11989105464,,Usuário do time,,,rodrigo.dias@leveluplatam.com
Fellipe de Amorim Rocha,fellipeamorim@corplawadvogados.com.br,(84) 92000-9353,,Usuário do time,,,contato@carvalhomoreira.com.br
Fernanda Roratto,fernandieiii@gmail.com,(11) 99800-0501,,Usuário do time,,,paolaschwelm@gmail.com
Fernando Augusto Schramm Isensee,fernando.augusto@hiper.com.br,(47) 99246-4498,,Usuário do time,,,pricila.kloppel@hiper.com.br
Fernando Vargas de Moraes,fernando.moraes@hiper.com.br,(47) 99107-9382,,Usuário do time,,,pricila.kloppel@hiper.com.br
FERNANDO RODRIGUES RIOLO,fernando.riolo@hotmail.com,11 97774-8661,,Usuário do time,,,bruno@pontopromotora.com.br
Fernando de Andrade Mendonça,fernando@pecorino.com.br,+5551982980290,,Usuário do time,,,marcell.arrais@gmail.com
Camila Novak,ferramenta@imparleads.com.br ,4136777919,28/07/2025,Usuário do time,,28/07/2026,financeiro@centroeuropeu.com.br
Filipe Venâncio Gonçalves de Medeiros e Lima,filipe.vlima1@gmail.com,11 95654-7143,,Usuário do time,,,gislenegaruffi@gmail.com
Filipe Curvelo,filipecurvelo@sbtrade.com.br,(48) 99982-0498,,Usuário do time,,,Bethyela@gmail.com
Leonardo Schutz,financeiro@pgsinalizacoes.com,48 98434-6065,,Usuário do time,,,matheus@pgsinalizacoes.com
Pedro Victor,financeiro@rjhabitat.com,21982898132,,Usuário do time,,,diogo@rjhabitat.com
Flávio Espindola,flavio@construtoraespindola.com.br,47999482730,,Usuário do time,,,nriecke0@gmail.com
Gustavo Arazin,g.arazin@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Guilherme Zago,g.zago@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Gabriel leonardo dos santos,gabriel.santos@organne.com,44984617021,,Usuário do time,,,matheus.santos@organne.com
Gabriel Valerio Silva,Gabriel.valerios@hotmail.com,13991811274,,Usuário do time,,,alexandrehalves@hotmail.com
Gabriel Vinas,gabriel.vinas@interlinkcargo.com.br,,,Usuário do time,,,lucas@interlinkcargo.com.br
Gabriel Marques Tavelin,gabriel@lbacapital.com.br,61993198449,,Usuário do time,,,bruno@lbacapital.com.br
Gabriel Correa,gabriel@monetali.com.br,41985061313,,Usuário do time,,,financeiro@monetali.com.br
Gabriel Faraco,gabriel@sbtrade.com.br,(48) 99173-2828,,Usuário do time,,,Bethyela@gmail.com
Gabriel Teixeira Laine,gabriel82laine@gmail.com,+5537999989410,,Usuário do time,,,tiago@uraniafulldome.com.br
Gabriela Maroni,gabriela.maroni@usp.br,16988094589,,Usuário do time,,,maroni@360imob.com
Gabrielle,Gabrielle.antolie@gmail.com,,,Usuário do time,,,viniciusbalatore@gmail.com
Gabriely de Lima Pires,gabrielydelimapires@outlook.com,18 99700-8813,,Usuário do time,,,alexandrehalves@hotmail.com
Igor Antiqueira,Gantilab@gmail.com,53 98436-1177,,Usuário do time,,,danilo@danilokonrad.com.br
DANIEL PASSOS LANA,garfasdan@gmail.com,31971343213,,Usuário do time,,,contato.m.oliveira@hotmail.com
Gelson Soares,gelson.soares@interlinkcargo.com.br,,,Usuário do time,,,lucas@interlinkcargo.com.br
Monica Napte,gerenciamento.ais@gmail.com,22999397208,,Usuário do time,,,diogo@rjhabitat.com
Gerson,Gerson.antolie@gmail.com,,,Usuário do time,,,viniciusbalatore@gmail.com
BRUNO ALBERTO DE SOUZA TARELHO,gerson@efrate.com.br,47999919075,,Usuário do time,,,elainecdtarelho@gmail.com
Gesio Flores,gesioflores@gmail.com,(48) 991521111,,Usuário do time,,,mariomcmj@gmail.com
Gustavo Ghost,ghostagmkt@gmail.com,51 993818709,,Usuário do time,,,asp@aspsoftwares.com.br
Giovani Machado,giovani.machado@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Giuliano,giuliano@curtinaz.com.br,,,Usuário do time,,,lucas@interlinkcargo.com.br
Giulliano Togni,giulliano@eneway.com.br,+55 48 9661-6228,,Usuário do time,,,miguel.altieri@gmail.com
Giovani Justi,gmvendas@gmail.com,48996328967,,Usuário do time,,,lublauth@hotmail.com
Sandro Yuri Pinheiro,gsassessoriaempresarial18@gmail.com,48 99163-0562,,Usuário do time,,,brayan.rampin@eag.com.br
GUILHERME BEZERRA BASTOS,guilherme.bbastos6@gmail.com,67991271479,,Usuário do time,,,estelane.alves@ateliedoautomovel.com.br
Guilherme de Andrade Faraco,guilherme.faraco@jb3assessoria.com.br,48996449994,,Usuário do time,,,financeiro@jb3assessoria.com.br
Guilherme Fernando Alves de Abreu,guilherme.fernando@zaya.it,34 9 9876 7988,29/07/2025,Usuário do time,,29/07/2026,paulo@zaya.it
Guilherme Ruas Amaral,guilherme@corretavitoria.com.br,27997826196,,Usuário do time,,,filipe@corretavitoria.com.br
Guilherme Gregory,guilhermegreegory@gmail.com,(24) 98172-7739,,Usuário do time,,,caio@medassistservicos.com.br
Guilherme Santos da Silva,guilhermesantos17.contato@gmail.com,61983422470,,Usuário do time,,,tiago@sogalpoes.com.br
Guilherme Santos,guilhermesantos17@gmail.com,,,Usuário do time,,,mikael.fontes@hotmail.com
Gustavo Peixoto,gupeixoto@yahoo.com.br,(31) 98875-1269,,Usuário do time,,,gustavoballesterosr@hotmail.com
Gustavo Oliveira,gustavo.oliveira@ecopontes.com.br,18996398363,,Usuário do time,,,fhungaro@ecopontes.com.br
Gustavo Costa,gustavo@corplawadvogados.com.br,(84) 99981-8184,,Usuário do time,,,contato@carvalhomoreira.com.br
Gustavo Marcondes Martins,gustavommartins18@gmail.com,35998978301,,Usuário do time,,,rafaelmarcondesmartins@hotmail.com
Haira Cristina Araujo Sousa,haira.sousa@hiper.com.br,(62) 98292-3184,,Usuário do time,,,pricila.kloppel@hiper.com.br
Hannyere Dutra,hannyere.dutra@biogenesisbago.com,41988263190,,Usuário do time,,,renato.santos@biogenesisbago.com
Henrique Marcondes Martins,henrique-mmartins@live.com,35998932290,,Usuário do time,,,rafaelmarcondesmartins@hotmail.com
Henrique Moura,henrique.moura@outliers.adv.br,31983081576,,Usuário do time,,,samuel@outliers.adv.br
Henrique Lenharo,henriqueclenharo@gmail.com,,,Usuário do time,,,contato@geracaodeatletas.com
Hettore Sias Telles,hettore@contabilidadesias.com.br,27999924443,,Usuário do time,,,filipe@corretavitoria.com.br
Hever Rodrigues,hever.rodrigues@hotmail.com,+5548996232516,,Usuário do time,,,grkoerich@gmail.com
Higor,higorconsultor2023@gmail.com,35 9729-7709,31/07/2025,Usuário do time,,31/07/2026,julio@makedistribuidora.com.br
Comercial - SOMOS Tecnologia,ia.comercial@somostecnologia.com.br,48 988379126,,Usuário do time,,,jorge.machado@somostecnologia.com.br
Financeiro - SOMOS Tecnologia,ia.financeiro@somostecnologia.com.br,48 988379126,,Usuário do time,,,jorge.machado@somostecnologia.com.br
Serviços - SOMOS Tecnologia,ia.servicos@somostecnologia.com.br,48 988379126,,Usuário do time,,,jorge.machado@somostecnologia.com.br
Suporte - SOMOS Tecnologia,ia.suporte@somostecnologia.com.br,48 988379126,,Usuário do time,,,jorge.machado@somostecnologia.com.br
Leonardo Henrique,ia@sellchat.com.br,51997265119,,Usuário do time,,,lucastiagop@gmail.com
IA - SOMOS TECNOLOGIA,ia@somostecnologia.com.br,48 988479984,,Usuário do time,,,jorge.machado@somostecnologia.com.br
Iasmin dos Santos Felipe,iasmin.anuncio@gmail.com,11937548419,,Usuário do time,,,gislenegaruffi@gmail.com
igor.lopes@alambre.com.br,igor.lopes@alambre.com.br,11989931111,,Usuário do time,,,netto@alambre.com.br
Marcelo Basso,influenciapositivaconsultoria@gmail.com,48 99163-0562,,Usuário do time,,,brayan.rampin@eag.com.br
Roberson Jose Tosoni Bill,informatica@digitronbalancas.com.br,41992211581,,Usuário do time,,,jessel@digitronbalancas.com.br
Victor Pietro Moreno,infra@nectho.com.br,19 99624-0903,,Usuário do time,,,tiago@uraniafulldome.com.br
Isabelle Luziardi,isabelle.luziardi@ecopontes.com.br,18997272428,,Usuário do time,,,fhungaro@ecopontes.com.br
Isabela Gonçalves Nunes,isagnunes@gmail.com,48991815601,,Usuário do time,,,lublauth@hotmail.com
Isabel Silva Paiva,isxpaiva@icloud.com,+55 13 99643-1404,,Usuário do time,,,miguel.altieri@gmail.com
Ivaneide Domingos,ivaneide@automacaocuritiba.com.br,41988897320,,Usuário do time,,,eduardo@cognify.app.br
Ivan Filho,ivanfilho@culturanapratica.com,62982687070,,Usuário do time,,,marcela@culturanapratica.com
Jadson Roberto Pollheim,jadson@hiper.com.br,(47) 99145-3994,,Usuário do time,,,pricila.kloppel@hiper.com.br
Jady Moura,jady.moura@diamantematriz.com.br,34998827467,30/07/2025,Usuário do time,,30/07/2026,gabrielbprates@hotmail.com
Jaime Elon Kolling,jaimekolling@yahoo.com.br,41 99911-8111,,Usuário do time,,,petersonkolling@gmail.com
Jaime Elon Kolling ,jaimekolling@yahoo.com.br ,41 99911-8111,,Usuário do time,,,petersonkolling@gmail.com
Jair Souza,jair@sbtrade.com.br,(48) 99866-1000,,Usuário do time,,,Bethyela@gmail.com
João Nelson,Jaonelsm1@gmail.com,61981327157,,Usuário do time,,,gusrodrigues.rlv@gmail.com
Jackson Bastos Marques,jbm@besten.com.br,+5511992507003,,Usuário do time,,,financeirobesten@cpfabrasil.com.br
Jhonatan Brito,jbrito@agmoonflag.com.br,11 99280-0012,,Usuário do time,,,dbatista@agmoonflag.com.br
Jessika Midory Fukuyama,je.fukuyama@gmail.com,+55 17 99627-7767,,Usuário do time,,,keniafukuyama05@gmail.com
Jean Ricardo,jeanricardo.jr123@gmail.com,27 98170-4766,,Usuário do time,,,copywriter@vitormadruga.com
JESSEL BASTOS DA SILVA,jessel@digitronbalancas.com.br,41992211578,,Usuário do time,,,jessel@digitronbalancas.com.br
Karine Rodrigues,jetyou@gmail.com,(31)99550-0049,,Usuário do time,,,dimmycarter@zixpay.com.br
Jéssica Barreto Lopes,jlopes@processlogcomex.com.br,+55 11 92062-5927,,Usuário do time,,,lvitta@chinalinktrading.com
João Paulo Mendes Lollato,joao.lollato@biogenesisbago.com,41996980752,,Usuário do time,,,renato.santos@biogenesisbago.com
João Pedro Mendes,joao.mendes@jb3assessoria.com.br,48 9988-0282,,Usuário do time,,,financeiro@jb3assessoria.com.br
João Vitor Kobayashi,joao.mkobayashi@hotmail.com,12982433227,,Usuário do time,,,alexandrehalves@hotmail.com
Joao Pedro,joao.pedro@jacometo.com.br,+55 43 99637-3278,,Usuário do time,,,adriano@jacometo.com.br
João Vitor Alvarez Ribeiro,joao.ribeiro@tftreinamentosdigitais.com,19993770906,,Usuário do time,,,contato@thiagofranco.com
João Severiano,joao.severiano@rhellorh.com.br,11 97727-1431,,Usuário do time,,,pnoleto24@gmail.com
Joao V,joao.v@lesco.com.br,47999303235,,Usuário do time,,,lucasavila83@gmail.com
João Franklen,joao@culturanapratica.com,92 9479-4719,,Usuário do time,,,marcela@culturanapratica.com
João Britto,joaobritto@rpmdigitalbusiness.com,11 97086-0228,,Usuário do time,,,ricpad34@gmail.com
Joao Marcelo,joaomarcelo@rpmdigitalbusiness.com,61 8305-5142,,Usuário do time,,,ricpad34@gmail.com
João Paulo dos Santos,joaopaulo.santos@biogenesisbago.com,41999570306,,Usuário do time,,,renato.santos@biogenesisbago.com
João Pedro Nicolov Amaral,joaopedro@corretavitoria.com.br,27996248136,,Usuário do time,,,filipe@corretavitoria.com.br
Joao Pedro Bezerra dos Santos,joaopedro@grupoharo.com.br,81994906584,,Usuário do time,,,fernando@grupoharo.com.br
João Victor,Joaovictor@vortexsoft.com.br,61 8137-0644,,Usuário do time,,,luisfc09@gmail.com
Jose Oliveira Filho,joliveira@pxativosjudiciais.com.br,11996365500,,Usuário do time,,,mikael.fontes@hotmail.com
Jonatha Leal de Albuquerque,jonatha.leal@growgroup.us,81991722926,,Usuário do time,,,felipemancano@growconsulting.com.br
Jair Gabriel Neto,jordanhzin@gmail.com,32998228934,,Usuário do time,,,zeg_estevanin@yahoo.com.br
Jorlan Lancaster,jorlan.lancaster@hubnexxo.com.br,71984804322,,Usuário do time,,,paulo.neto@hubnexxo.com.br
José Oliveira Filho,jose.oliveira@pxativosjudiciais.com.br,1199636-5500,,Usuário do time,,,mikael.fontes@hotmail.com
José Neto,jose@webpesados.com.br,62 98195-5944,,Usuário do time,,,gabriela@webpesados.com.br
Juliana Rodrigues Castelo Branco,juliana.branco@embabox.com.br,11913273083,,Usuário do time,,,neto_cavalari@hotmail.com
Juliana Jandiara Carvalho Costa,juliana@carmoadv.com.br,11958619293,,Usuário do time,,,administrativo@carmoadv.com.br
Juliene Aglio,juliene.aglio@ecopontes.com.br,18981010944,,Usuário do time,,,fhungaro@ecopontes.com.br
Júlio Teixeira,julioteixeira.akos@gmail.com,(27) 99249-5466,,Usuário do time,,,alexandrelessa100@gmail.com
Junior Sturmer,junior.sturmer@truckpag.com.br,45999925969,,Usuário do time,,,felipe.batista@truckpag.com.br
Junior Cabral,junior@multipladh.com.br,51 99919-6200,,Usuário do time,,,brayan.rampin@eag.com.br
Kaique Leonan silva pereira ,Kaique.leonan@live.com,21965883904,,Usuário do time,,,rebecagiffone@gmail.com
Kaline Martins,kalinemartinskaka@gmail.com,51999384527,,Usuário do time,,,lucastiagop@gmail.com
Kariny Martins,kariny.martins@cupola.com.br,41984723299,,Usuário do time,,,keity.marques@cupola.com.br
Karonine Silva,karoline.silva@soucentroeuropeu.com.br,41998954642,28/07/2025,Usuário do time,,28/07/2026,financeiro@centroeuropeu.com.br
Katia Nayara,katia.nayara@institutogl.com,11992825737,,Usuário do time,,,naerte.junior@gmail.com
Kaua Schulz,kaua.schulz@interlinkcargo.com.br,,,Usuário do time,,,lucas@interlinkcargo.com.br
Kauã Felipe da Cunha dos santos,kauafelipexu@gmail.com,51995336188,,Usuário do time,,,lucastiagop@gmail.com
Kelvin Jonathan,kelvin.jonathan20@gmail.com,5577991483111,,Usuário do time,,,saluswatercursos@gmail.com
Kenedy,Kenedy.antolie@gmail.com,,,Usuário do time,,,viniciusbalatore@gmail.com
Kenia Gengnagel,kenia.contabil@yahoo.com,61984519890,,Usuário do time,,,clebergengnagel@gmail.com
Keveny Richard Lima Bezerra,keveny.bezerra@truckpag.com.br,45999641219,,Usuário do time,,,felipe.batista@truckpag.com.br
Kim Ferreira,kim@corplawadvogados.com.br,(84) 98183-5014,,Usuário do time,,,contato@carvalhomoreira.com.br
José kleberth Tenório Filho,Kleberth@msn.com,82 993215777,,Usuário do time,,,andrevitorio10@gmail.com
Karina Nunes,kpmnunes@hotmail.com,47 99954-8300,,Usuário do time,,,brayan.rampin@eag.com.br
Leone Camardella,l.camardella@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Letícia Coelho,l.coelho@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Leonardo Dirickson,l.dirickson@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Ludmyla Godinho,l.godinho@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Luis Guilherme Meirelles i Jardim,l.jardim@lbacapital.com.br,62994166709,,Usuário do time,,,bruno@lbacapital.com.br
Leonardo Maçan,l.macan@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Luan Proença de Mattos,l.mattos.indaia@gmail.com,47 99743-3547,,Usuário do time,,,camiladutra@xplanconsultoria.com
Laura Maria Balduino de Moraes,l.moraes@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Leonardo Ponso,l.ponso@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Larissa Schmitz,l.schmitz@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Larissa Gabriele Gonçalves Cebrian,larissa.gabriele@leveluplatam.com,11948646511,,Usuário do time,,,rodrigo.dias@leveluplatam.com
Larissa Ferreira de Souza,larissafs1801@gmail.com,11982546772,,Usuário do time,,,gislenegaruffi@gmail.com
Larissa Garcia Rocha,larissagarciarocha@gmail.com,53999401200,,Usuário do time,,,rafaelmarcondesmartins@hotmail.com
Laurielly Azevedo da Silva Lopes,Laurielly43@gmail.com,12991173325,,Usuário do time,,,pedro@taharamedical.com.br
Layra Mendes,layra@mosaicai.com.br,48 9974-0792,,Usuário do time,,,clovis@mosaicai.com.br
Leandro Pereira de Almeida,leandroalmeida1981@gmail.com,21982280851,,Usuário do time,,,diogo@rjhabitat.com
Débora Santana,legal@xplanconsultoria.com,48 99900-9178,,Usuário do time,,,camiladutra@xplanconsultoria.com
DAIANA LÉIA MARCANSONI,leia@uraniaplanetario.com.br,49991117600,,Usuário do time,,,tiago@uraniafulldome.com.br
daniela ferraz pereira leite,leitedani@gmail.com,11 99344-8240,,Usuário do time,,,brayan.rampin@eag.com.br
Leonardo Augusto de Azevedo,leoazevedo.df@gmail.com,61999267755,,Usuário do time,,,clebergengnagel@gmail.com
Leonardo Lazarini,leonardo.lazarini@diamantematriz.com.br,16992335893,30/08/2025,Usuário do time,,30/08/2026,gabrielbprates@hotmail.com
Leoanrdo Doch,leonardo@advocaciazaccaro.com.br,31999909232,,Usuário do time,,,fzaccaro@uol.com.br
Leonardo de Campo Moda,leonardo@lbacapital.com.br,11918787575,,Usuário do time,,,bruno@lbacapital.com.br
Leonardo Araujo de Azeredo,leonardoazeredo@advocaciazaccaro.com.br,11930471977,,Usuário do time,,,fzaccaro@uol.com.br
Leonardo Bezerra Calazans,Leonardobezerrabcalazans@gmail.com,21998461322,,Usuário do time,,,estelane.alves@ateliedoautomovel.com.br
Leonardo,leonardod.antolie@gmail.com,,,Usuário do time,,,viniciusbalatore@gmail.com
LEONARDO PEREIRA DOS SANTOS,leonardopereiracsj@gmail.com,11 93000-2897,30/07/2025,Usuário do time,,30/07/2026,alpsagencia@gmail.com
Leonilton Serafim,leonilton.serafim@gmail.com,27 98166-6154,31/07/2025,Usuário do time,,31/07/2026,ronivon10@gmail.com
Leonardo Saracine,leotavares1010@gmail.com,,,Usuário do time,,,contato@geracaodeatletas.com
Leticia Vogel,leticia.vogel@monetali.com.br,41998384285,,Usuário do time,,,financeiro@monetali.com.br
Lorenzo Gustavo Franco,lfranco@contcommerce.com.br,+55 11 97331-1521,,Usuário do time,,,lvitta@chinalinktrading.com
Luiz Guilherme Soares,lguisoares@gmail.com,17988422459,31/07/2025,Usuário do time,,31/07/2026,elaine2109@icloud.com
lidiane de jesus,lidianedejesus@ymail.com,51986066586,,Usuário do time,,,financeiro@jb3assessoria.com.br
Lilian Carius,lilacarius@gmail.com,61983224456,,Usuário do time,,,gusrodrigues.rlv@gmail.com
Luan Coleto,luan@codeatlas.com.br,41988514686,,Usuário do time,,,eduardo@cognify.app.br
Lucas Adrian Richter,lucas.adrian@hiper.com.br,(47) 98917-6564,,Usuário do time,,,pricila.kloppel@hiper.com.br
Lucas Rodriges,lucas.rodrigues@alambre.com.br,11999052371,,Usuário do time,,,netto@alambre.com.br
Lucas Sell Wunderlich,lucas.sell@hiper.com.br,(49) 99146-8433,,Usuário do time,,,pricila.kloppel@hiper.com.br
Lucas Souza,lucas.souza@protecon.com.br,11-96306-1899,31/07/2025,Usuário do time,,31/07/2026,rafael@protecon.com.br
Lucas Gabriel Monteiro de Oliveira,lucas@corretavitoria.com.br,27992414972,,Usuário do time,,,filipe@corretavitoria.com.br
Lucas Prata Reis,lucas@gleebem.com.br,79996103909,,Usuário do time,,,financeiro@gleebem.com.br
Lucas Gabriel Lopes de Sousa,lucasousa.gabriel@gmail.com,61981294057,,Usuário do time,,,aguiarealizacoes@gmail.com
Lucas Pova,lucaspova.comercial@gmail.com,21969359167,,Usuário do time,,,diogo@rjhabitat.com
Luciano André Weber,luciano@hiper.com.br,(47) 99123-2764,,Usuário do time,,,pricila.kloppel@hiper.com.br
Luísa Alves Ramos Garcia,luisa.garcia@ateliedoautomovel.com.br,21999342418,,Usuário do time,,,estelane.alves@ateliedoautomovel.com.br
Luiz Antonio,luiz.a@lesco.com.br,47 99783-8884,,Usuário do time,,,lucasavila83@gmail.com
Luiz Augusto Barbieri,luiz.augustobarbieri@gmail.com,54 993197504,,Usuário do time,,,petersonkolling@gmail.com
Luiz Fernando Kuestner,luiz.fernando@hiper.com.br,(47) 99985-1090,,Usuário do time,,,pricila.kloppel@hiper.com.br
Luiz Fernando,luiz.fernando@somostecnologia.com.br,48 996268333,,Usuário do time,,,jorge.machado@somostecnologia.com.br
Maria Araújo,m.araujo@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Mariah Martins,m.martins@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Matheus Santana,m.santana@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Magno Filho,magno.filho@nitro.com.br,,,Usuário do time,,,rodrigo.dsilva@nitro.com.br
Marcel Hatori,marcel.hatori@gmail.com,41996330924,,Usuário do time,,,hatorimirian@gmail.com
Marcell Henrique Batista ,marcell.batista@mnadvocacia.com.br,(48) 99699-2143,31/07/2025,Usuário do time,,31/07/2026,gabrielle.b@mnadvocacia.com.br
Marcelo Carvalho,marcelo.carvalho@somostecnologia.com.br,48 999549794,,Usuário do time,,,jorge.machado@somostecnologia.com.br
Marcelo Rocha Junior,marcelo.rocha@cmtimoveis.com.br,31998542929,,Usuário do time,,,bruno.coelho@comiteco.com.br
Marcelo Lourenço Felix Figuiredo,marcelolorefelix@gmail.com,(11) 98252-9697,31/07/2025,Usuário do time,,31/07/2026,elaine2109@icloud.com
Marcio Borgonovo dos Santos,marcio.borgonovo@gmail.com,35192675633,,Usuário do time,,,marceloborgonovo@me.com
Marco Amorim,marco@devantsolucoes.com.br,19 99301-8602,,Usuário do time,,,diego@devantsolucoes.com.br
Marcos Vinicius Elerati Ferreira,marcos.elerati@pxativosjudiciais.com.br,1199340-3285,,Usuário do time,,,rmilharezi@primesecure.com.br
Marcos Vinicius Paludo,marcos.paludo@uraniaplanetario.com.br,4999791976,,Usuário do time,,,tiago@uraniafulldome.com.br
Marcos Vital de Oliveira Curcino Junior,marcos.vital@gleebem.com,79998489992,,Usuário do time,,,financeiro@gleebem.com.br
Marcus D'Avila,marcus.davila@Interlinkcargo.com.br,,,Usuário do time,,,lucas@interlinkcargo.com.br
Maressa Medina,maressa.medina@jb3assessoria.com.br,48 99114-3141,,Usuário do time,,,contato.m.oliveira@hotmail.com
Maria Júlia Alves de Lima,maria.lima@protecon.com.br,11963062035,,Usuário do time,,,rafael@protecon.com.br
Maria Rita,maria.rita@diamantematriz.com.br,34 8403-3111,,Usuário do time,,,gabrielbprates@hotmail.com
Mariana Couto Silva Lemos,mariana@wmi.solutions,37999653083,,Usuário do time,,,rebeca@wmi.solutions
Mariana de Araujo Nora,mariananora@hotmail.com,49 9915-5259,,Usuário do time,,,guilherme@winke.com.br
Mariane Alfradique,mariane.alfradique@w1partner.com.br,+55 21 96575-4702,,Usuário do time,,,victor97simao@hotmail.com
Maria Victoria Alves Lopes,mariavictoriaalveslopes052@gmail.com,83981425107,,Usuário do time,,,vlopessilva@yahoo.com.br
Marina Perazzo,marina@corplawadvogados.com.br,(84) 99892-3724,,Usuário do time,,,contato@carvalhomoreira.com.br
Marisa Melo,marisa.melo@institutogl.com,18996114953,,Usuário do time,,,naerte.junior@gmail.com
Bruna Cidreira Santos,Marketing@primebaby.com.br,11 97306-5526,31/07/2025,Usuário do time,,31/07/2026,alessandra@primebaby.com.br
Adrian Gonçalves,marketing@sellchat.com.br,51981764610,,Usuário do time,,,lucastiagop@gmail.com
Raphael Henriques,marketing@uraniaplanetario.com.br,32988119919,,Usuário do time,,,tiago@uraniafulldome.com.br
Leonardo Alexandre de Mattos Faria,marketing2@jttelecom.com.br,11995574371,,Usuário do time,,,thiago@jttelecom.com.br
Caio Maroni,maroni@360imob.com,+5513996930420,,Usuário do time,,,contato@mktefetivo.com
Mateus Assis Carvalho,mateus@galicia.com.br,(31)99511-8886,,Usuário do time,,,gustavoballesterosr@hotmail.com
Matheus Keller,matheus.keller@institutogl.com,18981001203,,Usuário do time,,,naerte.junior@gmail.com
Matheus Matos,matheus.matos@outliers.adv.br,31991039218,,Usuário do time,,,samuel@outliers.adv.br
Matheus Rodrigues Amorim,matheus.r.amorim@outlook.com,11956194842,,Usuário do time,,,gislenegaruffi@gmail.com
Matheus Rodrigues,matheus.rodrigues@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Matheus Felipe Kons,matheus@saopratico.com.br,11998170107,,Usuário do time,,,renato@saopratico.com.br
Maykom Pereira,maykom@mosaicai.com.br,21 98373-3320,,Usuário do time,,,clovis@mosaicai.com.br
Maykow,maykow@gmail.com,11991124393,,Usuário do time,,,julio.feltrim@feltrimcorrea.com.br
Mayra Cordeiro,mayra@omz.ag,11975163180,,Usuário do time,,,smagalhaes@omz.ag
Matheus Calixtro,mcalixtro@agmoonflag.com.br,11 94815-6970,,Usuário do time,,,dbatista@agmoonflag.com.br
Marcos Comparato,mcomparato@signhouse.com.br,11984881133,,Usuário do time,,,ssorrentino@signhouse.com.br
Marcos Paulo,mdias@dinizvitoria.com.br,28 99966-9008,29/07/2025,Usuário do time,,29/07/2026,bruno@dinizbh.com.br
Melina Pianco Gulla Tavares,mel.gulla26@gmail.com,44 99148-0381,,Usuário do time,,,marcelomelo86@hotmail.com
Marcos Felipe,mfelipe@dinizbh.com.br,31 97565-0408,29/07/2025,Usuário do time,,29/07/2026,bruno@dinizbh.com.br
Michel Mazul,michel.mazul@hitech-e.com.br,,,Usuário do time,,,rodrigoscontin@gmail.com
Michel Prado,michel.prado@cupola.com.br,41996866713,,Usuário do time,,,keity.marques@cupola.com.br
Michele Correa,michele.correa@feltrimcorrea.com.br,21988760692,,Usuário do time,,,julio.feltrim@feltrimcorrea.com.br
Michelli Lopes,michelli@mosttic.com,11 94347-5055,,Usuário do time,,,duthome@duthome.com
Time Moonflag,midias@agmoonflag.com.br,11 91185-3329,,Usuário do time,,,dbatista@agmoonflag.com.br
Mike Li,mike@mosaicai.com.br,11 93766-2965,,Usuário do time,,,clovis@mosaicai.com.br
Mirian Vilivas,mirianvilivas@assessoriamap.com.br,4499595657,,Usuário do time,,,victorborges@assessoriamap.com.br
Daniel Sato,mkt@advocaciazaccaro.com.br,7399547981,,Usuário do time,,,fzaccaro@uol.com.br
Israel Souza,mkt@alambre.com.br,11953832732,,Usuário do time,,,netto@alambre.com.br
Bruno Espindola Birlem,mkt@clinicaunirad.com.br,51998213920,,Usuário do time,,,adm@clinicaunirad.com.br
Marcus Mansi,mmansi@startti.com.br,11983343811,,Usuário do time,,,victorborges@assessoriamap.com.br
Matheus Oliveira,moliveira@agmoonflag.com.br,11 96335-8350,,Usuário do time,,,dbatista@agmoonflag.com.br
Monica Peres,monica.peres@protecon.com.br,11-97605-4740,31/07/2025,Usuário do time,,31/07/2026,rafael@protecon.com.br
Marcella Perrone de Monteiro,mperrone@leveluplatam.com,11980915520,,Usuário do time,,,rodrigo.dias@leveluplatam.com
Mateus Santos,msantos@agmoonflag.com.br,11 95793-6545,,Usuário do time,,,dbatista@agmoonflag.com.br
Danilo da Silva Ortiz,mundihum@gmail.com,19997792977,,Usuário do time,,,diego@devantsolucoes.com.br
Nailyn Vitoria da Silveira,nailyn.scheffer@hiper.com.br,(51) 99206-5039,,Usuário do time,,,pricila.kloppel@hiper.com.br
Natan Borges,natanborges@icloud.com,11 96326-8878,29/07/2025,Usuário do time,,29/07/2026,bruno@dinizbh.com.br
Nathalia Richard,nathalia.akos@gmail.com,(27) 99309-7049,,Usuário do time,,,alexandrelessa100@gmail.com
Miguel Karnani,nexia.py@gmail.com,+595 971 282828,,Usuário do time,,,marcelopasqualini@icloud.com
Thalita Juliana de Oliveira,nfe@ecopontes.com.br,18996334506,,Usuário do time,,,fhungaro@ecopontes.com.br
Nicholas Detz,nicholas@altherafranchising.com.br,11967612723,,Usuário do time,,,mateus@altherafranchising.com.br
Nicholas,nicholas@viverdeia.ai,5199962393,,Usuário do time,,,diego.malta@viverdeia.ai
Nicolas Arthur Gomes,nicolas.gomes@gpgroup.com.br,11968895908,,Usuário do time,,,fabio.fcg@hotmail.com
Nicolas Alexandre Machado Martins,nicolas@wmi.solutions,37988222320,,Usuário do time,,,rebeca@wmi.solutions
Nicole Gicklhorn,nicole.gicklhorn@gmail.com,41998343553,,Usuário do time,,,hatorimirian@gmail.com
Wladir Rodrigues Silva,o.contadordestories@gmail.com,85 98831-2620,,Usuário do time,,,alexandrehalves@hotmail.com
Leonardo Seibt,obras@wertestada.co,54999389658,,Usuário do time,,,giovanighis@gmail.com
Oliver Matheus,oliver.matheus@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Otávio Rodrigues de Oliveira,otavio.rodrigues@romaconsulting.com.br,34999363277,,Usuário do time,,,fernando@romaconsulting.com.br
Otavio Camargo Rossi,otavio@sgbmaq.com.br,011 974216473,31/07/2025,Usuário do time,,31/07/2026,gabriela@webpesados.com.br
Paulo Borges Junior,oticamunicipalcarianos@gmail.com,+5549999331959,,Usuário do time,,,pedro@taharamedical.com.br
Otoni Veríssimo,otoniverissimo@gmail.com,(82) 99906-0687,,Usuário do time,,,andrevitorio10@gmail.com
Pamela Machado,p.machado@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Pedro Bonfim,pab@besten.com.br,+5511910431259,,Usuário do time,,,financeirobesten@cpfabrasil.com.br
Pablo Costa,pabloccosta.ti@gmail.com,31 8762-4789,,Usuário do time,,,
Rodrigo Pacheco,pachecodanielrodrigo5@gmail.com,48988372326,,Usuário do time,,,arthur@pasettimidias.com
Patrícia Sandrini Bassi,patricia@centroeuropeu.com.br,41991025458,28/07/2025,Usuário do time,,28/07/2026,financeiro@centroeuropeu.com.br
Patrick Vasconcelos,patrick@webpesados.com.br,11 97182-0550,,Usuário do time,,,gabriela@webpesados.com.br
Patrick Vasconcelos da Silva ,patrick@webpesados.com.br ,11971820550,31/07/2025,Usuário do time,,31/07/2026,gabriela@webpesados.com.br
Paula Porto,paula.porto@institutogl.com,21994673505,,Usuário do time,,,naerte.junior@gmail.com
Paulo Messias,paulo.messias@nitro.com.br,,,Usuário do time,,,rodrigo.dsilva@nitro.com.br
Paulo Oliveira,paulo.oliveira@uraniafulldome.com.br,11 94028-6835,,Usuário do time,,,tiago@uraniafulldome.com.br
Paulo Henrique Barros Costa,paulo@costalaw.com.br,+5564981185872,,Usuário do time,,,danillo@costalaw.com.br
Pedro Góis,pedro.gois@ecopontes.com.br,18997668296,,Usuário do time,,,fhungaro@ecopontes.com.br
Pedro Brandão,pedrobrandao@grupoharo.com.br,81998143054,,Usuário do time,,,fernando@grupoharo.com.br
Pedro Bernardes,pedrocosta@fatoeng.com.br,31996173378,,Usuário do time,,,lucasamaral@fatoeng.com.br
Pedro Tahara,pedrotahara@gmail.com,11911989258,,Usuário do time,,,pedro@taharamedical.com.br
Kauã Pestana Alves,pestanak198@gmail.com,12991301424,,Usuário do time,,,pedro@taharamedical.com.br
Victor de Abreu Pimentel,Pimentel94victor@gmail.com,31993136959,,Usuário do time,,,gustavoballesterosr@hotmail.com
Paulo Afonso,pmlc.afonso@gmail.com,31 99882-3444,,Usuário do time,,,copywriter@vitormadruga.com
Poliana Santos,poliana.santos@centroeuropeu.com.br ,41997996131,28/07/2025,Usuário do time,,28/07/2026,financeiro@centroeuropeu.com.br
Luiz Claudio Pratts,pratts@eneway.com.br,+55 48 9934-3469,,Usuário do time,,,miguel.altieri@gmail.com
Priscila Silva,priscila.silva@gpgroup.com.br,11977001451,,Usuário do time,,,fabio.fcg@hotmail.com
Priscyla Soares,priscyla.soares@protecon.com.br,11-98997-8545,31/07/2025,Usuário do time,,31/07/2026,rafael@protecon.com.br
Marcilio Medeiros,produtorabrave@gmail.com,83988541809,,Usuário do time,,,arthur@pasettimidias.com
Rafaela Böhm,r.bohm@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
,r.soares@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Rafaela Tomaz,r.thomaz@ampulhetagestao.com.br,‪51 99366‑0672‬,31/07/2025,Usuário do time,,31/07/2026,marcell.ferreira@ampulhetagestao.com.br
Elienai Rabello,rabelloadm@gmail.com,48998055501,,Usuário do time,,,contatomatpro@gmail.com
Rafael Aquino,rafael.bsd.lk6@gmail.com,51999997030,,Usuário do time,,,eduardo@unicapersonalizados.com.br
Rafael Leão,rafael.leao@aspsoftwares.com.br,4999136-8510,,Usuário do time,,,asp@aspsoftwares.com.br
RAFAEL ALAN PEREIRA DE LIMA,rafael.lima@truckpag.com.br,45991564328,,Usuário do time,,,felipe.batista@truckpag.com.br
Rafael Shidomi,rafael.mshidomi@gmail.com,,,Usuário do time,,,felipeshidomi@gmail.com
Rafael Rocha Garcia,rafael@lbacapital.com.br,11947799376,,Usuário do time,,,bruno@lbacapital.com.br
Rafaela Roman Ros,rafaela@mnadvocacia.com.br,(48) 99632-2610,31/07/2025,Usuário do time,,31/07/2026,gabrielle.b@mnadvocacia.com.br
Rafael Perez,rafaelperez@assessoriamap.com.br,21982652277,,Usuário do time,,,victorborges@assessoriamap.com.br
Rafael Vieira Strodahl,rafaelvieira@ibotiadvogados.com.br,51984182882,,Usuário do time,,,iboti@ibotiadvogados.com.br
Raphael Alves Ramos Garcia,raphael.garcia@ateliedoautomovel.com.br,21971097299,,Usuário do time,,,estelane.alves@ateliedoautomovel.com.br
Raphael Fonseca de Galisteo,raphael@uraniaplanetario.com.br,+5548988397301,,Usuário do time,,,tiago@uraniafulldome.com.br
Raphael Herneque,raphaelgilh@gmail.com,85 9206-3984,,Usuário do time,,,ruan@braparas.com.br
Raul Lopes,raulopesbarbosa@gmail.com,11958488517,,Usuário do time,,,gislenegaruffi@gmail.com
Rayssa de Castro Santos,rayssadecastro1997@gmail.com,47999479327,,Usuário do time,,,elainecdtarelho@gmail.com
Fabio Machado,regional1@amfoods.com.br,51 9558-9612,,Usuário do time,,,fernando@pecorino.com.br
Renan R,renan.r@lesco.com.br,47997838884,,Usuário do time,,,lucasavila83@gmail.com
Renan Baia ,renanbaiar@gmail.com,91 8304-4554,30/07/2025,Usuário do time,,30/07/2026,alpsagencia@gmail.com
Renato Silva,renato.assuncao@nitro.com.br,,,Usuário do time,,,rodrigo.dsilva@nitro.com.br
Renato Dornelas Cardoso,renato@romaconsulting.com.br,34996675728,,Usuário do time,,,fernando@romaconsulting.com.br
Renatha Martins,rh@amfoods.com.br,51 8344-0069,,Usuário do time,,,fernando@pecorino.com.br
Sandy Vieira,rh@ecopontes.com.br,18997609561,,Usuário do time,,,fhungaro@ecopontes.com.br
Ricardo Quirino dos Santos,ricardo@grupoharo.com.br,81982503964,,Usuário do time,,,fernando@grupoharo.com.br
Ricardo Pereira,rikardop@gmail.com,(48) 98409-2896,,Usuário do time,,,paolaschwelm@gmail.com
RAFAEL LOPES SILVA,rlopessilva.90@gmail.com,21980296874,,Usuário do time,,,estelane.alves@ateliedoautomovel.com.br
Rafaela Morandi,rmorandidinizbh@gmail.com ,31 99485-0102,29/07/2025,Usuário do time,,29/07/2026,bruno@dinizbh.com.br
Roberta Vieira Costa da Silva,roberta.silva@gsp.com.br,+5548984642437,,Usuário do time,,,gerencia@hoteisportosol.com.br
Roberto Carlos,roberto.jesus@nitro.com.br,,,Usuário do time,,,rodrigo.dsilva@nitro.com.br
Robson Sell,robson.sell@jb3assessoria.com.br,48 98814-4566,,Usuário do time,,,financeiro@jb3assessoria.com.br
Rodolfo Gonçalves Smart,Rodolfo_fgoncalves@hotmail.com,31 7560-6204,31/07/2025,Usuário do time,,31/07/2026,julio@makedistribuidora.com.br
Rodrigo Lima,rodrigo@advocaciazaccaro.com.br,31983087182,,Usuário do time,,,fzaccaro@uol.com.br
Rodrigo Serral,rodrigo@jttelecomc.om.br,11996251761,,Usuário do time,,,thiago@jttelecom.com.br
Rodrigo Braz,rodrigobraz@assessoriamap.com.br,21989986496,,Usuário do time,,,victorborges@assessoriamap.com.br
Rogerio Antonio de Deus Chiavini,rogerio.recontabilidade@gmail.com,(15) 99101-4273,,Usuário do time,,,elton.recontabilidade@gmail.com
Rogério Victorino,rogerio.victorino@jdbusinessacademy.com.br,11 94978-1223,30/07/2025,Usuário do time,,30/07/2026,
Ronaldo Marques,ronaldomarques@rpmdigitalbusiness.com,11 93003-2558,,Usuário do time,,,ricpad34@gmail.com
ROSILEI CATIANE RAUTENBERG,rosilei@efrate.com.br,47999915201,,Usuário do time,,,elainecdtarelho@gmail.com
Ryan Medeiros,ryan.medeiros.melo@gmail.com,83996554139,,Usuário do time,,,arthur@pasettimidias.com
Sabrina Marques,sabrinamarques1905@gmail.com,(81) 99461-1181,,Usuário do time,,,andrevitorio10@gmail.com
Samuel Castelo,samuelcastelo.vls@hotmail.com,48 88484285,,Usuário do time,,,contatomatpro@gmail.com
Sarah Paletta Benatti,sarah.paletta@hiper.com.br,(11) 98150-8967,,Usuário do time,,,pricila.kloppel@hiper.com.br
Saulo,saulo@corplawadvogados.com.br,(84) 99419-6090,,Usuário do time,,,contato@carvalhomoreira.com.br
Michel Scaff Junior,scaff@mnadvocacia.com.br,(48) 99164-8454,,Usuário do time,,,
Srgio Pinto de Lemos Junior,sergio.lemos@leveluplatam.com,11934995348,,Usuário do time,,,rodrigo.dias@leveluplatam.com
Sergio Torretta,sergio@vidabela.com.br,51993904925,,Usuário do time,,,edison@vidabela.com.br
Silvio Fiori Netto,silvio.netto@leveluplatam.com,19991624216,,Usuário do time,,,rodrigo.dias@leveluplatam.com
Ulisses Simoes Vertuan,simoes.ul@gmail.com,14981254878,,Usuário do time,,,thiagomoura.suporte@gmail.com
Simone Diniz de Gouveia,simone_diniz@hotmail.com,+55 11 98380-6090,,Usuário do time,,,keniafukuyama05@gmail.com
Simone Crippa,simone.crippa2018@gmail.com,31 98387-0773,,Usuário do time,,,brayan.rampin@eag.com.br
Simone Sartori,simone.sartori@sgbmaq.com.br,11 98276-1224,,Usuário do time,,,gabriela@webpesados.com.br
Simone Ratayczik,simone@hiper.com.br,(47) 99273-1751,,Usuário do time,,,pricila.kloppel@hiper.com.br
Sâmara Paz da Silva,spaz@omz.ag,31994597833,,Usuário do time,,,smagalhaes@omz.ag
Stephanie Ho,stephanie.ho@truckpag.com.br,45998254408,,Usuário do time,,,felipe.batista@truckpag.com.br
Marcos Antônio de Morais Lins,supervisaoti@paxsilva.com.br,+55 62 98339-2832,,Usuário do time,,,arianohenrique@paxsilva.com.br
Graziele Garcia,suporte01@jttelecom.com.br,11973656885,,Usuário do time,,,thiago@jttelecom.com.br
Sidney Vitor da Silva,suporte02@gzvsolutions.com.br,11970397852,,Usuário do time,,,gustavo@gzvsolutions.com.br
Tadeu Drumond,tadeu@sogalpoes.com.br,31991577571,,Usuário do time,,,tiago@sogalpoes.com.br
Talita Freire de Freitas,talitafreitas1@hotmail.com,43991415354,,Usuário do time,,,eniosambati@gmail.com
Carlos Wagner,technology@wra-usa.com,+1 (321) 504-1968,,Usuário do time,,,tdarealtor@gmail.com
Teresa Rocha,teresa.rocha.coach@gmail.com,21 99567-9156,,Usuário do time,,,brayan.rampin@eag.com.br
Thaina Godinho,thainagodinho@gmail.com,(48) 98874-1470,,Usuário do time,,,paolaschwelm@gmail.com
Afonso João Alves Neto,thaisgonzaga.tg@gmail.com,47984186198,,Usuário do time,,,thaisgonzaga.tg@gmail.com
Thais Lounine,thaislounine@gmail.com,35 9844-8815,31/07/2025,Usuário do time,,31/07/2026,julio@makedistribuidora.com.br
Thales Mariosa,thalesdanalytics@gmail.com,35 998851424,,Usuário do time,,,alexandrehalves@hotmail.com
Thiago Correa,thiago.correa@feltrimcorrea.com.br,13996663469,,Usuário do time,,,julio.feltrim@feltrimcorrea.com.br
Thiago Mendonça,thiago.mendonca@jb3assessoria.com.br,48 99105-5434,,Usuário do time,,,financeiro@jb3assessoria.com.br
Thiago de Araújo Lima,thiago@advocaciazaccaro.com.br,11943224546,,Usuário do time,,,fzaccaro@uol.com.br
Thuany Gesser,thuany.gesser@gmail.com,48988049751,,Usuário do time,,,arthur@pasettimidias.com
Lucas Espindola Birlem,ti@clinicaunirad.com.br,51991097100,,Usuário do time,,,adm@clinicaunirad.com.br
TI Hoteis Porto Sol,ti@hoteisportosol.com.br,+5548991517353,,Usuário do time,,,gerencia@hoteisportosol.com.br
Tiago Lucena,tiago.lucena@nitro.com.br,,,Usuário do time,,,rodrigo.dsilva@nitro.com.br
Tiago Marchitiello,tmarchitiello@omz.ag,11993481008,,Usuário do time,,,smagalhaes@omz.ag
Tales Neri Borsoi,tnborsoi@gmail.com,22 99760-0040,,Usuário do time,,,brayan.rampin@eag.com.br
Fernando Valadares Leal,Trafegocomleal@gmail.com,91 8597-3240,30/07/2025,Usuário do time,,30/07/2026,alpsagencia@gmail.com
Victor Puccini,v.puccini@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Evaldo Santos,valdohozu@gmail.com,(32) 99866-7028,,Usuário do time,,,paolaschwelm@gmail.com
Valter Blauth Junior,valterblauth@gmail.com,48998126132,,Usuário do time,,,lublauth@hotmail.com
Vanessa santana,vanessaummogi828@gmail.com,6898678895,,Usuário do time,,,dessbr1981@gmail.com
Ana Claudia de J Santos,vendas@primebaby.com.br,11 96853-6621,31/07/2025,Usuário do time,,31/07/2026,alessandra@primebaby.com.br
Alex Lopes,vendasalexlopesnegocios@gmail.com,41997041478,,Usuário do time,,,duthome@duthome.com
Vanessa Ferre Ferreira,vferre@omz.ag,11981068858,,Usuário do time,,,smagalhaes@omz.ag
Marcos ,vfilho467@gmail.com, 35 8471-4568,31/07/2025,Usuário do time,,31/07/2026,julio@makedistribuidora.com.br
Victor Sarmento Zamprogno,victor.zamprogno@mzmadvogados.com.br,27992817830,,Usuário do time,,,filipe@corretavitoria.com.br
Vinicius Marotti,vinicius.marotti@systemway.com.br,14974009711,,Usuário do time,,,murilo@systemway.com.br
Vinicius S Paes,vinicius.paes@aspsoftwares.com.br,49999671972,,Usuário do time,,,asp@aspsoftwares.com.br
Vinicius Giaretta Picoli,vinicius.picoli@premacar.com,49 998061999,,Usuário do time,,,petersonkolling@gmail.com
Vinicius Cruz,vinicius@roixautomacao.com.br,81989993370,,Usuário do time,,,gg@ecpmais.com.br
Vinicius Santos,vinicius@sunter.com.br,71991570309,,Usuário do time,,,caioxaviercb@gmail.com
Guilherme Almeida,guilherme.almeida@sunter.com.br,71 9318-9377,,Usuário do time,,,caioxaviercb@gmail.com
Levi Monteiro,levi.monteiro@sunter.com.br,71 8299-5860,,Usuário do time,,,caioxaviercb@gmail.com
Pedro Gomes,pedro.gomes@sunter.com.br,71 8664-0617,,Usuário do time,,,caioxaviercb@gmail.com
Luis Fernando,luis.pomponet@sunter.com.br,71 8525-2769,,Usuário do time,,,caioxaviercb@gmail.com
Erick Urpia,erick.urpia@sunter.com.br,71 8195-5092,,Usuário do time,,,caioxaviercb@gmail.com
Vitor Feltrim,vitor.feltrim@feltrimcorrea.com.br,18997288725,,Usuário do time,,,julio.feltrim@feltrimcorrea.com.br
Vitor Henrique Milharezi Silva,vitor.milharezi@primesecure.com.br,11971820497,,Usuário do time,,,alisson@alisatfrotas.com.br
Vitor Mateus Brandt Ramos,vitor.ramos@hiper.com.br,(47) 99259-9869,,Usuário do time,,,pricila.kloppel@hiper.com.br
Vitor Anfrizio,vitoranfrizio@proton.me,79991725363,,Usuário do time,,,hugo@popcode.com.br
Vitor Hugo S Paes,vitorhpaes@gmail.com,49984255974,,Usuário do time,,,asp@aspsoftwares.com.br
Bruno Von Rondow Campos,vonrondow96@gmail.com,31 98294-4585,,Usuário do time,,,miguel.altieri@gmail.com
Wesley Silva Estevam De Lima,w.estevam@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Wagner Blauth,wagnerblauth@gmail.com,48996337889,,Usuário do time,,,lublauth@hotmail.com
Winicius Braz,wbraz@agmoonflag.com.br,11 94910-4958,,Usuário do time,,,dbatista@agmoonflag.com.br
Wellington Campos,wellingtonscm@gmail.com,11 96325-8405,,Usuário do time,,,petersonkolling@gmail.com
Wendy Uda,wendyuda@assessoriamap.com.br,1129460209,,Usuário do time,,,victorborges@assessoriamap.com.br
Gilmar Weigmann,wgempresarial@hotmail.com,71 99727-8464,,Usuário do time,,,brayan.rampin@eag.com.br
William Mansano Lessa,william.lessa@embabox.com.br,11944425978,,Usuário do time,,,neto_cavalari@hotmail.com
Thiago da Silva Xavier,xavierthiago@hotmail.com,21 988581296,,Usuário do time,,,gustavoballesterosr@hotmail.com
Yngrid Veltroni,y.veltroni@g4educacao.com,,,Usuário do time,,,m.antonini@g4educacao.com
Yuri dos Santos Rodrigues,yrodrigues@hotmail.com,48 991913219,,Usuário do time,,,
Tatiane Zappellini,Zappellinitati@gmail.com,19992151378,,Usuário do time,,,hatorimirian@gmail.com
Zione Santana,zionesantana@rpmdigitalbusiness.com,+55 11 99233-3803,,Usuário do time,,,ricpad34@gmail.com
JOSÉ DA SILVA LEITÃO NETO,zleitao@hotmail.com,(82) 99642-5343,,Usuário do time,,,andrevitorio10@gmail.com
Davi Francisco da Silva Pereira,davi.francisco@imbprime.com,51 98140-6924,eduardo.duarte@imbprime.com,Usuário do time,,,eduardo.duarte@imbprime.com
Mauricio Costa Rodrigues,mauricio@costasavian.com.br,51991936778,costasavian@costasavian.com.br,Usuário do time,,,costasavian@costasavian.com.br
Robson Verfe Leal,robson@costasavian.com.br,51999760181,costasavian@costasavian.com.br,Usuário do time,,,costasavian@costasavian.com.br
Abilio Machado,abilio.abiliomachado@gmail.com,51996238666,costasavian@costasavian.com.br,Usuário do time,,,costasavian@costasavian.com.br
Kelvin Jonathan,kelvin.jonathan20@gmail.com,+5577991483111,saluswatercursos@gmail.com,Usuário do time,,,saluswatercursos@gmail.com
Davidson Ferreira Pimenta,financeiro@cmtimoveis.com.br,5531997772142,,Usuário do time,,,bruno.coelho@comiteco.com.br
Vagner Cardoso Júnior,vagner.junior@cmtimoveis.com.br,5531999628147,,Usuário do time,,,bruno.coelho@comiteco.com.br
Pedro Henrique Rodrigues,prfpedro.rodrigues@gmail.com,5511939218162,,Usuário do time,,,andrefellipeamorim@gmail.com
Jefferson Garcia de Sousa,jeffersongarciabnu@gmail.com,5547991870707,,Usuário do time,,,andrefellipeamorim@gmail.com
Cristiano Ramos Matheus,cristiano.ramosrm@gmail.com,5579999064348,,Usuário do time,,,financeiro@gleebem.com.br
AUGUSTO MATEUS SANTOS MATIAS,augusto.santos@sepromotora.com.br,5579999767630,,Usuário do time,,,financeiro@gleebem.com.br
Carine Marques,carinemarques@flwowlab.com,5511966401894,,Usuário do time,,,claudiavale@flwowlab.com
Laise Porto,laiseporto@flwowlab.com,5511939590296,,Usuário do time,,,claudiavale@flwowlab.com
Erick Urpia,erick.urpia@sunter.com.br,5571981955092,,Usuário do time,,,caioxaviercb@gmail.com
Luis Fernando,luis.fernando@sunter.com.br,5571985252769,,Usuário do time,,,caioxaviercb@gmail.com
Bernardo Vale,bernardovale@flwowlab.com,5531984730872,,Usuário do time,,,claudiavale@flwowlab.com
Maurício Volkart de Carvalho,mauriciovcarvalho@proton.me,51981147748,,Usuário do time,,,administrativo@conferirengenharia.com
Kariane Winter Sartori,"administrativo@conferirengenharia.com
",51980182473,,Usuário do time,,,administrativo@conferirengenharia.com
Bruna Lopes,bruna@confa.com.br,51992490744,,Usuário do time,,,administrativo@conferirengenharia.com
Paulo Rogério Castro Lemos,rogerc.pessoal@gmail.com,"51 99594-9334
",,Usuário do time,,,administrativo@conferirengenharia.com
Gabriel Ayala,gabriel.ayala.martins@gmail.com,51991629180,,Usuário do time,,,administrativo@conferirengenharia.com
"Raphael Fonseca de Galisteo
","raphael@uraniaplanetario.com.br
",,,Usuário do time,,,infra@nectho.com.br
Eduardo Monteiro,eduardo.monteiro@autus.com.br,5534992068045,,Usuário do time,,,eduardo.nunes@autus.com.br
Pedro Ferreira,pedro.ferreira@autus.com.br,5534997661513,,Usuário do time,,,eduardo.nunes@autus.com.br
wellington sousa,wellington.sousa@autus.com.br,5534991942761,,Usuário do time,,,eduardo.nunes@autus.com.br
luciano messias,luciano.messias@autus.com.br,5534999697212,,Usuário do time,,,eduardo.nunes@autus.com.br
jean garcia,jean.garcia@autus.com.br,5534998961005,,Usuário do time,,,eduardo.nunes@autus.com.br
luiz sergio,luiz.sergio@autus.com.br,5534988048444,,Usuário do time,,,eduardo.nunes@autus.com.br
zandra,zandra@autus.com.br,5534996718261,,Usuário do time,,,eduardo.nunes@autus.com.br
daniel,daniel@nextgti.com.br,5511998763371,,Usuário do time,,,lbrand@pro-seed.com.br
wilson,wilson@nextgti.com.br,5511975763393,,Usuário do time,,,lbrand@pro-seed.com.br
Patricia Feher Brand,patricia@pro-seed.com.br,972 532718718,,Usuário do time,,,lbrand@pro-seed.com.br
Marcos Elerati,marcos.elerati@pxativosjudiciais.com.br,5511993403285,,Usuário do time,,,mikael.fontes@hotmail.com
José Oliveira,jose.oliveira@pxativosjudiciais.com.br,5511996365500,,Usuário do time,,,mikael.fontes@hotmail.com
Igor Rios,igor.rios.gt@gmail.com,557981714807,,Usuário do time,,,rebecagiffone@gmail.com
Fernando Giffone,fernandogiffone1971@gmail.com,5521974006464,,Usuário do time,,,rebecagiffone@gmail.com
Marcos Vinícius,contato@vectadsgn.com,5571991623752,,Usuário do time,,,moabe.jr@outlook.com
Davi Francisco da Silva Pereira,davi.francisco@imbprime.com,5551981406924,,Usuário do time,,,eduardo.duarte@imbprime.com
Marcos Vinícius da Silva Nogueira,contato@vectadsgn.com,5571999956556,,Usuário do time,,,moabe.jr@outlook.com
Thiele Ferreira Oliveira,thiele@vortexsoft.com.br,5577999960107,,Usuário do time,,,luisfc09@gmail.com
Rafael Andrade de Sousa,rafael.andrade@planning.com.br,62981314475,,Usuário do time,,,equipe.financeiro@planning.com.br
Pedro Araújo,pedro.araujo@planning.com.br,62982474442,,Usuário do time,,,equipe.financeiro@planning.com.br
Pedro Araújo,pedro.araujo@planning.com.br,62982474442,,Usuário do time,,,equipe.financeiro@planning.com.br
Jean Tofoles Martins Bernardes,jean.tofoles@adaptive.com.br,34993387868,,Usuário do time,,,controladoria@adaptive.com.br
Lucas Botelho,lucas.botelho@adaptive.com.br,3420181156,,Usuário do time,,,controladoria@adaptive.com.br
Paulo Eduardo de Morais,paulo@adaptive.com.br,34991113270,,Usuário do time,,,controladoria@adaptive.com.br
Bruna Polliana Coelho dos Santos,bruna@adaptive.com.br,83988440208,,Usuário do time,,,controladoria@adaptive.com.br
Wilson Gonçalves Nascimento,wilson.nascimento@adaptive.com.br,34984424438,,Usuário do time,,,controladoria@adaptive.com.br
Rodrigo de Oliveira Guerra,rodrigo@adaptive.com.br,34991113273,,Usuário do time,,,controladoria@adaptive.com.br
Jean Carlos Curti,jean.curti@adaptive.com.br,43988117069,,Usuário do time,,,controladoria@adaptive.com.br
Raphael Cavalcante da Silva,phael.ufc@gmail.com,85988495478,,Usuário do time,,,Raphaelvencato@agrovaletransportes.com.br`;
    const lines = csvText.split('\n');
    
    console.log(`📄 [CSV-IMPORT] CSV carregado com ${lines.length} linhas`);
    
    // Processar cabeçalho para encontrar índices das colunas
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const emailIndex = 1; // Coluna 2 (índice 1) - Email do usuário
    const masterEmailIndex = 7; // Coluna 8 (índice 7) - Acesso vinculado a
    
    console.log('📋 [CSV-IMPORT] Cabeçalhos encontrados:', headers);
    
    const updates: Array<{userEmail: string, masterEmail: string}> = [];
    let processedLines = 0;
    
    // Processar cada linha do CSV
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const userEmail = values[emailIndex]?.toLowerCase().trim();
      const masterEmail = values[masterEmailIndex]?.toLowerCase().trim();
      
      if (userEmail && masterEmail && userEmail !== masterEmail) {
        updates.push({ userEmail, masterEmail });
        processedLines++;
      }
    }
    
    console.log(`🔍 [CSV-IMPORT] ${processedLines} linhas processadas para update`);
    
    // Executar updates em lotes
    let updatedCount = 0;
    let errorCount = 0;
    const batchSize = 50;
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      for (const update of batch) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .update({ master_email: update.masterEmail })
            .eq('email', update.userEmail)
            .is('master_email', null); // Só atualizar se master_email for NULL
          
          if (!error) {
            updatedCount++;
          } else {
            console.warn(`❌ [CSV-IMPORT] Erro ao atualizar ${update.userEmail}:`, error.message);
            errorCount++;
          }
        } catch (err) {
          console.warn(`❌ [CSV-IMPORT] Erro interno para ${update.userEmail}:`, err);
          errorCount++;
        }
      }
      
      // Log do progresso a cada lote
      console.log(`📊 [CSV-IMPORT] Progresso: ${Math.min(i + batchSize, updates.length)}/${updates.length} processados`);
    }
    
    // Verificar estatísticas finais
    const { data: stats, error: statsError } = await supabase.rpc('get_user_stats_corrected');
    
    const result = {
      success: true,
      message: `Importação concluída! ${updatedCount} usuários atualizados com master_email`,
      details: {
        totalLinesProcessed: processedLines,
        usersUpdated: updatedCount,
        errors: errorCount,
        finalStats: stats || null
      }
    };
    
    console.log('✅ [CSV-IMPORT] Importação finalizada:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('🚨 [CSV-IMPORT] Erro crítico:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        details: 'Falha na importação do CSV'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});