
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface EmailPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error?: string | null;
}

const EmailPasswordForm = ({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  isLoading,
  error
}: EmailPasswordFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Email Field */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="email" className="text-white font-semibold text-sm">
          Email
        </Label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Mail className="h-5 w-5 text-white/90 group-focus-within:text-viverblue transition-colors" />
          </div>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            disabled={isLoading}
            required
            autoComplete="username"
            className="pl-10 h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:border-viverblue focus:ring-2 focus:ring-viverblue/20 transition-all duration-200 hover:bg-white/15"
          />
        </div>
      </motion.div>

      {/* Password Field */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-white font-semibold text-sm">
            Senha
          </Label>
          <Link
            to="/reset-password"
            className="text-xs text-viverblue hover:text-viverblue-light underline hover:no-underline font-medium transition-all duration-200"
          >
            Esqueceu sua senha?
          </Link>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Lock className="h-5 w-5 text-white/90 group-focus-within:text-viverblue transition-colors" />
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
            required
            autoComplete="current-password"
            className="pl-10 pr-12 h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:border-viverblue focus:ring-2 focus:ring-viverblue/20 transition-all duration-200 hover:bg-white/15"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/90 hover:text-viverblue transition-colors duration-200"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            {error}
          </div>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Button
          type="submit"
          className="w-full h-12 bg-viverblue hover:bg-viverblue-dark focus:bg-viverblue-dark active:bg-viverblue-darker text-white font-semibold text-base uppercase tracking-wide transition-all duration-200 shadow-lg hover:shadow-viverblue/25 focus:ring-2 focus:ring-viverblue/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
      </motion.div>
    </form>
  );
};

export default EmailPasswordForm;
