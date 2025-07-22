-- Corrigir funções com search_path mutable (segurança)
-- Atualizar as principais funções para ter search_path fixo

-- 1. Função para verificar se usuário é admin (corrigir search_path)
CREATE OR REPLACE FUNCTION public.is_user_admin(target_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = target_user_id 
    AND ur.name = 'admin'
  ) OR EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.id = target_user_id 
    AND p.email LIKE '%@viverdeia.ai'
  );
$function$;

-- 2. Função para validar acesso a conteúdo de aprendizado
CREATE OR REPLACE FUNCTION public.can_access_learning_content(target_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = target_user_id 
    AND ur.name IN ('admin', 'membro_club', 'formacao')
  );
$function$;

-- 3. Criar função para rate limiting de comentários
CREATE OR REPLACE FUNCTION public.check_comment_rate_limit(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  comment_count integer;
BEGIN
  -- Verificar quantos comentários o usuário fez na última hora
  SELECT COUNT(*) INTO comment_count
  FROM public.learning_comments
  WHERE user_id = user_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Permitir até 10 comentários por hora
  RETURN comment_count < 10;
END;
$function$;

-- 4. Criar função para rate limiting de avaliações NPS
CREATE OR REPLACE FUNCTION public.check_nps_rate_limit(user_id uuid, lesson_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  nps_count integer;
BEGIN
  -- Verificar se já avaliou esta aula hoje
  SELECT COUNT(*) INTO nps_count
  FROM public.learning_lesson_nps
  WHERE user_id = user_id
    AND lesson_id = lesson_id
    AND created_at > CURRENT_DATE;
  
  -- Permitir apenas 1 avaliação por aula por dia
  RETURN nps_count = 0;
END;
$function$;

-- 5. Criar função para log de auditoria melhorado
CREATE OR REPLACE FUNCTION public.log_learning_action(
  p_action text,
  p_resource_type text,
  p_resource_id uuid,
  p_details jsonb DEFAULT '{}'::jsonb
)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity,
    timestamp
  ) VALUES (
    auth.uid(),
    'learning_action',
    p_action,
    p_resource_id::text,
    p_details || jsonb_build_object(
      'resource_type', p_resource_type,
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    ),
    'info',
    NOW()
  );
END;
$function$;

-- 6. Criar função para backup automático de progresso
CREATE OR REPLACE FUNCTION public.backup_user_learning_progress(target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  backup_data jsonb;
  backup_id uuid;
BEGIN
  -- Coletar dados de progresso do usuário
  SELECT jsonb_build_object(
    'user_id', target_user_id,
    'progress', COALESCE(array_agg(DISTINCT to_jsonb(lp.*)), ARRAY[]::jsonb[]),
    'comments', COALESCE(array_agg(DISTINCT to_jsonb(lc.*)), ARRAY[]::jsonb[]),
    'nps_ratings', COALESCE(array_agg(DISTINCT to_jsonb(ln.*)), ARRAY[]::jsonb[]),
    'certificates', COALESCE(array_agg(DISTINCT to_jsonb(cert.*)), ARRAY[]::jsonb[]),
    'backup_date', NOW()
  ) INTO backup_data
  FROM public.profiles p
  LEFT JOIN public.learning_progress lp ON p.id = lp.user_id
  LEFT JOIN public.learning_comments lc ON p.id = lc.user_id
  LEFT JOIN public.learning_lesson_nps ln ON p.id = ln.user_id
  LEFT JOIN public.learning_certificates cert ON p.id = cert.user_id
  WHERE p.id = target_user_id
  GROUP BY p.id;
  
  -- Salvar backup
  INSERT INTO public.analytics_backups (
    table_name,
    backup_data,
    backup_reason,
    record_count
  ) VALUES (
    'learning_progress_backup',
    backup_data,
    'Backup automático de progresso de aprendizado',
    1
  ) RETURNING id INTO backup_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'backup_id', backup_id,
    'user_id', target_user_id,
    'backup_date', NOW()
  );
END;
$function$;

-- 7. Criar função para validação de progresso de aula
CREATE OR REPLACE FUNCTION public.validate_lesson_progress(
  p_user_id uuid,
  p_lesson_id uuid,
  p_progress_data jsonb
)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  lesson_exists boolean;
  user_has_access boolean;
BEGIN
  -- Verificar se a aula existe e está publicada
  SELECT EXISTS (
    SELECT 1 
    FROM public.learning_lessons ll
    INNER JOIN public.learning_modules lm ON ll.module_id = lm.id
    INNER JOIN public.learning_courses lc ON lm.course_id = lc.id
    WHERE ll.id = p_lesson_id 
    AND ll.published = true
    AND lm.published = true
    AND lc.published = true
  ) INTO lesson_exists;
  
  IF NOT lesson_exists THEN
    RETURN false;
  END IF;
  
  -- Verificar se o usuário tem acesso ao conteúdo
  SELECT public.can_access_learning_content(p_user_id) INTO user_has_access;
  
  RETURN user_has_access;
END;
$function$;

-- 8. Criar trigger para backup automático quando progresso é atualizado
CREATE OR REPLACE FUNCTION public.trigger_learning_progress_backup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Fazer backup apenas uma vez por dia por usuário
  IF NOT EXISTS (
    SELECT 1 FROM public.analytics_backups 
    WHERE table_name = 'learning_progress_backup'
    AND backup_data->>'user_id' = NEW.user_id::text
    AND created_at > CURRENT_DATE
  ) THEN
    PERFORM public.backup_user_learning_progress(NEW.user_id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger para backup automático
DROP TRIGGER IF EXISTS learning_progress_backup_trigger ON public.learning_progress;
CREATE TRIGGER learning_progress_backup_trigger
  AFTER INSERT OR UPDATE ON public.learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_learning_progress_backup();

-- 9. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_lesson ON public.learning_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_learning_comments_lesson_created ON public.learning_comments(lesson_id, created_at);
CREATE INDEX IF NOT EXISTS idx_learning_lesson_nps_lesson_created ON public.learning_lesson_nps(lesson_id, created_at);
CREATE INDEX IF NOT EXISTS idx_learning_lessons_published ON public.learning_lessons(published, module_id);
CREATE INDEX IF NOT EXISTS idx_learning_modules_published ON public.learning_modules(published, course_id);
CREATE INDEX IF NOT EXISTS idx_learning_courses_published ON public.learning_courses(published);

-- 10. Atualizar políticas RLS para usar as novas funções
DROP POLICY IF EXISTS "learning_lessons_secure_access" ON public.learning_lessons;
CREATE POLICY "learning_lessons_secure_access" 
ON public.learning_lessons 
FOR SELECT 
USING (
  published = true AND 
  public.can_access_learning_content(auth.uid())
);

DROP POLICY IF EXISTS "learning_progress_secure_access" ON public.learning_progress;
CREATE POLICY "learning_progress_secure_access" 
ON public.learning_progress 
FOR ALL 
USING (user_id = auth.uid()) 
WITH CHECK (
  user_id = auth.uid() AND 
  public.validate_lesson_progress(auth.uid(), lesson_id, progress_data)
);