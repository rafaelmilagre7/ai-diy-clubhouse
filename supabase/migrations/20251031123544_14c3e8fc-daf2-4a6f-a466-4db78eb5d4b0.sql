-- Adicionar policy para permitir visualizar perfis de autores na comunidade
CREATE POLICY "profiles_community_authors_visible"
ON profiles
FOR SELECT
TO public
USING (
  -- Permite ver perfis de usuários que criaram tópicos na comunidade
  EXISTS (
    SELECT 1 FROM community_topics ct
    WHERE ct.user_id = profiles.id
  )
  OR
  -- Permite ver perfis de usuários que comentaram na comunidade
  EXISTS (
    SELECT 1 FROM community_posts cp
    WHERE cp.user_id = profiles.id
  )
);