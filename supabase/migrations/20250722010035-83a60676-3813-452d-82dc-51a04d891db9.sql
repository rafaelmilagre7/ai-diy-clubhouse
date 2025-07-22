-- Criar tabela para avaliar soluções com NPS
CREATE TABLE IF NOT EXISTS public.solution_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 10),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(solution_id, user_id)
);

-- Enable RLS
ALTER TABLE public.solution_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all solution ratings"
ON public.solution_ratings
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own ratings"
ON public.solution_ratings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
ON public.solution_ratings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_solution_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_solution_ratings_updated_at
  BEFORE UPDATE ON public.solution_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_solution_ratings_updated_at();