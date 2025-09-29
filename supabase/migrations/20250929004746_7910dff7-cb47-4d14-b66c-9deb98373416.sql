-- Correção completa da estrutura da planilha - Versão corrigida
-- Identificar todos os masters únicos da coluna "Acesso vinculado a" e reorganizar usuários

-- 1. Backup dos dados atuais
INSERT INTO analytics_backups (table_name, backup_reason, backup_data, record_count)
VALUES (
  'profiles_backup_complete_fix_v2',
  'Backup antes da correção completa da estrutura da planilha - v2',
  (SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'email', email,
      'name', name,
      'is_master_user', is_master_user,
      'organization_id', organization_id
    )
  ) FROM profiles WHERE email IS NOT NULL),
  (SELECT COUNT(*) FROM profiles WHERE email IS NOT NULL)
);

-- 2. Lista completa de masters extraídos da planilha (coluna "Acesso vinculado a")
CREATE TEMP TABLE masters_list AS
SELECT DISTINCT email_master FROM (
  VALUES 
    ('ronivon10@gmail.com'),
    ('umerickmaciel@gmail.com'), 
    ('ssorrentino@signhouse.com.br'),
    ('andrevitorio10@gmail.com'),
    ('ruan@braparas.com.br'),
    ('Comercial2@cozapi.com.br'),
    ('thaisgonzaga.tg@gmail.com'),
    ('clebergengnagel@gmail.com'),
    ('alexandrelessa100@gmail.com'),
    ('paulo.neto@hubnexxo.com.br'),
    ('grkoerich@gmail.com'),
    ('murilo@systemway.com.br'),
    ('gislenegaruffi@gmail.com'),
    ('brayan.rampin@eag.com.br'),
    ('felipe.batista@truckpag.com.br'),
    ('keity.marques@cupola.com.br'),
    ('pricila.kloppel@hiper.com.br'),
    ('rmilharezi@primesecure.com.br'),
    ('verenice.oliveira@contourline.com.br'),
    ('contato@geracaodeatletas.com'),
    ('hermesoliveira@gmail.com'),
    ('bruno@lbacapital.com.br'),
    ('caio@medassistservicos.com.br'),
    ('saluswatercursos@gmail.com'),
    ('guilherme.marcuschi@acquanobilis.com.br'),
    ('dheikson@gmail.com'),
    ('zacarias.kelly@gmail.com'),
    ('rafael@protecon.com.br'),
    ('contato@carvalhomoreira.com.br'),
    ('clovis@mosaicai.com.br'),
    ('lucasavila83@gmail.com'),
    ('arthurthedim@hotmail.com'),
    ('edison@vidabela.com.br'),
    ('gabrielle.b@mnadvocacia.com.br'),
    ('fernando.mourao@crossercapital.com'),
    ('financeiro@centroeuropeu.com.br'),
    ('naerte.junior@gmail.com'),
    ('ronan@besserhome.com.br'),
    ('iboti@ibotiadvogados.com.br'),
    ('bruno@pontopromotora.com.br'),
    ('m.antonini@g4educacao.com'),
    ('vitorsimoescoelho@gmail.com'),
    ('copywriter@vitormadruga.com'),
    ('tiago@sogalpoes.com.br'),
    ('renato.santos@biogenesisbago.com'),
    ('samuel@outliers.adv.br'),
    ('neto_cavalari@hotmail.com'),
    ('julio@makedistribuidora.com.br'),
    ('raphaelvencato@agrovaletransportes.com.br'),
    ('fernando@pecorino.com.br'),
    ('tdarealtor@gmail.com'),
    ('elainecdtarelho@gmail.com'),
    ('financeirobesten@cpfabrasil.com.br'),
    ('hatorimirian@gmail.com'),
    ('diego@devantsolucoes.com.br'),
    ('bruno.coelho@comiteco.com.br'),
    ('tiago@uraniafulldome.com.br'),
    ('fhungaro@ecopontes.com.br'),
    ('ricpad34@gmail.com'),
    ('victorborges@assessoriamap.com.br'),
    ('petersonkolling@gmail.com'),
    ('miguel.altieri@gmail.com'),
    ('lucas@interlinkcargo.com.br'),
    ('gg@ecpmais.com.br'),
    ('matheus@pgsinalizacoes.com'),
    ('contato@mktefetivo.com'),
    ('adriano@jacometo.com.br'),
    ('dbatista@agmoonflag.com.br'),
    ('andremariga2005@gmail.com'),
    ('viniciusmendeslima@agenciabesouro.com'),
    ('guilherme@winke.com.br'),
    ('viniciusbalatore@gmail.com'),
    ('gerencia@hoteisportosol.com.br'),
    ('pnoleto24@gmail.com'),
    ('eduardo.duarte@imbprime.com'),
    ('pedro@taharamedical.com.br'),
    ('adm@clinicaunirad.com.br'),
    ('renato@moreiramendes.com.br'),
    ('alessandra@primebaby.com.br'),
    ('julio.feltrim@feltrimcorrea.com.br'),
    ('smagalhaes@omz.ag'),
    ('paulo@zaya.it'),
    ('rodrigo.dias@leveluplatam.com'),
    ('caio@mendesishak.com.br'),
    ('diogo@rjhabitat.com'),
    ('renato@saopratico.com.br'),
    ('rodrigo.dsilva@nitro.com.br'),
    ('gustavoballesterosr@hotmail.com'),
    ('jessel@digitronbalancas.com.br'),
    ('marceloborgonovo@me.com'),
    ('bruno@dinizbh.com.br'),
    ('gabrielbprates@hotmail.com'),
    ('rebeca@wmi.solutions'),
    ('Bethyela@gmail.com'),
    ('institutoneurosciences@gmail.com')
) AS masters(email_master);

-- 3. Configurar masters: is_master_user = true
UPDATE profiles 
SET is_master_user = true,
    updated_at = now()
WHERE email IN (SELECT email_master FROM masters_list)
  AND email IS NOT NULL;

-- 4. Configurar todos os outros usuários como não-masters
UPDATE profiles 
SET is_master_user = false,
    updated_at = now()
WHERE email NOT IN (SELECT email_master FROM masters_list)
  AND email IS NOT NULL;

-- 5. Criar organizações para cada master que ainda não tem uma
INSERT INTO organizations (name, master_user_id, created_at, updated_at)
SELECT 
  COALESCE(p.name, 'Organização ' || split_part(p.email, '@', 1)) as org_name,
  p.id as master_user_id,
  now() as created_at,
  now() as updated_at
FROM profiles p
INNER JOIN masters_list m ON p.email = m.email_master
WHERE p.is_master_user = true
  AND p.id NOT IN (SELECT COALESCE(master_user_id, '00000000-0000-0000-0000-000000000000'::uuid) FROM organizations)
ON CONFLICT DO NOTHING;

-- 6. Associar masters às suas organizações
UPDATE profiles 
SET organization_id = o.id,
    updated_at = now()  
FROM organizations o
WHERE profiles.id = o.master_user_id
  AND profiles.is_master_user = true
  AND profiles.organization_id IS NULL;

-- 7. Log da correção
INSERT INTO audit_logs (
  user_id,
  event_type,
  action,  
  details,
  severity
) VALUES (
  (SELECT id FROM profiles WHERE is_master_user = true LIMIT 1),
  'data_correction',
  'complete_spreadsheet_structure_fix_v2',
  jsonb_build_object(
    'description', 'Correção completa da estrutura da planilha',
    'masters_configured', (SELECT COUNT(*) FROM profiles WHERE is_master_user = true),
    'individual_users', (SELECT COUNT(*) FROM profiles WHERE is_master_user = false),
    'organizations_created', (SELECT COUNT(*) FROM organizations),
    'correction_timestamp', now()
  ),
  'info'
);

-- 8. Estatísticas finais
SELECT 
  'Resultado da correção:' as status,
  jsonb_build_object(
    'masters_configurados', (SELECT COUNT(*) FROM profiles WHERE is_master_user = true),
    'usuarios_individuais', (SELECT COUNT(*) FROM profiles WHERE is_master_user = false),
    'organizacoes_criadas', (SELECT COUNT(*) FROM organizations),
    'timestamp', now()
  ) as estatisticas;