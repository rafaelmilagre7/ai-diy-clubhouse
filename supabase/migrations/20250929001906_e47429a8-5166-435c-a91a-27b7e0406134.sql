-- Processar dados da planilha manualmente (versão final corrigida)

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
  new_organization_id uuid;
  processed_count integer := 0;
  members_added integer := 0;
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
      RAISE NOTICE 'Processando master: % (%)', current_name, current_email;
      
      -- Marcar como master user
      UPDATE profiles 
      SET is_master_user = true, 
          updated_at = now()
      WHERE id = current_user_id;
      
      -- Criar organização
      INSERT INTO organizations (name, master_user_id, created_at, updated_at)
      VALUES (current_name, current_user_id, now(), now())
      RETURNING id INTO new_organization_id;
      
      -- Associar o master user à organização
      UPDATE profiles 
      SET organization_id = new_organization_id,
          updated_at = now()
      WHERE id = current_user_id;
      
      -- Contar quantos membros adicionais foram associados por domínio
      WITH domain_members AS (
        UPDATE profiles 
        SET organization_id = new_organization_id,
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
          )
        RETURNING id
      )
      SELECT COUNT(*) INTO members_added FROM domain_members;
      
      processed_count := processed_count + 1;
      
      RAISE NOTICE '✅ Master processado: % - Organização ID: % - Membros adicionados: %', 
        current_name, new_organization_id, members_added;
    ELSE
      RAISE NOTICE '❌ Master não encontrado: % (%)', current_name, current_email;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Processamento concluído! % masters processados de %', processed_count, array_length(master_emails, 1);
  RAISE NOTICE '';
  RAISE NOTICE '📊 Resumo final:';
  RAISE NOTICE '- Masters criados: %', (SELECT COUNT(*) FROM profiles WHERE is_master_user = true);
  RAISE NOTICE '- Organizações criadas: %', (SELECT COUNT(*) FROM organizations);
  RAISE NOTICE '- Usuários em organizações: %', (SELECT COUNT(*) FROM profiles WHERE organization_id IS NOT NULL);
  RAISE NOTICE '- Usuários individuais: %', (SELECT COUNT(*) FROM profiles WHERE organization_id IS NULL);
END $$;