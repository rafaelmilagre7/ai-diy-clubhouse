-- Processar dados da planilha manualmente (versão simplificada)
-- Criar organizações e associar usuários conforme planilha

DO $$
DECLARE
  master_emails text[] := ARRAY[
    'mikael.fontes@hotmail.com',
    'flavio.spanhol@gmail.com', 
    'diogo@herois.digital',
    'contato@souzaempreendimentos.com.br',
    'suporte@instacode.dev',
    'valtergrillo@gmail.com',
    'bruno@anecotecconstrucoes.com.br',
    'dukinha.music@gmail.com',
    'tiago@aaembalagens.com.br',
    'luisfelipe.ccp@gmail.com'
  ];
  
  master_names text[] := ARRAY[
    'Mikael Fontes',
    'Flavio Spanhol',
    'Diogo',
    'Souza Empreendimentos', 
    'InstaCode',
    'Valter Grillo',
    'Bruno Anecotec',
    'Dukinha Music',
    'Tiago AA Embalagens',
    'Luis Felipe'
  ];
  
  current_email text;
  current_name text;
  current_user_id uuid;
  current_org_id uuid;
  processed_count integer := 0;
BEGIN
  -- Loop através dos masters
  FOR i IN 1..array_length(master_emails, 1) LOOP
    current_email := master_emails[i];
    current_name := master_names[i];
    
    -- Verificar se o usuário master existe
    SELECT id INTO current_user_id 
    FROM profiles 
    WHERE email = current_email 
    LIMIT 1;
    
    IF current_user_id IS NOT NULL THEN
      -- Marcar como master user
      UPDATE profiles 
      SET is_master_user = true, 
          updated_at = now()
      WHERE id = current_user_id;
      
      -- Verificar se já existe organização para este master
      SELECT id INTO current_org_id 
      FROM organizations 
      WHERE organizations.master_user_id = current_user_id 
      LIMIT 1;
      
      -- Se não existe, criar organização
      IF current_org_id IS NULL THEN
        INSERT INTO organizations (name, master_user_id, created_at, updated_at)
        VALUES (current_name, current_user_id, now(), now())
        RETURNING id INTO current_org_id;
      END IF;
      
      -- Associar o master user à organização
      UPDATE profiles 
      SET organization_id = current_org_id,
          updated_at = now()
      WHERE id = current_user_id;
      
      -- Buscar outros usuários com mesmo domínio (exceto o master)
      -- e associar até 4 membros adicionais (total de 5 por equipe)
      UPDATE profiles 
      SET organization_id = current_org_id,
          updated_at = now()
      WHERE email LIKE '%' || split_part(current_email, '@', 2)
        AND id != current_user_id
        AND organization_id IS NULL
        AND id IN (
          SELECT id 
          FROM profiles 
          WHERE email LIKE '%' || split_part(current_email, '@', 2)
            AND id != current_user_id
            AND organization_id IS NULL
          LIMIT 4  -- 4 membros + 1 master = 5 total
        );
      
      processed_count := processed_count + 1;
      
      RAISE NOTICE 'Processado master: % (%) - Organização: %', current_name, current_email, current_org_id;
    ELSE
      RAISE NOTICE 'Master não encontrado: % (%)', current_name, current_email;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Processamento concluído! % masters processados', processed_count;
  
  -- Mostrar resumo final
  RAISE NOTICE 'Resumo:';
  RAISE NOTICE '- Masters criados: %', (SELECT COUNT(*) FROM profiles WHERE is_master_user = true);
  RAISE NOTICE '- Organizações criadas: %', (SELECT COUNT(*) FROM organizations);
  RAISE NOTICE '- Usuários em organizações: %', (SELECT COUNT(*) FROM profiles WHERE organization_id IS NOT NULL);
  RAISE NOTICE '- Usuários individuais: %', (SELECT COUNT(*) FROM profiles WHERE organization_id IS NULL);
END $$;