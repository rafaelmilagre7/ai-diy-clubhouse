
-- Criar as funções RPC específicas para votação de sugestões
-- Estas funções são wrappers das funções genéricas increment/decrement já existentes

-- Função para incrementar upvotes
CREATE OR REPLACE FUNCTION public.increment_suggestion_upvote(suggestion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.increment(suggestion_id, 'suggestions', 'upvotes');
END;
$$;

-- Função para incrementar downvotes
CREATE OR REPLACE FUNCTION public.increment_suggestion_downvote(suggestion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.increment(suggestion_id, 'suggestions', 'downvotes');
END;
$$;

-- Função para decrementar upvotes
CREATE OR REPLACE FUNCTION public.decrement_suggestion_upvote(suggestion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.decrement(suggestion_id, 'suggestions', 'upvotes');
END;
$$;

-- Função para decrementar downvotes
CREATE OR REPLACE FUNCTION public.decrement_suggestion_downvote(suggestion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.decrement(suggestion_id, 'suggestions', 'downvotes');
END;
$$;

-- Log da criação das funções
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details
) VALUES (
  NULL,
  'system_event',
  'suggestion_voting_functions_created',
  jsonb_build_object(
    'functions_created', ARRAY[
      'increment_suggestion_upvote',
      'increment_suggestion_downvote', 
      'decrement_suggestion_upvote',
      'decrement_suggestion_downvote'
    ],
    'purpose', 'Corrigir sistema de votação de sugestões',
    'uses_generic_functions', true,
    'frontend_compatibility', true,
    'created_at', NOW()
  )
);
