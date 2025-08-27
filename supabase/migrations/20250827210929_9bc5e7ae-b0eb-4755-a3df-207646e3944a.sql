-- FASE 1 & 2: Identificação e Correção de Dados (CORRIGIDA)
-- Criar templates de checklist para soluções que não têm templates mas têm checklists de usuários

DO $$
DECLARE
    solution_record RECORD;
    template_data JSONB;
    base_checklist JSONB;
    admin_user_id UUID := '6e8a72f5-ebc7-452a-a7ee-38890f54cfd7'; -- Admin user para templates
    items_array JSONB;
    item JSONB;
    cleaned_items JSONB := '[]'::JSONB;
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
        
        -- Limpar os items e resetar checked para false
        IF template_data ? 'items' THEN
            items_array := template_data->'items';
            cleaned_items := '[]'::JSONB;
            
            FOR i IN 0..jsonb_array_length(items_array) - 1 LOOP
                item := items_array->i;
                -- Resetar checked para false
                item := jsonb_set(item, '{checked}', 'false'::jsonb);
                cleaned_items := cleaned_items || jsonb_build_array(item);
            END LOOP;
            
            template_data := jsonb_set(template_data, '{items}', cleaned_items);
        END IF;
        
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
            admin_user_id, -- usar admin user_id
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
                'solution_title', solution_record.title,
                'migration_date', now()
            )
        );
        
        RAISE NOTICE 'Template criado para solução: % (ID: %)', solution_record.title, solution_record.solution_id;
    END LOOP;
    
    RAISE NOTICE 'Migração de templates de checklist concluída com sucesso!';
END $$;