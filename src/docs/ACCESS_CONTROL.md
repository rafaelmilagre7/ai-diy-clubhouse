
# Sistema de Controle de Acesso - Viver de IA

## Visão Geral

O sistema de controle de acesso da plataforma Viver de IA utiliza uma abordagem híbrida baseada em:
1. **Permissões específicas** (preferencial)
2. **Papéis do usuário** (fallback para compatibilidade)

## Papéis de Usuário

### admin
- Acesso total ao sistema
- Pode gerenciar usuários, papéis e permissões
- Acesso a todas as funcionalidades

### formacao
- Acesso ao sistema LMS
- Pode criar e gerenciar cursos
- Acesso ao networking

### membro_club
- Acesso ao networking inteligente
- Acesso a benefícios exclusivos
- Acesso a cursos específicos

### member
- Acesso básico à plataforma
- Acesso limitado a recursos gratuitos

## Funcionalidades e Controle de Acesso

### Networking Inteligente
- **Permissão**: `networking.access`
- **Papéis com acesso**: admin, formacao, membro_club
- **Hook**: `useNetworkingAccess()`

### Gerenciamento de Cursos
- **Permissão**: `courses.manage`
- **Papéis com acesso**: admin, formacao
- **Hook**: `useFeatureAccess('courseManagement')`

### Administração de Ferramentas
- **Permissão**: `tools.admin`
- **Papéis com acesso**: admin
- **Hook**: `useFeatureAccess('toolsAdmin')`

### Analytics
- **Permissão**: `analytics.view`
- **Papéis com acesso**: admin
- **Hook**: `useFeatureAccess('analytics')`

## Como Implementar Nova Funcionalidade

### 1. Definir Configuração de Acesso
```typescript
// Em src/hooks/auth/useFeatureAccess.ts
const FEATURE_CONFIGS = {
  minhaNovaFuncionalidade: {
    permission: 'minha.funcionalidade',
    fallbackRoles: ['admin', 'papel_especifico'],
    description: 'Descrição da funcionalidade',
    upgradeMessage: 'Mensagem para upgrade (opcional)'
  }
}
```

### 2. Usar Hook de Acesso
```typescript
// No seu componente
import { useFeatureAccess } from '@/hooks/auth/useFeatureAccess';

function MeuComponente() {
  const { hasAccess, accessMessage } = useFeatureAccess('minhaNovaFuncionalidade');
  
  if (!hasAccess) {
    return <div>{accessMessage}</div>;
  }
  
  return <div>Conteúdo da funcionalidade</div>;
}
```

### 3. Criar Permissão no Banco (se necessário)
```sql
INSERT INTO permission_definitions (code, name, description, category)
VALUES ('minha.funcionalidade', 'Minha Funcionalidade', 'Descrição', 'categoria');
```

### 4. Atribuir Permissão aos Papéis
```sql
INSERT INTO role_permissions (role_id, permission_id)
SELECT ur.id, pd.id
FROM user_roles ur, permission_definitions pd
WHERE ur.name IN ('admin', 'papel_especifico')
AND pd.code = 'minha.funcionalidade';
```

## Checklist para Nova Funcionalidade

- [ ] Definir qual(is) papel(is) deve(m) ter acesso
- [ ] Criar configuração em `FEATURE_CONFIGS`
- [ ] Implementar verificação de acesso no componente/página
- [ ] Criar permissão no banco (se necessário)
- [ ] Atribuir permissão aos papéis apropriados
- [ ] Testar acesso com diferentes tipos de usuário
- [ ] Documentar a funcionalidade neste arquivo

## Usuários de Teste

- `rafaelmilagre@hotmail.com` - membro_club (deve ter acesso ao networking)
- `admin@teste.com` - admin (acesso total)
- Usuários member - acesso limitado

## Troubleshooting

### Usuário não tem acesso esperado
1. Verificar papel do usuário na tabela `profiles`
2. Verificar se o papel tem as permissões necessárias
3. Verificar configuração em `FEATURE_CONFIGS`
4. Verificar implementação do hook de acesso

### Erro de permissão
1. Verificar se a permissão existe na tabela `permission_definitions`
2. Verificar se está atribuída ao papel correto em `role_permissions`
3. Verificar se a função `user_has_permission` está funcionando
