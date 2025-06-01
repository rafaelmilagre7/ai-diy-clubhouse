
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ModernLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
      
    } catch (error: any) {
      console.error("Erro de login:", error);
      toast.error("Erro ao fazer login", {
        description: error.message === "Invalid login credentials"
          ? "Credenciais inválidas. Verifique seu email e senha."
          : error.message || "Ocorreu um erro ao tentar fazer login."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-viverblue/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Animated Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo and Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="mb-6">
            <img
              src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
              alt="VIVER DE IA Club"
              className="mx-auto h-20 w-auto drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Bem-vindo de volta
          </h1>
          
          <p className="text-blue-200/80 text-lg">
            Acesse sua conta para continuar
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl"
        >
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-semibold">
                Email
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-300 group-focus-within:text-viverblue transition-colors duration-200" strokeWidth={2.5} />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  required
                  className="pl-10 h-12 bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder:text-blue-200/60 focus:border-viverblue focus:ring-2 focus:ring-viverblue/30 transition-all duration-200 hover:bg-white/15"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-semibold">
                Senha
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-300 group-focus-within:text-viverblue transition-colors duration-200" strokeWidth={2.5} />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  required
                  className="pl-10 pr-12 h-12 bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder:text-blue-200/60 focus:border-viverblue focus:ring-2 focus:ring-viverblue/30 transition-all duration-200 hover:bg-white/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-300 hover:text-viverblue transition-colors duration-200"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" strokeWidth={2.5} />
                  ) : (
                    <Eye className="h-5 w-5" strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-viverblue to-blue-500 hover:from-viverblue-dark hover:to-blue-600 text-white font-semibold text-base tracking-wide transition-all duration-200 shadow-lg hover:shadow-viverblue/25 focus:ring-2 focus:ring-viverblue/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed border-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 text-center space-y-4"
        >
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <p className="text-white/90 font-medium mb-2">
              🔐 Acesso exclusivo para membros convidados
            </p>
            <p className="text-blue-200/80 text-sm">
              Se você recebeu um convite, use o email e senha fornecidos para acessar a plataforma
            </p>
          </div>
          
          <div className="text-blue-200/70 text-sm">
            <span>Interessado em participar? </span>
            <a
              href="https://milagredigital.com/club/"
              className="font-semibold text-viverblue hover:text-viverblue-light underline decoration-viverblue/50 hover:decoration-viverblue transition-all duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              Saiba mais sobre o Club →
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ModernLoginPage;
