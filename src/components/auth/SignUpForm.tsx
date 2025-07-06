import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface SignUpFormProps {
  onBackToLogin: () => void;
}

const SignUpForm = ({ onBackToLogin }: SignUpFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteToken, setInviteToken] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Pegar token do convite da URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setInviteToken(token);
    }
  }, [searchParams]);

  // Redirecionar se já logado
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Validação de senha em tempo real
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    Object.values(checks).forEach(check => check && score++);
    
    return {
      score,
      checks,
      level: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong',
      color: score < 2 ? 'red' : score < 4 ? 'yellow' : 'green'
    };
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome completo.",
        variant: "destructive",
      });
      return;
    }

    if (!email || !password || !confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas digitadas são diferentes.",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength.score < 3) {
      toast({
        title: "Senha muito fraca",
        description: "Use pelo menos 8 caracteres com letras, números e símbolos.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("[SIGNUP] Iniciando processo de registro");
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name.trim(),
            invite_token: inviteToken || undefined
          }
        }
      });
      
      if (error) {
        console.error("[SIGNUP] Erro no registro:", error);
        
        if (error.message?.includes('already registered')) {
          toast({
            title: "Email já cadastrado",
            description: "Este email já está em uso. Tente fazer login ou use outro email.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }
      
      if (data.user) {
        console.log("[SIGNUP] Registro bem-sucedido:", data.user.email);
        
        // Se tem token de convite, aplicar agora
        if (inviteToken) {
          try {
            const { data: inviteResult, error: inviteError } = await supabase.rpc('use_invite_enhanced', {
              invite_token: inviteToken,
              user_id: data.user.id
            });

            if (inviteError || inviteResult?.status === 'error') {
              console.error("[SIGNUP] Erro ao aplicar convite:", inviteError || inviteResult?.message);
              toast({
                title: "Conta criada com sucesso",
                description: "Porém houve um problema com o convite. Entre em contato conosco.",
                variant: "destructive",
              });
            } else {
              console.log("[SIGNUP] Convite aplicado com sucesso");
            }
          } catch (err) {
            console.error("[SIGNUP] Erro ao aplicar convite:", err);
          }
        }
        
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar a conta e depois faça login.",
        });
        
        // Voltar para o login após um tempo
        setTimeout(() => {
          onBackToLogin();
        }, 2000);
      }
      
    } catch (error: any) {
      console.error("[SIGNUP] Erro no processo de registro:", error);
      toast({
        title: "Erro no registro",
        description: error.message || "Não foi possível criar a conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full"
    >
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6">
        <div className="text-center pb-4">
          <h2 className="text-2xl text-white mb-2">
            Criar nova conta
          </h2>
          <p className="text-gray-300">
            {inviteToken ? "Complete seu cadastro para acessar a plataforma" : "Cadastre-se para acessar"}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-200">Nome completo *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-200">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-200">Senha *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Indicador de força da senha */}
            {password && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded ${
                        passwordStrength.score >= level
                          ? passwordStrength.color === 'red' ? 'bg-red-500'
                          : passwordStrength.color === 'yellow' ? 'bg-yellow-500'
                          : 'bg-green-500'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-x-4 text-xs">
                  <span className={`flex items-center gap-1 ${passwordStrength.checks.length ? 'text-green-400' : 'text-gray-400'}`}>
                    {passwordStrength.checks.length ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    8+ caracteres
                  </span>
                  <span className={`flex items-center gap-1 ${passwordStrength.checks.numbers ? 'text-green-400' : 'text-gray-400'}`}>
                    {passwordStrength.checks.numbers ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    Números
                  </span>
                  <span className={`flex items-center gap-1 ${passwordStrength.checks.lowercase && passwordStrength.checks.uppercase ? 'text-green-400' : 'text-gray-400'}`}>
                    {passwordStrength.checks.lowercase && passwordStrength.checks.uppercase ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    Maiús/Minús
                  </span>
                  <span className={`flex items-center gap-1 ${passwordStrength.checks.special ? 'text-green-400' : 'text-gray-400'}`}>
                    {passwordStrength.checks.special ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    Símbolos
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-200">Confirmar senha *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                  confirmPassword && !passwordsMatch ? 'border-red-500' : 
                  confirmPassword && passwordsMatch ? 'border-green-500' : ''
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-300"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {confirmPassword && (
              <p className={`text-xs flex items-center gap-1 ${passwordsMatch ? 'text-green-400' : 'text-red-400'}`}>
                {passwordsMatch ? (
                  <>  
                    <CheckCircle className="h-3 w-3" />
                    Senhas coincidem
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    Senhas não coincidem
                  </>
                )}
              </p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <Button 
              type="submit" 
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold uppercase tracking-wide" 
              disabled={isLoading || !passwordsMatch || passwordStrength.score < 3}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "CRIAR CONTA"
              )}
            </Button>

            <Button 
              type="button" 
              variant="ghost"
              className="w-full text-gray-300 hover:text-white"
              onClick={onBackToLogin}
              disabled={isLoading}
            >
              Já tenho uma conta - Fazer login
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default SignUpForm;