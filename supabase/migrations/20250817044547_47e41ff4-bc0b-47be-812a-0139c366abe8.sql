-- Desativar tags das categorias 'ferramenta' e 'nivel' que já existem em outros campos da aula
UPDATE lesson_tags 
SET is_active = false, 
    updated_at = now()
WHERE category IN ('ferramenta', 'nivel');

-- Comentário: Removemos as tags de ferramenta e nível porque essas informações 
-- já estão capturadas em outros campos específicos da aula