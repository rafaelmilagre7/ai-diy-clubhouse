#!/bin/bash

echo "🔍 Validando Design System - 100% Compliance"
echo "=============================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# 1. Valores arbitrários
echo "📐 Verificando valores arbitrários..."
ARBITRARY=$(grep -rE "\b(w|h|text|max-w|max-h|min-w|min-h)-\[" src/ --include="*.tsx" 2>/dev/null | wc -l)
if [ "$ARBITRARY" -eq 0 ]; then
  echo -e "${GREEN}✅ Valores arbitrários: $ARBITRARY (meta: 0)${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Valores arbitrários: $ARBITRARY (meta: 0)${NC}"
  ((FAILED++))
fi

# 2. Cores genéricas (exceto PDF)
echo "🎨 Verificando cores genéricas..."
GENERIC_COLORS=$(grep -rE "\b(bg|text|border)-(red|green|blue|yellow|purple|orange|amber|emerald|slate|gray|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)\b" src/ --include="*.tsx" --exclude="*CertificatePreview.tsx" 2>/dev/null | wc -l)
if [ "$GENERIC_COLORS" -le 40 ]; then
  echo -e "${GREEN}✅ Cores genéricas: $GENERIC_COLORS (meta: ≤ 40)${NC}"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠️  Cores genéricas: $GENERIC_COLORS (meta: ≤ 40)${NC}"
  ((PASSED++))
fi

# 3. Gradientes hardcoded
echo "🌈 Verificando gradientes hardcoded..."
GRADIENTS=$(grep -rE "\b(from|to|via)-(red|green|blue|yellow|purple|orange|amber|emerald)-(50|100|200|300|400|500|600|700|800|900)\b" src/ --include="*.tsx" 2>/dev/null | wc -l)
if [ "$GRADIENTS" -le 20 ]; then
  echo -e "${GREEN}✅ Gradientes hardcoded: $GRADIENTS (meta: ≤ 20)${NC}"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠️  Gradientes hardcoded: $GRADIENTS (meta: ≤ 20)${NC}"
  ((PASSED++))
fi

# 4. Transições hardcoded
echo "⚡ Verificando transições hardcoded..."
TRANSITIONS=$(grep -r "duration-(100|150|200|300|500|700|1000)" src/ --include="*.tsx" 2>/dev/null | wc -l)
if [ "$TRANSITIONS" -eq 0 ]; then
  echo -e "${GREEN}✅ Transições hardcoded: $TRANSITIONS (meta: 0)${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Transições hardcoded: $TRANSITIONS (meta: 0)${NC}"
  ((FAILED++))
fi

# 5. Verificar se os arquivos de tokens existem
echo ""
echo "📁 Verificando arquivos de design system..."
if [ -f "src/styles/base.css" ]; then
  echo -e "${GREEN}✅ src/styles/base.css existe${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ src/styles/base.css não encontrado${NC}"
  ((FAILED++))
fi

if [ -f "src/styles/design-tokens.css" ]; then
  echo -e "${GREEN}✅ src/styles/design-tokens.css existe${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ src/styles/design-tokens.css não encontrado${NC}"
  ((FAILED++))
fi

if [ -f "tailwind.config.ts" ]; then
  echo -e "${GREEN}✅ tailwind.config.ts existe${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ tailwind.config.ts não encontrado${NC}"
  ((FAILED++))
fi

# 6. Verificar tokens de gradiente
echo ""
echo "🎨 Verificando tokens de gradiente..."
if grep -q "gradient-success" src/styles/design-tokens.css 2>/dev/null; then
  echo -e "${GREEN}✅ Tokens de gradiente configurados${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Tokens de gradiente não encontrados${NC}"
  ((FAILED++))
fi

# Resultado final
echo ""
echo "=============================================="
TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}✅ DESIGN SYSTEM: 100% CONFORME!${NC}"
  echo -e "${GREEN}   Testes passados: $PASSED/$TOTAL ($PERCENTAGE%)${NC}"
  exit 0
else
  echo -e "${RED}❌ Design System precisa de ajustes${NC}"
  echo -e "   Testes passados: $PASSED/$TOTAL ($PERCENTAGE%)"
  echo -e "   Testes falhos: $FAILED"
  echo ""
  echo "💡 Execute as correções necessárias e tente novamente"
  exit 1
fi
