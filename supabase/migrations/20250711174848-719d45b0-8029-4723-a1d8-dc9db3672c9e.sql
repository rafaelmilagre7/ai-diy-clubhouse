-- Criar função para validar força da senha
CREATE OR REPLACE FUNCTION public.validate_user_password(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  checks jsonb;
  score integer;
  strength text;
BEGIN
  -- Verificações de segurança da senha
  checks := jsonb_build_object(
    'length', length(password) >= 8,
    'uppercase', password ~ '[A-Z]',
    'lowercase', password ~ '[a-z]',
    'number', password ~ '[0-9]',
    'special', password ~ '[!@#$%^&*()_+\-=\[\]{};'':"\\|,.<>\/?]'
  );
  
  -- Calcular pontuação
  score := (
    CASE WHEN checks->>'length' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'uppercase' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'lowercase' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'number' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'special' = 'true' THEN 1 ELSE 0 END
  );
  
  -- Determinar força
  strength := CASE 
    WHEN score < 3 THEN 'weak'
    WHEN score < 5 THEN 'medium'
    ELSE 'strong'
  END;
  
  RETURN jsonb_build_object(
    'checks', checks,
    'score', score,
    'strength', strength,
    'is_valid', score >= 4
  );
END;
$$;

-- Adicionar trigger para registrar tentativas de criação de conta
CREATE OR REPLACE FUNCTION public.log_account_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log da criação de conta para auditoria
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details
  ) VALUES (
    NEW.id,
    'account_creation',
    'user_signup',
    jsonb_build_object(
      'email', NEW.email,
      'created_at', NEW.created_at,
      'invite_token', NEW.raw_user_meta_data->>'invite_token'
    )
  );
  
  RETURN NEW;
END;
$$;

-- Criar trigger para log de criação de contas
DROP TRIGGER IF EXISTS on_account_creation ON auth.users;
CREATE TRIGGER on_account_creation
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.log_account_creation();