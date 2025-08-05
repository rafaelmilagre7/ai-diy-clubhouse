-- Add updated_at column to learning_lesson_videos table
ALTER TABLE learning_lesson_videos 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create trigger to update updated_at automatically
CREATE TRIGGER update_learning_lesson_videos_updated_at
    BEFORE UPDATE ON learning_lesson_videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();