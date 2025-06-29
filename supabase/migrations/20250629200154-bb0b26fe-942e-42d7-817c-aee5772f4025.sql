
-- MIGRAÇÃO: Limpeza do banco de dados para sincronização com frontend
-- FASE 1: Backup de segurança das tabelas que serão removidas
-- FASE 2: Remoção de tabelas órfãs e conflitantes
-- FASE 3: Ajustes nos tipos e constraints

-- =============================================================================
-- FASE 1: BACKUP DE SEGURANÇA
-- =============================================================================

-- Backup das tabelas que serão removidas (caso necessário recuperar)
CREATE TABLE IF NOT EXISTS cleanup_backup_solutions AS SELECT * FROM solutions;
CREATE TABLE IF NOT EXISTS cleanup_backup_modules AS SELECT * FROM modules;
CREATE TABLE IF NOT EXISTS cleanup_backup_progress AS SELECT * FROM progress;
CREATE TABLE IF NOT EXISTS cleanup_backup_forum_topics AS SELECT * FROM forum_topics;
CREATE TABLE IF NOT EXISTS cleanup_backup_forum_posts AS SELECT * FROM forum_posts;
CREATE TABLE IF NOT EXISTS cleanup_backup_suggestions AS SELECT * FROM suggestions;
CREATE TABLE IF NOT EXISTS cleanup_backup_implementation_trails AS SELECT * FROM implementation_trails;

-- =============================================================================
-- FASE 2: REMOÇÃO DE TABELAS ÓRFÃS E CONFLITANTES
-- =============================================================================

-- Remover tabelas do sistema de Solutions (conflita com Learning)
DROP TABLE IF EXISTS solution_comments CASCADE;
DROP TABLE IF EXISTS solution_tools_reference CASCADE;
DROP TABLE IF EXISTS solution_certificates CASCADE;
DROP TABLE IF EXISTS user_checklist CASCADE;
DROP TABLE IF EXISTS modules CASCADE; -- Conflita com learning_modules
DROP TABLE IF EXISTS progress CASCADE; -- Conflita com learning_progress
DROP TABLE IF EXISTS solutions CASCADE;

-- Remover tabelas do sistema de Forum/Community (problemático)
DROP TABLE IF EXISTS forum_reactions CASCADE;
DROP TABLE IF EXISTS forum_mentions CASCADE;
DROP TABLE IF EXISTS forum_notifications CASCADE;
DROP TABLE IF EXISTS forum_posts CASCADE;
DROP TABLE IF EXISTS forum_topics CASCADE;
DROP TABLE IF EXISTS forum_categories CASCADE;
DROP TABLE IF EXISTS community_reports CASCADE;

-- Remover sistema de Suggestions (não utilizado pelo frontend)
DROP TABLE IF EXISTS suggestion_votes CASCADE;
DROP TABLE IF EXISTS suggestions CASCADE;

-- Remover sistema de Implementation Trails (órfão)
DROP TABLE IF EXISTS implementation_trails CASCADE;
DROP TABLE IF EXISTS implementation_checkpoints CASCADE;
DROP TABLE IF EXISTS implementation_profiles CASCADE;

-- Remover tabelas de onboarding antigas (há duplicação)
DROP TABLE IF EXISTS onboarding CASCADE;
DROP TABLE IF EXISTS quick_onboarding CASCADE;
DROP TABLE IF EXISTS onboarding_progress CASCADE;

-- Remover outras tabelas órfãs
DROP TABLE IF EXISTS network_matches CASCADE;
DROP TABLE IF EXISTS connection_recommendations CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;

-- =============================================================================
-- FASE 3: LIMPEZA DE FUNCTIONS ÓRFÃS
-- =============================================================================

-- Remover functions relacionadas às tabelas removidas
DROP FUNCTION IF EXISTS increment_suggestion_upvote(uuid);
DROP FUNCTION IF EXISTS increment_suggestion_downvote(uuid);
DROP FUNCTION IF EXISTS decrement_suggestion_upvote(uuid);
DROP FUNCTION IF EXISTS decrement_suggestion_downvote(uuid);
DROP FUNCTION IF EXISTS handle_suggestion_vote();
DROP FUNCTION IF EXISTS update_implementation_trails_updated_at();
DROP FUNCTION IF EXISTS backup_all_onboarding_data();
DROP FUNCTION IF EXISTS normalize_solution_category();
DROP FUNCTION IF EXISTS check_solution_certificate_eligibility(uuid, uuid);

-- Functions do forum que não são mais necessárias
DROP FUNCTION IF EXISTS increment_topic_views(uuid);
DROP FUNCTION IF EXISTS increment_topic_replies(uuid);
DROP FUNCTION IF EXISTS update_topic_reply_count();
DROP FUNCTION IF EXISTS mark_topic_as_solved(uuid, uuid);
DROP FUNCTION IF EXISTS mark_topic_solved(uuid, uuid);
DROP FUNCTION IF EXISTS unmark_topic_as_solved(uuid);
DROP FUNCTION IF EXISTS deleteforumpost(uuid);
DROP FUNCTION IF EXISTS create_forum_reply_notification();
DROP FUNCTION IF EXISTS update_forum_last_activity();
DROP FUNCTION IF EXISTS update_forum_timestamp();

-- =============================================================================
-- FASE 4: OTIMIZAÇÃO E LIMPEZA FINAL
-- =============================================================================

-- Remover tipos ENUM órfãos
DROP TYPE IF EXISTS solution_category CASCADE;
DROP TYPE IF EXISTS forum_reaction_type CASCADE;
DROP TYPE IF EXISTS referral_type CASCADE;

-- Limpeza da tabela analytics (remover eventos de sistemas removidos)
DELETE FROM analytics WHERE event_type IN (
  'solution_started', 'solution_completed', 'module_completed',
  'forum_post_created', 'forum_topic_created', 'suggestion_created'
);

-- Limpeza da tabela audit_logs (remover logs de sistemas removidos)
DELETE FROM audit_logs WHERE event_type IN (
  'solution_access', 'forum_moderation', 'suggestion_vote'
);

-- =============================================================================
-- FASE 5: VERIFICAÇÃO FINAL
-- =============================================================================

-- Listar tabelas restantes para verificação
SELECT 
  schemaname, 
  tablename,
  CASE 
    WHEN tablename LIKE 'learning_%' THEN '✅ LEARNING SYSTEM'
    WHEN tablename IN ('profiles', 'user_roles', 'invites', 'analytics') THEN '✅ ADMIN SYSTEM'
    WHEN tablename IN ('tools', 'events', 'benefits', 'benefit_access_control') THEN '✅ MEMBER SYSTEM'
    WHEN tablename LIKE 'cleanup_backup_%' THEN '📦 BACKUP'
    ELSE '⚠️ VERIFICAR'
  END as system_category
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY system_category, tablename;

-- Verificar se não há referências quebradas
SELECT conname, conrelid::regclass, confrelid::regclass 
FROM pg_constraint 
WHERE contype = 'f' 
AND (conrelid::regclass::text LIKE '%solution%' 
     OR conrelid::regclass::text LIKE '%forum%' 
     OR confrelid::regclass::text LIKE '%solution%' 
     OR confrelid::regclass::text LIKE '%forum%');
