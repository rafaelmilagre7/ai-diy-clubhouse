-- Corrigir constraint de match_type para aceitar valores válidos
ALTER TABLE public.network_matches 
DROP CONSTRAINT IF EXISTS network_matches_match_type_check;

ALTER TABLE public.network_matches 
ADD CONSTRAINT network_matches_match_type_check 
CHECK (match_type IN ('customer', 'supplier', 'partner', 'mentor', 'ai_generated', 'strategic'));

-- Limpar matches inválidos existentes se houver
DELETE FROM public.network_matches WHERE match_type NOT IN ('customer', 'supplier', 'partner', 'mentor', 'ai_generated', 'strategic');