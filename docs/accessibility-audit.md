# Auditoria de Acessibilidade - Design System

**Data:** 2025-01-XX  
**Status:** Em Progresso  
**Padrão:** WCAG 2.1 Nível AA

---

## 📋 Checklist de Auditoria

### 1. Contraste de Cores (WCAG AA)

#### ✅ Texto Normal (4.5:1 mínimo)
- [ ] Texto primário em background escuro
- [ ] Texto secundário em background escuro
- [ ] Texto muted em background escuro
- [ ] Texto em cards/modais
- [ ] Texto em botões

#### ✅ Texto Grande (3:1 mínimo)
- [ ] Headings H1-H6
- [ ] Títulos de cards
- [ ] Labels de formulário

#### ✅ Componentes UI (3:1 mínimo)
- [ ] Bordas de inputs
- [ ] Ícones funcionais
- [ ] Estados hover/focus
- [ ] Indicadores de status

---

### 2. Navegação por Teclado

#### ✅ Interatividade
- [ ] Todos elementos clicáveis acessíveis via Tab
- [ ] Ordem lógica de tabulação
- [ ] Focus visível em todos elementos
- [ ] Esc fecha modais/dialogs
- [ ] Enter/Space ativa botões

#### ✅ Focus States
- [ ] Botões primários
- [ ] Botões secundários
- [ ] Links
- [ ] Inputs de formulário
- [ ] Selects/Dropdowns
- [ ] Checkboxes/Radio buttons

#### ✅ Focus Trap
- [ ] Modais/Dialogs prendem foco
- [ ] Foco retorna ao elemento original ao fechar

---

### 3. Screen Readers

#### ✅ Semântica HTML
- [ ] Uso correto de headings (h1-h6)
- [ ] Landmarks (main, nav, aside, footer)
- [ ] Listas (ul/ol) para conteúdo em lista
- [ ] Tabelas com headers adequados

#### ✅ Labels e Descrições
- [ ] Todos inputs têm labels associados
- [ ] Imagens têm alt text descritivo
- [ ] Ícones decorativos têm aria-hidden
- [ ] Ícones funcionais têm aria-label
- [ ] Botões sem texto têm aria-label

#### ✅ Estados Dinâmicos
- [ ] aria-expanded em componentes expansíveis
- [ ] aria-selected em tabs/selects
- [ ] aria-invalid em campos com erro
- [ ] Live regions para notificações (aria-live)

---

### 4. Componentes Específicos

#### Botões
- [ ] Estado hover visível
- [ ] Estado focus com outline/ring
- [ ] Estado disabled visualmente claro
- [ ] Contraste adequado em todos estados
- [ ] Cursor correto (pointer, not-allowed)

#### Inputs
- [ ] Labels visíveis e associados
- [ ] Placeholder não substitui label
- [ ] Estados error/success claros
- [ ] Helper text acessível
- [ ] Contraste de borda adequado

#### Cards
- [ ] Interativos são focáveis
- [ ] Hover state claro
- [ ] Conteúdo estruturado semanticamente
- [ ] Links/botões internos acessíveis

#### Modais/Dialogs
- [ ] Focus trap funcional
- [ ] Esc fecha modal
- [ ] Overlay escurece background
- [ ] Botão de fechar acessível
- [ ] Foco retorna ao trigger

---

## 🐛 Problemas Identificados

### Críticos (P0)
*Problemas que impedem uso por usuários com deficiência*

### Altos (P1)
*Problemas que dificultam significativamente o uso*

### Médios (P2)
*Problemas que causam inconveniência*

### Baixos (P3)
*Melhorias recomendadas*

---

## ✅ Correções Aplicadas

### [Data] - Descrição da correção
**Problema:** [Descrição]  
**Solução:** [Descrição]  
**Componentes afetados:** [Lista]  
**Prioridade:** [P0-P3]

---

## 📊 Métricas de Acessibilidade

- **Contraste de Cores:** -% WCAG AA Compliant
- **Navegação por Teclado:** -% Funcional
- **Screen Reader:** -% Compatível
- **Semântica HTML:** -% Adequada

---

## 🔧 Ferramentas Utilizadas

- [ ] Lighthouse (Chrome DevTools)
- [ ] axe DevTools
- [ ] WAVE Browser Extension
- [ ] Contraste Checker (WebAIM)
- [ ] Keyboard Navigation Manual Test
- [ ] NVDA/JAWS Screen Reader Test

---

## 📚 Referências

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
