
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "./LoginForm";
import { AnimatePresence, motion } from "framer-motion";

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0F111A] via-[#1A1F2C] to-[#2C3E50] p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-viverblue/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-viverblue/5 rounded-full blur-3xl"></div>
      
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          {/* Logo and Header */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6"
            >
              <img
                src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
                alt="VIVER DE IA Club"
                className="mx-auto h-20 w-auto drop-shadow-2xl rounded-full border-4 border-viverblue/20 hover:border-viverblue/40 transition-all duration-300"
              />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl font-heading font-bold text-white drop-shadow-lg mb-2"
            >
              Potencialize com IA
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-white/90 text-lg font-medium"
            >
              Transforme seu negócio com inteligência artificial
            </motion.p>
          </div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Card className="w-full bg-black/20 backdrop-blur-xl border-white/10 shadow-2xl hover:shadow-viverblue/10 transition-all duration-300 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              
              <CardHeader className="pb-6 relative">
                <CardTitle className="text-2xl text-center text-white font-heading font-semibold">
                  Acesse sua conta
                </CardTitle>
                <CardDescription className="text-white/80 text-center text-base font-medium">
                  Entre para acessar suas soluções de IA
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative">
                <LoginForm />
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 text-center text-sm text-white/90 space-y-3"
          >
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-base font-semibold text-white mb-2">
                🎯 Acesso exclusivo para membros do VIVER DE IA Club
              </p>
              
              <p className="text-white/80 mb-3">
                Não possui uma conta?{" "}
                <span className="font-semibold text-viverblue">
                  O cadastro é feito apenas por convite
                </span>
              </p>
              
              <p className="text-white/70 text-sm">
                Se você recebeu um convite, acesse o link enviado por email para ativar sua conta
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-white/60">
              <span>Dúvidas ou mais informações?</span>
              <a
                href="https://milagredigital.com/club/"
                className="font-semibold text-viverblue hover:text-viverblue-light underline decoration-viverblue/50 hover:decoration-viverblue transition-all duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                Conheça o Club →
              </a>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthLayout;
