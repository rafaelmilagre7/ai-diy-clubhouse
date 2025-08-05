-- Criar índices otimizados para as queries de learning
CREATE INDEX IF NOT EXISTS idx_learning_lessons_module_order 
ON learning_lessons(module_id, order_index, title);

CREATE INDEX IF NOT EXISTS idx_learning_modules_course_order 
ON learning_modules(course_id, order_index, title);

CREATE INDEX IF NOT EXISTS idx_learning_lesson_videos_lesson_order 
ON learning_lesson_videos(lesson_id, order_index);

CREATE INDEX IF NOT EXISTS idx_learning_resources_lesson_order 
ON learning_resources(lesson_id, order_index);

-- Otimizar query de estatísticas
CREATE INDEX IF NOT EXISTS idx_learning_lessons_published_module 
ON learning_lessons(published, module_id) 
WHERE published = true;