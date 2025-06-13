
# Configuração de Segurança - Variáveis de Ambiente

## 🔒 Credenciais do Supabase

Para garantir a segurança da aplicação, as credenciais do Supabase agora são configuradas via variáveis de ambiente.

### Configuração Local

1. **Copie o arquivo de exemplo:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure suas credenciais do Supabase:**
   - Acesse: https://supabase.com/dashboard/project/[seu-projeto]/settings/api
   - Copie a **Project URL** para `VITE_SUPABASE_URL`
   - Copie a **anon public** key para `VITE_SUPABASE_ANON_KEY`

3. **Exemplo do arquivo `.env.local`:**
   ```env
   VITE_SUPABASE_URL=https://zotzvtepvpnkcoobdubt.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Deploy em Produção

Configure as seguintes variáveis de ambiente no seu provedor de hosting:

- `VITE_SUPABASE_URL`: URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase
- `VITE_APP_DOMAIN`: Domínio da aplicação (opcional)

### Verificação de Configuração

A aplicação validará automaticamente as configurações na inicialização:

- ✅ **Configuração válida**: Console mostrará confirmação
- ❌ **Configuração inválida**: Console mostrará erros específicos
- 🔄 **Fallback**: Em desenvolvimento, usa valores padrão se necessário

### Segurança

- ✅ **Credenciais não expostas** no código fonte
- ✅ **Validação automática** de configuração
- ✅ **Logs seguros** sem exposição de credenciais
- ✅ **Compatibilidade total** com funcionalidades existentes

## 🚀 Benefícios

1. **Segurança Máxima**: Credenciais não estão mais hardcoded
2. **Deploy Flexível**: Diferentes ambientes podem usar credenciais diferentes
3. **Auditoria Limpa**: Nenhuma informação sensível no repositório
4. **Padrão da Indústria**: Seguindo melhores práticas de segurança

## ⚡ Funcionamento

- Toda a funcionalidade existente permanece inalterada
- AuthContext, storage, queries e mutations funcionam identicamente
- Zero breaking changes ou impacto na performance
- Fallbacks automáticos para desenvolvimento local
