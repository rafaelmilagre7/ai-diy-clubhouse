-- =====================================================
-- QUERIES DE MONITORAMENTO - PROGRESSO DE AULAS
-- =====================================================

-- 1. VERIFICAR CONCLUSÕES RECENTES (última hora)
-- =====================================================
SELECT 
  l.title as aula,
  l.id as lesson_id,
  p.progress_percentage,
  p.completed_at,
  p.updated_at,
  EXTRACT(EPOCH FROM (NOW() - p.updated_at)) / 60 as minutos_atras,
  prof.name as usuario
FROM learning_progress p
JOIN learning_lessons l ON p.lesson_id = l.id
LEFT JOIN profiles prof ON p.user_id = prof.id
WHERE p.progress_percentage >= 100
  AND p.updated_at >= NOW() - INTERVAL '1 hour'
ORDER BY p.updated_at DESC;

-- 2. VERIFICAR ESTADO INCONSISTENTE
-- =====================================================
SELECT 
  user_id,
  lesson_id,
  progress_percentage,
  completed_at,
  updated_at,
  CASE 
    WHEN progress_percentage >= 100 AND completed_at IS NULL THEN 'BUG: Concluída sem data'
    WHEN progress_percentage < 100 AND completed_at IS NOT NULL THEN 'BUG: Não concluída com data'
    ELSE 'OK'
  END as status
FROM learning_progress
WHERE 
  (progress_percentage >= 100 AND completed_at IS NULL)
  OR
  (progress_percentage < 100 AND completed_at IS NOT NULL)
ORDER BY updated_at DESC
LIMIT 100;


-- ============================================
-- 2. PROGRESSO DETALHADO DE UM USUÁRIO
-- ============================================
-- Substitua 'USER_ID_HERE' pelo ID do usuário

SELECT 
  lc.title as curso,
  lm.title as modulo,
  ll.title as aula,
  lp.progress_percentage,
  lp.started_at,
  lp.completed_at,
  lp.updated_at,
  CASE 
    WHEN lp.progress_percentage >= 100 THEN '✅ Concluída'
    WHEN lp.progress_percentage > 0 THEN '⏳ Em andamento'
    ELSE '⚪ Não iniciada'
  END as status
FROM learning_progress lp
JOIN learning_lessons ll ON lp.lesson_id = ll.id
JOIN learning_modules lm ON ll.module_id = lm.id
JOIN learning_courses lc ON lm.course_id = lc.id
WHERE lp.user_id = 'USER_ID_HERE'
ORDER BY lc.created_at, lm.order_index, ll.order_index;


-- ============================================
-- 3. ESTATÍSTICAS DE CONCLUSÃO POR CURSO
-- ============================================
-- Para um usuário específico

SELECT 
  lc.id as course_id,
  lc.title as curso,
  COUNT(DISTINCT ll.id) as total_aulas,
  COUNT(DISTINCT CASE WHEN lp.progress_percentage >= 100 THEN ll.id END) as aulas_concluidas,
  COUNT(DISTINCT CASE WHEN lp.progress_percentage > 0 AND lp.progress_percentage < 100 THEN ll.id END) as aulas_em_andamento,
  ROUND(
    COUNT(DISTINCT CASE WHEN lp.progress_percentage >= 100 THEN ll.id END) * 100.0 / 
    NULLIF(COUNT(DISTINCT ll.id), 0),
    2
  ) as percentual_conclusao
FROM learning_courses lc
LEFT JOIN learning_modules lm ON lc.id = lm.course_id
LEFT JOIN learning_lessons ll ON lm.id = ll.module_id
LEFT JOIN learning_progress lp ON ll.id = lp.lesson_id 
  AND lp.user_id = 'USER_ID_HERE'
WHERE lc.published = true
GROUP BY lc.id, lc.title
ORDER BY lc.created_at;


-- ============================================
-- 4. ATIVIDADE RECENTE DE CONCLUSÕES
-- ============================================
-- Últimas 50 aulas concluídas

SELECT 
  lp.completed_at,
  p.name as usuario,
  p.email,
  ll.title as aula,
  lm.title as modulo,
  lc.title as curso
FROM learning_progress lp
JOIN profiles p ON lp.user_id = p.id
JOIN learning_lessons ll ON lp.lesson_id = ll.id
JOIN learning_modules lm ON ll.module_id = lm.id
JOIN learning_courses lc ON lm.course_id = lc.id
WHERE lp.progress_percentage >= 100
  AND lp.completed_at IS NOT NULL
ORDER BY lp.completed_at DESC
LIMIT 50;


-- ============================================
-- 5. USUÁRIOS COM MAIS AULAS CONCLUÍDAS
-- ============================================
-- Top 20 usuários mais ativos

SELECT 
  p.name as usuario,
  p.email,
  COUNT(*) as total_aulas_concluidas,
  MIN(lp.completed_at) as primeira_conclusao,
  MAX(lp.completed_at) as ultima_conclusao
FROM learning_progress lp
JOIN profiles p ON lp.user_id = p.id
WHERE lp.progress_percentage >= 100
GROUP BY p.id, p.name, p.email
ORDER BY total_aulas_concluidas DESC
LIMIT 20;


-- ============================================
-- 6. AULAS SEM NENHUMA CONCLUSÃO
-- ============================================
-- Identificar aulas que nunca foram concluídas por ninguém

SELECT 
  lc.title as curso,
  lm.title as modulo,
  ll.title as aula,
  ll.created_at,
  COUNT(lp.id) as total_acessos,
  COUNT(CASE WHEN lp.progress_percentage >= 100 THEN 1 END) as conclusoes
FROM learning_lessons ll
JOIN learning_modules lm ON ll.module_id = lm.id
JOIN learning_courses lc ON lm.course_id = lc.id
LEFT JOIN learning_progress lp ON ll.id = lp.lesson_id
WHERE lc.published = true
GROUP BY ll.id, lc.title, lm.title, ll.title, ll.created_at
HAVING COUNT(CASE WHEN lp.progress_percentage >= 100 THEN 1 END) = 0
ORDER BY ll.created_at DESC;


-- ============================================
-- 7. PERFORMANCE - AULAS MAIS CONCLUÍDAS
-- ============================================
-- Top 20 aulas com mais conclusões

SELECT 
  lc.title as curso,
  lm.title as modulo,
  ll.title as aula,
  COUNT(CASE WHEN lp.progress_percentage >= 100 THEN 1 END) as total_conclusoes,
  COUNT(DISTINCT lp.user_id) as total_usuarios_unicos,
  ROUND(
    COUNT(CASE WHEN lp.progress_percentage >= 100 THEN 1 END) * 100.0 /
    NULLIF(COUNT(DISTINCT lp.user_id), 0),
    2
  ) as taxa_conclusao_percent
FROM learning_lessons ll
JOIN learning_modules lm ON ll.module_id = lm.id
JOIN learning_courses lc ON lm.course_id = lc.id
LEFT JOIN learning_progress lp ON ll.id = lp.lesson_id
WHERE lc.published = true
GROUP BY ll.id, lc.title, lm.title, ll.title
HAVING COUNT(DISTINCT lp.user_id) > 0
ORDER BY total_conclusoes DESC
LIMIT 20;


-- ============================================
-- 8. VERIFICAR INTEGRIDADE DO CONSTRAINT
-- ============================================
-- Testa se o constraint está funcionando corretamente

SELECT 
  constraint_name,
  table_name,
  constraint_type,
  is_deferrable,
  initially_deferred
FROM information_schema.table_constraints
WHERE table_name = 'learning_progress'
  AND constraint_name = 'check_completed_consistency';


-- ============================================
-- 9. ANÁLISE DE TEMPO MÉDIO ENTRE INÍCIO E CONCLUSÃO
-- ============================================
-- Quanto tempo em média leva para concluir uma aula?

SELECT 
  lc.title as curso,
  ll.title as aula,
  COUNT(*) as total_conclusoes,
  AVG(EXTRACT(EPOCH FROM (lp.completed_at - lp.started_at))/3600) as media_horas,
  MIN(EXTRACT(EPOCH FROM (lp.completed_at - lp.started_at))/3600) as min_horas,
  MAX(EXTRACT(EPOCH FROM (lp.completed_at - lp.started_at))/3600) as max_horas
FROM learning_progress lp
JOIN learning_lessons ll ON lp.lesson_id = ll.id
JOIN learning_modules lm ON ll.module_id = lm.id
JOIN learning_courses lc ON lm.course_id = lc.id
WHERE lp.progress_percentage >= 100
  AND lp.started_at IS NOT NULL
  AND lp.completed_at IS NOT NULL
GROUP BY lc.id, lc.title, ll.id, ll.title
HAVING COUNT(*) >= 3  -- Apenas aulas com pelo menos 3 conclusões
ORDER BY media_horas DESC
LIMIT 30;


-- ============================================
-- 10. AULAS INICIADAS MAS NÃO CONCLUÍDAS
-- ============================================
-- Identificar onde usuários estão desistindo

SELECT 
  lc.title as curso,
  lm.title as modulo,
  ll.title as aula,
  COUNT(*) as total_iniciadas_nao_concluidas,
  AVG(EXTRACT(EPOCH FROM (NOW() - lp.started_at))/86400) as dias_desde_inicio_medio
FROM learning_progress lp
JOIN learning_lessons ll ON lp.lesson_id = ll.id
JOIN learning_modules lm ON ll.module_id = lm.id
JOIN learning_courses lc ON lm.course_id = lc.id
WHERE lp.progress_percentage > 0 
  AND lp.progress_percentage < 100
  AND lp.started_at < NOW() - INTERVAL '7 days'  -- Iniciadas há mais de 7 dias
GROUP BY lc.id, lc.title, lm.id, lm.title, ll.id, ll.title
ORDER BY total_iniciadas_nao_concluidas DESC
LIMIT 30;
