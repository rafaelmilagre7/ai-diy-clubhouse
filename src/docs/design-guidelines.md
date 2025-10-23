# Diretrizes de Design da VIA

## ❌ Proibido

### Emojis e Ícones Infantis
- **NUNCA** usar emojis em textos da interface (✨, 🎉, 🚀, ✅, ⚡, 💡, etc.)
- **NUNCA** usar ícones coloridos ou infantis
- **NUNCA** usar animações exageradas ou "fofas"

**Motivo:** Nosso público-alvo são líderes empresariais e tomadores de decisão. A comunicação deve ser profissional, técnica e sofisticada.

### Linguagem
- Evitar expressões muito casuais ou informais
- Preferir tom profissional e objetivo
- Usar terminologia técnica quando apropriado

## ✅ Usar

### Design Visual
- Design minimalista e sofisticado
- Ícones geométricos e abstratos
- Gradientes sutis e elegantes
- Animações suaves e profissionais
- Cores do design system (HSL tokens)

### Animações
- Círculos concêntricos
- Geometria abstrata
- Transições suaves
- Pulsos e fade-ins discretos

### Paleta de Cores
- Usar sempre tokens HSL do design system (`hsl(var(--primary))`)
- Manter contraste adequado para acessibilidade
- Gradientes sutis e profissionais

### Componentes
- Componentes focados e reutilizáveis
- Código limpo e manutenível
- Usar shadcn/ui com customizações profissionais

## Exemplos

### ❌ Errado
```typescript
<Button>Gerar solução! 🎉✨</Button>
<p>Tudo certo! ✅</p>
```

### ✅ Correto
```typescript
<Button>Gerar solução</Button>
<p>Validação concluída com sucesso</p>
```

---

**Última atualização:** 2025-01-23  
**Mantido por:** Equipe VIA
