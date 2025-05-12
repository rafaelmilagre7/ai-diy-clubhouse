
# Sistema de Comentários - Guia de Manutenção

Este documento descreve a arquitetura e boas práticas para o sistema de comentários da plataforma.

## Estrutura de Dados

O sistema de comentários utiliza duas tabelas principais:

1. **tool_comments**
   - Armazena os comentários e respostas
   - Relaciona-se com `auth.users` através de `user_id`
   - Utiliza `parent_id` para relacionar respostas aos comentários principais

2. **tool_comment_likes**
   - Armazena as curtidas dos usuários nos comentários
   - Permite apenas uma curtida por usuário em cada comentário

## Configurações Críticas do Banco de Dados

- **Índices**: Manter índices em `tool_id`, `user_id`, e `parent_id`
- **Realtime**: As tabelas devem ter `REPLICA IDENTITY FULL`
- **Publicação**: Ambas as tabelas devem estar adicionadas à publicação `supabase_realtime`

## Padrões de Busca de Dados

- **Busca Explícita**: Sempre buscar explicitamente os dados de perfil relacionados
- **Validação Robusta**: Utilizar o utilitário `validateComments` para garantir integridade dos dados

## Chaves de Consulta (React Query)

- **Padrão Principal**: `['solution-comments', toolId, 'all']`
- **Invalidação Completa**: Sempre invalidar todas as variações de chaves ao modificar dados

## Sistema de Logs

- **Log Informativo**: Incluir metadados relevantes (IDs, contagens) em cada mensagem de log
- **Log de Erros**: Capturar detalhes completos dos erros para facilitar diagnóstico

## Verificação de Integridade

- **Hook `useCommentsIntegrity`**: Utilizar para verificações periódicas e reparo de dados
- **Botão de Refresh**: Permitir ao usuário forçar atualização em caso de problemas

## Prevenção de Erros Comuns

1. **Dados Ausentes**: Sempre verificar se `comments` é um array válido
2. **Perfis Ausentes**: Fornecer dados padrão quando perfis não forem encontrados
3. **Duplicação de Dados**: Evitar múltiplas buscas do mesmo dado em componentes diferentes

## Em Caso de Problemas

1. Verificar logs para identificar erros específicos
2. Utilizar a função `repairCommentsIntegrity` para forçar atualização dos dados
3. Verificar configurações do banco de dados (índices, realtime)

## Expansão do Sistema

Ao expandir o sistema de comentários:
1. Manter a mesma estrutura e padrões de consulta
2. Sempre incluir validação robusta de dados
3. Documentar novas funcionalidades neste guia
