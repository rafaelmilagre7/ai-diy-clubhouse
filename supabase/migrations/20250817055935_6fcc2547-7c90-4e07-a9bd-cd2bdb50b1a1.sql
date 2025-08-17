-- Remover política perigosa que permite acesso total às avaliações
DROP POLICY IF EXISTS "Users can view all solution ratings" ON public.solution_ratings;

-- Política restritiva: usuários podem ver apenas suas próprias avaliações
CREATE POLICY "Users can view own ratings" 
ON public.solution_ratings 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para admins: podem ver todas as avaliações para análise
CREATE POLICY "Admins can view all ratings" 
ON public.solution_ratings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  )
);

-- Política para deletar: usuários podem deletar apenas suas próprias avaliações  
CREATE POLICY "Users can delete own ratings" 
ON public.solution_ratings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Garantir que admins possam gerenciar avaliações (moderação)
CREATE POLICY "Admins can manage all ratings" 
ON public.solution_ratings 
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  )
);

-- Log de segurança: registrar correção da vulnerabilidade
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'security_fix',
  'solution_ratings_rls_hardening',
  jsonb_build_object(
    'vulnerability', 'solution_ratings_public_access',
    'fix', 'restricted_rls_policies_implemented',
    'timestamp', now(),
    'impact', 'critical_data_exposure_prevented'
  ),
  'critical'
);