
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import LoginForm from "./login/LoginForm";

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <img
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
            className="mx-auto h-20 w-auto"
          />
        </div>

        {/* Título Principal */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Potencialize com IA
          </h1>
          <p className="text-gray-300 text-lg">
            Transforme seu negócio com inteligência artificial
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 mb-8">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-white">
              Acesse sua conta
            </CardTitle>
            <CardDescription className="text-gray-300">
              Entre para acessar suas soluções de IA exclusivas
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <LoginForm />
          </CardContent>
        </div>

        {/* Seção Inferior - Acesso Exclusivo */}
        <div className="text-center bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl">🔒</span>
            <span className="text-white font-semibold">
              Acesso exclusivo para membros convidados
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Esta plataforma é restrita apenas para membros que receberam um convite oficial. 
            Entre em contato conosco se precisar de acesso.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
