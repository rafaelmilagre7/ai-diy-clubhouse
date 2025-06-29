
-- FASE 1: Corrigir view learning_courses_with_stats para garantir compatibilidade de tipos
DROP VIEW IF EXISTS learning_courses_with_stats;
CREATE VIEW learning_courses_with_stats AS
SELECT 
  lc.id,
  lc.title,
  lc.description,
  lc.cover_image_url,
  lc.slug,
  lc.published,
  lc.created_at,
  lc.updated_at,
  lc.order_index,
  lc.created_by,
  COALESCE(module_counts.module_count, 0)::integer as module_count,
  COALESCE(lesson_counts.lesson_count, 0)::integer as lesson_count,
  CASE WHEN cac.course_id IS NOT NULL THEN true ELSE false END as is_restricted
FROM learning_courses lc
LEFT JOIN (
  SELECT course_id, COUNT(*)::integer as module_count 
  FROM learning_modules 
  WHERE published = true
  GROUP BY course_id
) module_counts ON lc.id = module_counts.course_id
LEFT JOIN (
  SELECT lm.course_id, COUNT(ll.id)::integer as lesson_count
  FROM learning_modules lm
  LEFT JOIN learning_lessons ll ON lm.id = ll.module_id
  WHERE lm.published = true AND ll.published = true
  GROUP BY lm.course_id
) lesson_counts ON lc.id = lesson_counts.course_id
LEFT JOIN course_access_control cac ON lc.id = cac.course_id;

-- FASE 2: Corrigir view learning_lessons_with_relations para incluir dados do módulo
DROP VIEW IF EXISTS learning_lessons_with_relations;
CREATE VIEW learning_lessons_with_relations AS
SELECT 
  ll.id,
  ll.title,
  ll.description,
  ll.cover_image_url,
  ll.module_id,
  ll.content,
  ll.order_index,
  ll.ai_assistant_enabled,
  ll.ai_assistant_prompt,
  ll.ai_assistant_id,
  ll.published,
  ll.difficulty_level,
  ll.created_at,
  ll.updated_at,
  ll.estimated_time_minutes,
  -- Dados do módulo como JSON
  json_build_object(
    'id', lm.id,
    'title', lm.title,
    'description', lm.description,
    'course_id', lm.course_id,
    'order_index', lm.order_index,
    'published', lm.published,
    'created_at', lm.created_at,
    'updated_at', lm.updated_at,
    'cover_image_url', lm.cover_image_url
  ) as module,
  -- Vídeos como JSON array
  COALESCE(video_data.videos, '[]'::json) as videos,
  -- Recursos como JSON array
  COALESCE(resource_data.resources, '[]'::json) as resources
FROM learning_lessons ll
LEFT JOIN learning_modules lm ON ll.module_id = lm.id
LEFT JOIN (
  SELECT 
    lesson_id,
    json_agg(
      json_build_object(
        'id', id,
        'title', title,
        'url', url,
        'video_type', video_type,
        'duration_seconds', duration_seconds,
        'thumbnail_url', thumbnail_url,
        'video_id', video_id,
        'order_index', order_index,
        'description', description
      ) ORDER BY order_index
    ) as videos
  FROM learning_lesson_videos
  GROUP BY lesson_id
) video_data ON ll.id = video_data.lesson_id
LEFT JOIN (
  SELECT 
    lesson_id,
    json_agg(
      json_build_object(
        'id', id,
        'name', name,
        'file_url', file_url,
        'file_type', file_type,
        'file_size_bytes', file_size_bytes,
        'description', description,
        'order_index', order_index
      ) ORDER BY order_index
    ) as resources
  FROM learning_resources
  GROUP BY lesson_id
) resource_data ON ll.id = resource_data.lesson_id;

-- FASE 3: Criar function para buscar cursos com estatísticas
CREATE OR REPLACE FUNCTION get_courses_with_stats()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  cover_image_url text,
  slug text,
  published boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  order_index integer,
  created_by uuid,
  module_count integer,
  lesson_count integer,
  is_restricted boolean
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM learning_courses_with_stats ORDER BY order_index;
$$;

-- FASE 4: Criar function para buscar lessons com dados relacionais
CREATE OR REPLACE FUNCTION get_lessons_with_relations(p_course_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  cover_image_url text,
  module_id uuid,
  content jsonb,
  order_index integer,
  ai_assistant_enabled boolean,
  ai_assistant_prompt text,
  ai_assistant_id varchar,
  published boolean,
  difficulty_level text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  estimated_time_minutes integer,
  module json,
  videos json,
  resources json
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM learning_lessons_with_relations
  WHERE p_course_id IS NULL OR module->>'course_id' = p_course_id::text
  ORDER BY (module->>'order_index')::integer, order_index;
$$;
