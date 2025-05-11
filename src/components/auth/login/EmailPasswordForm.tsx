
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

interface EmailPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  disableEmailEdit?: boolean;
}

const EmailPasswordForm = ({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  isLoading,
  disableEmailEdit = false
}: EmailPasswordFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const isOnLoginPage = location.pathname.includes('login');

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">
          Email
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
            disabled={disableEmailEdit}
            required
          />
        </div>
        {disableEmailEdit && (
          <p className="text-xs text-muted-foreground">
            Este email foi informado no convite e não pode ser alterado.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-white">
            Senha
          </Label>
          {isOnLoginPage && (
            <Link
              to="/reset-password"
              className="text-xs text-viverblue hover:underline"
            >
              Esqueceu a senha?
            </Link>
          )}
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-viverblue hover:bg-viverblue/90"
        disabled={isLoading}
      >
        {isLoading ? "Processando..." : isOnLoginPage ? "Entrar" : "Continuar"}
      </Button>

      {isOnLoginPage ? (
        <p className="text-center text-sm text-gray-400">
          Não tem uma conta?{" "}
          <Link to="/register" className="text-viverblue hover:underline">
            Cadastre-se
          </Link>
        </p>
      ) : (
        <p className="text-center text-sm text-gray-400">
          Já tem uma conta?{" "}
          <Link to="/login" className="text-viverblue hover:underline">
            Faça login
          </Link>
        </p>
      )}
    </form>
  );
};

export default EmailPasswordForm;
