# Configuração da Automação: Combo Viver de IA

## Nova Role Criada
- **Nome:** `combo_viver_de_ia`
- **Descrição:** Combo Viver de IA - Acesso completo ao Learning, Community e Certificates
- **Permissões:**
  - ✅ Learning
  - ✅ Community 
  - ✅ Certificates
  - ❌ Solutions
  - ❌ Tools
  - ❌ Benefits
  - ❌ Networking
  - ❌ Events

## Configuração da Automação

### 1. Condições
- **Evento:** NewSale (Nova venda na Hubla)
- **Produto:** `payload.event.groupName` = "Combo Viver de IA"
- **Status:** `payload.event.paidAt` deve existir (compra confirmada)

### 2. Ações
- **Tipo:** Enviar Convite Hubla
- **Template:** Combo Viver de IA
- **Role:** combo_viver_de_ia
- **Canais:** Email + WhatsApp
- **Expiração:** 7 dias
- **Mapeamento automático:**
  - Email: `payload.event.userEmail`
  - Nome: `payload.event.userName`
  - Telefone: `payload.event.userPhone`

### 3. Template de Email
- **Assunto:** "Parabéns! Seu Combo Viver de IA foi ativado! 🤖"
- **Preview:** "Agora você tem acesso completo ao Learning, Community e Certificates..."
- **Canais:** Email + WhatsApp

## Como Testar

1. Acesse `/admin/automations/new`
2. Configure a automação conforme especificado acima
3. Salve a regra como ativa
4. Simule uma compra do "Combo Viver de IA" via webhook da Hubla
5. Verifique se o convite foi enviado automaticamente
6. Confirme se o usuário recebeu as permissões corretas

## Resultado Final
- Compras do "Combo Viver de IA" são detectadas automaticamente
- Convites personalizados são enviados via email e WhatsApp
- Usuários recebem acesso imediato ao Learning, Community e Certificates
- Processo totalmente automatizado sem intervenção manual