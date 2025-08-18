-- Habilitar RLS na tabela network_matches se não estiver habilitado
ALTER TABLE public.network_matches ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view their matches" ON public.network_matches;
DROP POLICY IF EXISTS "Users can insert their matches" ON public.network_matches;
DROP POLICY IF EXISTS "Admins can manage all matches" ON public.network_matches;

-- Criar políticas mais específicas para network_matches
CREATE POLICY "Users can view their own matches" ON public.network_matches
  FOR SELECT USING (
    user_id = auth.uid() OR 
    matched_user_id = auth.uid()
  );

CREATE POLICY "System can insert matches" ON public.network_matches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own matches" ON public.network_matches
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    matched_user_id = auth.uid()
  );

CREATE POLICY "Admins have full access to matches" ON public.network_matches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );