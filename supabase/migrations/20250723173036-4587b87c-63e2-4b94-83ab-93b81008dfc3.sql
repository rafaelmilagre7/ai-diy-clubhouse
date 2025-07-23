-- Flexibilizar bucket solution_files para aceitar todos os tipos de arquivo
UPDATE storage.buckets 
SET allowed_mime_types = NULL, -- Remover restrições de tipo MIME
    file_size_limit = 314572800 -- 300MB em bytes
WHERE id = 'solution_files';

-- Atualizar o bucket solution-resources também se existir
UPDATE storage.buckets 
SET allowed_mime_types = NULL, -- Remover restrições de tipo MIME
    file_size_limit = 314572800 -- 300MB em bytes
WHERE id = 'solution-resources';