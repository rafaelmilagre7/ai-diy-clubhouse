
# Sistema de Tipos Consolidado

## Estrutura Organizada

### 📁 Arquivos de Tipos

- **`core.ts`** - Tipos fundamentais (User, Solution, Module, Progress)
- **`learning.ts`** - Sistema LMS (Courses, Lessons, Progress)
- **`onboarding.ts`** - Fluxo de onboarding completo
- **`utils.ts`** - Utilitários e helpers para tipos seguros
- **`index.ts`** - Exportação centralizada

### 🛡️ Padrões de Segurança

#### 1. Propriedades Computadas
```typescript
// ❌ Evite: Tipos que assumem propriedades computadas
interface Course {
  lesson_count: number; // Pode não existir!
}

// ✅ Use: Tipos estendidos com propriedades opcionais
interface CourseWithStats extends Course {
  lesson_count?: number;
  all_lessons?: Lesson[];
}
```

#### 2. Props Defensivas
```typescript
// ❌ Evite: Props obrigatórias sem fallback
interface ComponentProps {
  activeTab: string;
}

// ✅ Use: Props opcionais com valores padrão
interface ComponentProps {
  activeTab?: string;
}
const Component = ({ activeTab = "all" }: ComponentProps) => {}
```

#### 3. Validação de Dados
```typescript
// ❌ Evite: Acesso direto sem validação
const count = course.lesson_count;

// ✅ Use: Funções utilitárias
const count = ensureNumber(course.lesson_count);
const lessons = ensureArray(course.all_lessons);
```

### 🔧 Utilitários Disponíveis

- `withDefaults()` - Mescla objetos com valores padrão
- `safeAccess()` - Acesso seguro a propriedades
- `ensureArray()` - Garante retorno de array
- `ensureNumber()` - Garante retorno de número

### 📋 Checklist para Novos Componentes

- [ ] Usar tipos da pasta `/types/`
- [ ] Propriedades opcionais têm valores padrão
- [ ] Dados computados são opcionais
- [ ] Usar utilitários para validação
- [ ] Testar com dados incompletos

### 🚨 Evitar Regressões

1. **Nunca** assumir que propriedades computadas existem
2. **Sempre** fornecer fallbacks para props críticas
3. **Sempre** validar dados vindos de APIs
4. **Usar** os tipos estendidos (`WithStats`) quando apropriado
