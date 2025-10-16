#!/bin/bash
# Script para atualizar cores dos gráficos para usar variáveis CSS
# Use: bash src/scripts/update-chart-colors.sh

echo "Atualizando cores de gráficos para usar hsl(var(--aurora-primary))..."

# Substituir '#0ABAB5' por 'hsl(var(--aurora-primary))' em arrays de cores
find src/components/admin/analytics -type f -name "*.tsx" -exec sed -i "s/'#0ABAB5'/'hsl(var(--aurora-primary))'/g" {} +
find src/pages -type f -name "*.tsx" -exec sed -i "s/'#0ABAB5'/'hsl(var(--aurora-primary))'/g" {} +

echo "✅ Cores atualizadas! Execute 'npm run dev' para ver as mudanças."
