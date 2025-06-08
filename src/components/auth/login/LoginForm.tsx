
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { cleanupAuthState } from "@/utils/authUtils";

interface LoginFormProps {
  onSwitchToReset: () => void;
}

export const LoginForm = ({ onSwitchToReset }: LoginFormProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Limpar estado de autenticação anterior para evitar conflitos
      cleanupAuthState();
      
      // Tentativa de logout global para garantir um estado limpo
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continuar mesmo se falhar
        console.log("Erro ao limpar sessão anterior:", err);
      }
      
      // Login com redirecionamento explícito
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Redirecionamento completo após login bem-sucedido
      if (data.user) {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo de volta!",
        });
        
        // Forçar redirecionamento completo para o domínio correto
        const redirectUrl = window.location.origin.includes('localhost')
          ? 'http://localhost:3000/dashboard'
          : 'https://app.viverdeia.ai/dashboard';
          
        window.location.href = redirectUrl;
      }
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      toast({
        title: "Erro de autenticação",
        description: error.message || "Não foi possível fazer login. Verifique suas credenciais.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Label htmlFor="email" className="text-white font-medium">Email</Label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
            <Mail 
              className="w-5 h-5 text-gray-400 group-focus-within:text-viverblue transition-colors duration-200" 
              strokeWidth={1.5} 
              aria-hidden="true" 
            />
          </div>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-11 bg-gray-800/70 border-gray-600 text-white text-base font-medium antialiased placeholder:text-gray-400 focus:border-viverblue focus:ring-viverblue focus:bg-gray-800 transition-all duration-200 hover:bg-gray-800/90"
            disabled={isLoading}
          />
        </div>
      </motion.div>

      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Label htmlFor="password" className="text-white font-medium">Senha</Label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
            <Lock 
              className="w-5 h-5 text-gray-400 group-focus-within:text-viverblue transition-colors duration-200" 
              strokeWidth={1.5} 
              aria-hidden="true" 
            />
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-11 pr-12 bg-gray-800/70 border-gray-600 text-white text-base font-medium antialiased placeholder:text-gray-400 focus:border-viverblue focus:ring-viverblue focus:bg-gray-800 transition-all duration-200 hover:bg-gray-800/90"
            disabled={isLoading}
          />
          <motion.button
            type="button"
            onClick={handleTogglePassword}
            className="absolute inset-y-0 right-0 flex items-center pr-3 z-10"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff 
                className="w-5 h-5 text-gray-400 hover:text-viverblue transition-colors duration-200" 
                strokeWidth={1.5} 
                aria-hidden="true" 
              />
            ) : (
              <Eye 
                className="w-5 h-5 text-gray-400 hover:text-viverblue transition-colors duration-200" 
                strokeWidth={1.5} 
                aria-hidden="true" 
              />
            )}
          </motion.button>
        </div>
      </motion.div>

      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <motion.button
          type="button"
          onClick={onSwitchToReset}
          className="text-sm text-viverblue hover:text-viverblue/80 underline hover:no-underline transition-all duration-200 font-medium"
          whileHover={{ scale: 1.02 }}
          disabled={isLoading}
        >
          Esqueceu sua senha?
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-viverblue to-viverblue/90 hover:from-viverblue/90 hover:to-viverblue focus:from-viverblue/90 focus:to-viverblue text-white font-semibold py-3 text-base transition-all duration-200 hover:shadow-lg hover:shadow-viverblue/25"
          disabled={isLoading}
        >
          {isLoading ? (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Entrando...
            </motion.div>
          ) : (
            "Entrar"
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
};

export default LoginForm;
