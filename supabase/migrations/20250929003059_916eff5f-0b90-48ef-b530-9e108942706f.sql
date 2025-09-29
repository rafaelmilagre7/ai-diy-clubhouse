-- Corrigir configuração dos usuários da planilha
-- Transformar team members em usuários individuais associados à organização

-- 1. Garantir que apenas Mikael seja master
UPDATE profiles 
SET is_master_user = true 
WHERE email = 'mikael@formacaovendasegestao.com.br';

-- 2. Todos os outros usuários da planilha devem ser usuários individuais 
-- (não masters, mas associados à organização do Mikael)
UPDATE profiles 
SET is_master_user = false
WHERE email IN (
  'andreluisleonori@gmail.com',
  'douglas.leao05@gmail.com', 
  'vendas@grupobarcelos.com.br',
  'ademir@tecnoplasbr.com.br',
  'contato@institutohumanitasrs.org.br',
  'rodrigo@viptreinamentos.com.br',
  'rh@institutohumanitasrs.org.br',
  'comercial@lojasmm.com.br',
  'bruno@viptreinamentos.com.br',
  'atendimento@ferragensguarapari.com.br',
  'comercial@grupobarcelos.com.br',
  'eduardo@viptreinamentos.com.br',
  'sandra@institutohumanitasrs.org.br',
  'bruna@viptreinamentos.com.br',
  'gabriellyoli2015@gmail.com',
  'adm@tecnoplasbr.com.br'
) AND email != 'mikael@formacaovendasegestao.com.br';

-- 3. Garantir que estes usuários mantenham association com a organização do Mikael
UPDATE profiles 
SET organization_id = (
  SELECT organization_id 
  FROM profiles 
  WHERE email = 'mikael@formacaovendasegestao.com.br' 
  LIMIT 1
)
WHERE email IN (
  'andreluisleonori@gmail.com',
  'douglas.leao05@gmail.com', 
  'vendas@grupobarcelos.com.br',
  'ademir@tecnoplasbr.com.br',
  'contato@institutohumanitasrs.org.br',
  'rodrigo@viptreinamentos.com.br',
  'rh@institutohumanitasrs.org.br',
  'comercial@lojasmm.com.br',
  'bruno@viptreinamentos.com.br',
  'atendimento@ferragensguarapari.com.br',
  'comercial@grupobarcelos.com.br',
  'eduardo@viptreinamentos.com.br',
  'sandra@institutohumanitasrs.org.br',
  'bruna@viptreinamentos.com.br',
  'gabriellyoli2015@gmail.com',
  'adm@tecnoplasbr.com.br'
);

-- 4. Log da correção
INSERT INTO audit_logs (
  user_id,
  event_type, 
  action,
  details,
  severity
) VALUES (
  (SELECT id FROM profiles WHERE email = 'mikael@formacaovendasegestao.com.br' LIMIT 1),
  'data_correction',
  'spreadsheet_user_structure_fix',
  jsonb_build_object(
    'description', 'Corrigida estrutura de usuários da planilha - individuais associados ao master',
    'master_users', 1,
    'individual_users', 16,
    'organization_name', 'Formação Vendas e Gestão'
  ),
  'info'
);