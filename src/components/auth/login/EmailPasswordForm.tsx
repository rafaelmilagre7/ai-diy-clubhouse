
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { FormMessage } from "@/components/ui/form-message";

interface EmailPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error?: string;
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
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          disabled={isLoading}
          required
          autoComplete="username"
          className="placeholder:text-neutral-400"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-white">Senha</Label>
          <Link
            to="/reset-password"
            className="text-xs text-viverblue hover:text-viverblue-light hover:underline"
          >
            Esqueceu sua senha?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isLoading}
          required
          autoComplete="current-password"
          className="placeholder:text-neutral-400"
        />
      </div>

      {error && (
        <FormMessage type="error" message={error} />
      )}

      <Button
        type="submit"
        className="w-full bg-viverblue hover:bg-viverblue-dark text-white font-medium"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
};

export default EmailPasswordForm;
