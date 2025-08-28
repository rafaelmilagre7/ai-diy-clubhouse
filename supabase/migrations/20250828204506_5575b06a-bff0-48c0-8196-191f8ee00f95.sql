-- Atualizar função create_invite_batch para retornar detalhes individuais
CREATE OR REPLACE FUNCTION public.create_invite_batch(
  p_invites jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_invite jsonb;
  v_invite_id uuid;
  v_token text;
  v_result jsonb := '{"created": [], "failed": [], "stats": {"total": 0, "successful": 0, "failed": 0}}'::jsonb;
  v_stats jsonb := '{"total": 0, "successful": 0, "failed": 0}'::jsonb;
  v_created_invites jsonb := '[]'::jsonb;
  v_failed_invites jsonb := '[]'::jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado - apenas administradores'
    );
  END IF;

  -- Processar cada convite
  FOR v_invite IN SELECT * FROM jsonb_array_elements(p_invites)
  LOOP
    BEGIN
      -- Gerar token único
      v_token := public.generate_referral_token();
      
      -- Inserir convite
      INSERT INTO public.invites (
        email,
        role_id,
        created_by,
        token,
        whatsapp_number,
        notes,
        preferred_channel,
        expires_at
      ) VALUES (
        v_invite->>'email',
        (v_invite->>'role_id')::uuid,
        auth.uid(),
        v_token,
        v_invite->>'whatsapp_number',
        v_invite->>'notes',
        COALESCE(v_invite->>'preferred_channel', 'email'),
        now() + interval '30 days'
      )
      RETURNING id INTO v_invite_id;
      
      -- Adicionar aos criados com sucesso
      v_created_invites := v_created_invites || jsonb_build_object(
        'invite_id', v_invite_id,
        'token', v_token,
        'email', v_invite->>'email',
        'role_id', v_invite->>'role_id',
        'status', 'created'
      );
      
      -- Incrementar contador de sucesso
      v_stats := jsonb_set(v_stats, '{successful}', ((v_stats->>'successful')::int + 1)::text::jsonb);
      
    EXCEPTION
      WHEN OTHERS THEN
        -- Adicionar aos falharam
        v_failed_invites := v_failed_invites || jsonb_build_object(
          'email', v_invite->>'email',
          'error', SQLERRM,
          'status', 'failed'
        );
        
        -- Incrementar contador de falhas
        v_stats := jsonb_set(v_stats, '{failed}', ((v_stats->>'failed')::int + 1)::text::jsonb);
    END;
    
    -- Incrementar total
    v_stats := jsonb_set(v_stats, '{total}', ((v_stats->>'total')::int + 1)::text::jsonb);
  END LOOP;

  -- Montar resultado final
  v_result := jsonb_build_object(
    'success', true,
    'created', v_created_invites,
    'failed', v_failed_invites,
    'stats', v_stats
  );

  RETURN v_result;
END;
$function$;