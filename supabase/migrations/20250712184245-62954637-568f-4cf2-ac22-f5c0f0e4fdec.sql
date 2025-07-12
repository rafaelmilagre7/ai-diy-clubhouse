-- Adicionar foreign keys para a tabela network_matches
ALTER TABLE public.network_matches
ADD CONSTRAINT network_matches_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.network_matches
ADD CONSTRAINT network_matches_matched_user_id_fkey 
FOREIGN KEY (matched_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_network_matches_user_id ON public.network_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_network_matches_matched_user_id ON public.network_matches(matched_user_id);
CREATE INDEX IF NOT EXISTS idx_network_matches_status ON public.network_matches(status);
CREATE INDEX IF NOT EXISTS idx_network_matches_month_year ON public.network_matches(month_year);