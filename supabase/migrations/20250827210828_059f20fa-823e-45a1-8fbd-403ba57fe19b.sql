-- FASE 1 & 2: Identificação e Correção de Dados
-- Criar templates de checklist para soluções que não têm templates mas têm checklists de usuários

-- Função para criar templates baseados nos dados de usuários existentes
DO $$
DECLARE
    solution_record RECORD;
    template_data JSONB;
    base_checklist JSONB;
BEGIN
    -- Para cada solução sem template, criar um template baseado no primeiro checklist de usuário
    FOR solution_record IN 
        SELECT DISTINCT uc.solution_id, s.title
        FROM unified_checklists uc
        INNER JOIN solutions s ON uc.solution_id = s.id
        WHERE uc.is_template = false 
        AND uc.solution_id NOT IN (
            SELECT DISTINCT solution_id 
            FROM unified_checklists 
            WHERE is_template = true
        )
    LOOP
        -- Buscar o primeiro checklist de usuário como base
        SELECT checklist_data INTO base_checklist
        FROM unified_checklists
        WHERE solution_id = solution_record.solution_id 
        AND is_template = false
        LIMIT 1;
        
        -- Resetar todos os checkboxes para false no template
        template_data := base_checklist;
        
        -- Inserir template de checklist
        INSERT INTO unified_checklists (
            user_id,
            solution_id, 
            template_id,
            checklist_type,
            checklist_data,
            completed_items,
            total_items,
            progress_percentage,
            is_completed,
            is_template,
            created_at,
            updated_at,
            metadata
        ) VALUES (
            NULL, -- templates não têm user_id
            solution_record.solution_id,
            gen_random_uuid(), -- gerar novo template_id
            'implementation',
            template_data,
            0, -- template sempre começa com 0 items completos
            COALESCE(jsonb_array_length(template_data->'items'), 0),
            0, -- 0% de progresso no template
            false, -- template nunca está completo
            true, -- é um template
            now(),
            now(),
            jsonb_build_object(
                'created_from', 'auto_migration',
                'source', 'user_checklist_data',
                'solution_title', solution_record.title
            )
        );
        
        RAISE NOTICE 'Template criado para solução: % (ID: %)', solution_record.title, solution_record.solution_id;
    END LOOP;
    
    RAISE NOTICE 'Migração de templates de checklist concluída!';
END $$;