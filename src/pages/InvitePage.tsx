
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Eye, EyeOff, LogOut } from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";

interface InviteData {
  id: string;
  email: string;
  expires_at: string;
  used_at: string | null;
  role: { name: string } | null;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  needsLogout?: boolean;
  inviteData?: InviteData;
}

const InvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });

  // Validar convite e verificar conflitos
  const validateInvite = async (): Promise<ValidationResult> => {
    if (!token) {
      return { isValid: false, error: "Token de convite não fornecido" };
    }

    try {
      console.log("🔍 Validando convite:", token.substring(0, 8) + "***");

      // Buscar dados do convite
      const { data: invite, error: inviteError } = await supabase
        .from('invites')
        .select(`
          id,
          email,
          expires_at,
          used_at,
          role:role_id(name)
        `)
        .eq('token', token)
        .maybeSingle();

      if (inviteError) {
        console.error("❌ Erro ao buscar convite:", inviteError);
        return { isValid: false, error: "Erro ao verificar convite" };
      }

      if (!invite) {
        console.log("❌ Convite não encontrado");
        return { isValid: false, error: "Convite não encontrado ou inválido" };
      }

      // Verificar se já foi usado
      if (invite.used_at) {
        console.log("❌ Convite já utilizado em:", invite.used_at);
        return { 
          isValid: false, 
          error: `Este convite já foi utilizado em ${new Date(invite.used_at).toLocaleString('pt-BR')}` 
        };
      }

      // Verificar se expirou
      if (new Date(invite.expires_at) < new Date()) {
        console.log("❌ Convite expirado em:", invite.expires_at);
        return { 
          isValid: false, 
          error: `Este convite expirou em ${new Date(invite.expires_at).toLocaleString('pt-BR')}` 
        };
      }

      // ✨ NOVA VALIDAÇÃO: Verificar se usuário está logado com email diferente
      if (user && user.email && user.email !== invite.email) {
        console.log("⚠️ Usuário logado com email diferente:", {
          usuarioLogado: user.email,
          convitePara: invite.email
        });
        
        return {
          isValid: false,
          error: `Você está logado como ${user.email}, mas este convite é para ${invite.email}`,
          needsLogout: true,
          inviteData: invite
        };
      }

      // Verificar se já existe perfil ativo
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, email, name')
        .eq('email', invite.email)
        .maybeSingle();

      if (existingProfile) {
        console.log("⚠️ Perfil já existe:", existingProfile);
        return {
          isValid: false,
          error: `Já existe uma conta ativa para ${invite.email}. Use a opção de login.`,
          inviteData: invite
        };
      }

      console.log("✅ Convite válido para:", invite.email);
      return { isValid: true, inviteData: invite };

    } catch (error) {
      console.error("❌ Erro na validação:", error);
      return { isValid: false, error: "Erro interno ao validar convite" };
    }
  };

  // Carregar e validar convite
  useEffect(() => {
    const loadInvite = async () => {
      setLoading(true);
      const result = await validateInvite();
      setValidationResult(result);
      
      if (result.isValid && result.inviteData) {
        setInviteData(result.inviteData);
      }
      
      setLoading(false);
    };

    loadInvite();
  }, [token, user]);

  // Fazer logout e recarregar página
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado", {
        description: "Você foi desconectado. Agora pode usar o convite."
      });
      // Recarregar a página após um pequeno delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Erro no logout:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  // Processar criação da conta
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteData || !validationResult?.isValid) {
      toast.error("Convite inválido");
      return;
    }

    // Validações do formulário
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Senhas não coincidem");
      return;
    }

    setProcessing(true);

    try {
      console.log("🚀 Criando conta para:", inviteData.email);

      // ✨ NOVA VERIFICAÇÃO: Validar novamente antes de criar
      const revalidation = await validateInvite();
      if (!revalidation.isValid) {
        toast.error("Convite não é mais válido", {
          description: revalidation.error
        });
        setProcessing(false);
        return;
      }

      // Tentar criar conta
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            invite_token: token
          }
        }
      });

      if (authError) {
        console.error("❌ Erro na criação:", authError);
        
        // ✨ MELHOR TRATAMENTO DE ERRO
        if (authError.message.includes('already registered')) {
          toast.error("Email já cadastrado", {
            description: `O email ${inviteData.email} já possui uma conta. Tente fazer login ou recuperar sua senha.`,
            duration: 8000,
            action: {
              label: 'Ir para Login',
              onClick: () => navigate('/login')
            }
          });
        } else {
          toast.error("Erro ao criar conta", {
            description: authError.message,
            duration: 6000
          });
        }
        
        setProcessing(false);
        return;
      }

      if (!authData.user) {
        toast.error("Erro na criação da conta");
        setProcessing(false);
        return;
      }

      console.log("✅ Conta criada, processando convite...");

      // Processar convite via RPC
      const { data: acceptResult, error: acceptError } = await supabase.rpc('accept_invite', {
        invite_token: token,
        user_name: formData.name
      });

      if (acceptError) {
        console.error("❌ Erro ao aceitar convite:", acceptError);
        toast.error("Erro ao processar convite", {
          description: acceptError.message
        });
        setProcessing(false);
        return;
      }

      if (acceptResult.status === 'error') {
        console.error("❌ RPC retornou erro:", acceptResult.message);
        toast.error("Erro ao processar convite", {
          description: acceptResult.message
        });
        setProcessing(false);
        return;
      }

      console.log("🎉 Convite aceito com sucesso!");
      
      toast.success("🎉 Conta criada com sucesso!", {
        description: `Bem-vindo(a), ${formData.name}! Você será redirecionado em alguns segundos.`,
        duration: 4000
      });

      // Redirecionar após sucesso
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error("❌ Erro inesperado:", error);
      toast.error("Erro inesperado", {
        description: "Tente novamente ou entre em contato com o suporte"
      });
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Verificando convite..." />;
  }

  // Caso de erro de validação
  if (!validationResult?.isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">Convite Inválido</CardTitle>
            <CardDescription>
              {validationResult?.error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationResult?.needsLogout && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p>Para usar este convite, você precisa fazer logout da conta atual.</p>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Fazer Logout e Continuar
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="flex-1"
              >
                Ir para Login
              </Button>
              <Button
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Página Inicial
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Caso de sucesso - mostrar formulário de criação de conta
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-xl">Criar Sua Conta</CardTitle>
          <CardDescription>
            Você foi convidado para se juntar como{' '}
            <span className="font-semibold">{inviteData?.role?.name || 'membro'}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Email:</strong> {inviteData?.email}
            </p>
          </div>

          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                disabled={processing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                  disabled={processing}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={processing}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                disabled={processing}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={processing}
            >
              {processing ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate('/login')}
              >
                Fazer login
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitePage;
