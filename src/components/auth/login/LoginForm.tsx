import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { cleanupAuthState } from "@/utils/authUtils";

export const LoginForm = () => {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
            <Mail 
              className="w-5 h-5 text-gray-400" 
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
            className="pl-11 bg-gray-800 border-gray-700 text-white text-base font-medium antialiased"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
            <Lock 
              className="w-5 h-5 text-gray-400" 
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
            className="pl-11 pr-12 bg-gray-800 border-gray-700 text-white text-base font-medium antialiased"
          />
          <button
            type="button"
            onClick={handleTogglePassword}
            className="absolute inset-y-0 right-0 flex items-center pr-3 z-10"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff 
                className="w-5 h-5 text-gray-400" 
                strokeWidth={1.5} 
                aria-hidden="true" 
              />
            ) : (
              <Eye 
                className="w-5 h-5 text-gray-400" 
                strokeWidth={1.5} 
                aria-hidden="true" 
              />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-viverblue hover:bg-viverblue/90"
        disabled={isLoading}
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
};

export default LoginForm;
