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
      className="w-full max-w-sm mx-auto"
    >
      {/* Logo do Club */}
      <div className="mb-6 text-center">
        <img
          src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
          alt="VIVER DE IA Club"
          className="mx-auto h-16 w-auto"
        />
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-white mb-1">
            Definir senha
          </h2>
          <p className="text-gray-400 text-sm">
            Complete seu acesso à plataforma
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              id="name"
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
              className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
            />
          </div>

          <div>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
            />
          </div>
          
          <div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 pr-10"
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
            
            {password && passwordStrength.score < 3 && (
              <p className="text-xs text-gray-400 mt-1">
                Use pelo menos 8 caracteres com letras, números e símbolos
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                className={`bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 pr-10 ${
                  confirmPassword && !passwordsMatch ? 'border-red-400' : 
                  confirmPassword && passwordsMatch ? 'border-green-400' : ''
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
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-400 mt-1">
                As senhas não coincidem
              </p>
            )}
          </div>

          <div className="space-y-3 pt-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-2.5 rounded-xl transition-all duration-200" 
              disabled={isLoading || !passwordsMatch || passwordStrength.score < 3}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar conta"
              )}
            </Button>

            <Button 
              type="button" 
              variant="ghost"
              className="w-full text-gray-400 hover:text-white text-sm"
              onClick={onBackToLogin}
              disabled={isLoading}
            >
              Voltar ao login
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default SignUpForm;