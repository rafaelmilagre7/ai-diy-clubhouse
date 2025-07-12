-- Adicionar foreign key entre learning_lesson_nps e profiles
ALTER TABLE learning_lesson_nps 
ADD CONSTRAINT fk_learning_lesson_nps_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;