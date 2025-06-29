
-- FASE 1: Adicionar campo ai_assistant_id na tabela learning_lessons
ALTER TABLE learning_lessons ADD COLUMN IF NOT EXISTS ai_assistant_id VARCHAR(255);

-- Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_learning_lessons_ai_assistant_id ON learning_lessons(ai_assistant_id);

-- FASE 2: Criar view para courses com estatísticas
CREATE OR REPLACE VIEW learning_courses_with_stats AS
SELECT 
  lc.*,
  COALESCE(module_counts.module_count, 0) as module_count,
  COALESCE(lesson_counts.lesson_count, 0) as lesson_count,
  CASE WHEN cac.course_id IS NOT NULL THEN true ELSE false END as is_restricted
FROM learning_courses lc
LEFT JOIN (
  SELECT course_id, COUNT(*) as module_count 
  FROM learning_modules 
  WHERE published = true
  GROUP BY course_id
) module_counts ON lc.id = module_counts.course_id
LEFT JOIN (
  SELECT lm.course_id, COUNT(ll.id) as lesson_count
  FROM learning_modules lm
  LEFT JOIN learning_lessons ll ON lm.id = ll.module_id
  WHERE lm.published = true AND ll.published = true
  GROUP BY lm.course_id
) lesson_counts ON lc.id = lesson_counts.course_id
LEFT JOIN course_access_control cac ON lc.id = cac.course_id;

-- FASE 3: Criar view para lessons com dados relacionais
CREATE OR REPLACE VIEW learning_lessons_with_relations AS
SELECT 
  ll.*,
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
  COALESCE(video_data.videos, '[]'::json) as videos,
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

-- FASE 4: Criar índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_learning_modules_course_id_published ON learning_modules(course_id, published);
CREATE INDEX IF NOT EXISTS idx_learning_lessons_module_id_published ON learning_lessons(module_id, published);
CREATE INDEX IF NOT EXISTS idx_learning_lesson_videos_lesson_id_order ON learning_lesson_videos(lesson_id, order_index);
CREATE INDEX IF NOT EXISTS idx_learning_resources_lesson_id_order ON learning_resources(lesson_id, order_index);
