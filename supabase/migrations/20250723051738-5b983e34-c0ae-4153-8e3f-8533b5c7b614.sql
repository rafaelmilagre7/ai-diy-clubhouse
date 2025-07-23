-- Migração para adicionar suporte a estado+cidade no onboarding
-- Atualizar estrutura do personal_info para incluir state

-- 1. Primeiro, vamos atualizar os registros existentes que só têm city
-- Tentaremos inferir o estado baseado na cidade (principais capitais)
UPDATE public.onboarding_final 
SET personal_info = personal_info || jsonb_build_object(
  'state', 
  CASE 
    WHEN personal_info->>'city' ILIKE '%São Paulo%' OR personal_info->>'city' ILIKE '%SP%' THEN 'SP'
    WHEN personal_info->>'city' ILIKE '%Rio de Janeiro%' OR personal_info->>'city' ILIKE '%RJ%' THEN 'RJ'
    WHEN personal_info->>'city' ILIKE '%Belo Horizonte%' OR personal_info->>'city' ILIKE '%MG%' THEN 'MG'
    WHEN personal_info->>'city' ILIKE '%Brasília%' OR personal_info->>'city' ILIKE '%DF%' THEN 'DF'
    WHEN personal_info->>'city' ILIKE '%Salvador%' OR personal_info->>'city' ILIKE '%BA%' THEN 'BA'
    WHEN personal_info->>'city' ILIKE '%Curitiba%' OR personal_info->>'city' ILIKE '%PR%' THEN 'PR'
    WHEN personal_info->>'city' ILIKE '%Fortaleza%' OR personal_info->>'city' ILIKE '%CE%' THEN 'CE'
    WHEN personal_info->>'city' ILIKE '%Recife%' OR personal_info->>'city' ILIKE '%PE%' THEN 'PE'
    WHEN personal_info->>'city' ILIKE '%Porto Alegre%' OR personal_info->>'city' ILIKE '%RS%' THEN 'RS'
    WHEN personal_info->>'city' ILIKE '%Manaus%' OR personal_info->>'city' ILIKE '%AM%' THEN 'AM'
    WHEN personal_info->>'city' ILIKE '%Belém%' OR personal_info->>'city' ILIKE '%PA%' THEN 'PA'
    WHEN personal_info->>'city' ILIKE '%Goiânia%' OR personal_info->>'city' ILIKE '%GO%' THEN 'GO'
    WHEN personal_info->>'city' ILIKE '%Vitória%' OR personal_info->>'city' ILIKE '%ES%' THEN 'ES'
    WHEN personal_info->>'city' ILIKE '%Florianópolis%' OR personal_info->>'city' ILIKE '%SC%' THEN 'SC'
    WHEN personal_info->>'city' ILIKE '%Natal%' OR personal_info->>'city' ILIKE '%RN%' THEN 'RN'
    WHEN personal_info->>'city' ILIKE '%João Pessoa%' OR personal_info->>'city' ILIKE '%PB%' THEN 'PB'
    WHEN personal_info->>'city' ILIKE '%Aracaju%' OR personal_info->>'city' ILIKE '%SE%' THEN 'SE'
    WHEN personal_info->>'city' ILIKE '%Teresina%' OR personal_info->>'city' ILIKE '%PI%' THEN 'PI'
    WHEN personal_info->>'city' ILIKE '%São Luís%' OR personal_info->>'city' ILIKE '%MA%' THEN 'MA'
    WHEN personal_info->>'city' ILIKE '%Maceió%' OR personal_info->>'city' ILIKE '%AL%' THEN 'AL'
    WHEN personal_info->>'city' ILIKE '%Campo Grande%' OR personal_info->>'city' ILIKE '%MS%' THEN 'MS'
    WHEN personal_info->>'city' ILIKE '%Cuiabá%' OR personal_info->>'city' ILIKE '%MT%' THEN 'MT'
    WHEN personal_info->>'city' ILIKE '%Rio Branco%' OR personal_info->>'city' ILIKE '%AC%' THEN 'AC'
    WHEN personal_info->>'city' ILIKE '%Porto Velho%' OR personal_info->>'city' ILIKE '%RO%' THEN 'RO'
    WHEN personal_info->>'city' ILIKE '%Boa Vista%' OR personal_info->>'city' ILIKE '%RR%' THEN 'RR'
    WHEN personal_info->>'city' ILIKE '%Macapá%' OR personal_info->>'city' ILIKE '%AP%' THEN 'AP'
    WHEN personal_info->>'city' ILIKE '%Palmas%' OR personal_info->>'city' ILIKE '%TO%' THEN 'TO'
    ELSE 'SP' -- Default para SP se não conseguir identificar
  END
)
WHERE personal_info ? 'city' 
  AND NOT personal_info ? 'state';

-- 2. Para registros que não têm city nem state, definir valores padrão
UPDATE public.onboarding_final 
SET personal_info = personal_info || jsonb_build_object(
  'state', 'SP',
  'city', 'São Paulo'
)
WHERE NOT personal_info ? 'city' 
  AND NOT personal_info ? 'state';

-- 3. Normalizar cidades que podem ter mudado de nome ou formato
UPDATE public.onboarding_final 
SET personal_info = personal_info || jsonb_build_object(
  'city', 
  CASE 
    WHEN personal_info->>'city' ILIKE '%São Paulo, SP%' THEN 'São Paulo'
    WHEN personal_info->>'city' ILIKE '%Rio de Janeiro, RJ%' THEN 'Rio de Janeiro'
    WHEN personal_info->>'city' ILIKE '%Belo Horizonte, MG%' THEN 'Belo Horizonte'
    ELSE personal_info->>'city'
  END
)
WHERE personal_info ? 'city';