
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { motion } from "framer-motion";

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen w-full">
      {/* Painel esquerdo - Formulário de login/registro */}
      <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-lg">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Entrar</h1>
            <p className="text-gray-400">Entre na sua conta para continuar</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Registrar</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Ao continuar, você concorda com nossos{" "}
              <a href="#" className="text-viverblue hover:underline">
                Termos de Serviço
              </a>{" "}
              e{" "}
              <a href="#" className="text-viverblue hover:underline">
                Política de Privacidade
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Painel direito - Informações e benefícios */}
      <div className="hidden md:flex md:w-1/2 bg-viverblue/20 flex-col justify-center p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg"
        >
          <div className="flex items-center mb-8">
            <img
              src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
              alt="VIVER DE IA Club"
              className="h-10 mr-3"
            />
          </div>

          <h3 className="text-3xl font-bold text-gray-800 mb-8">
            Potencialize seu Alcance com Inteligência Artificial
          </h3>

          <p className="text-lg text-gray-700 mb-10">
            Nossa plataforma permite implementar soluções de IA em seu negócio,
            gerenciar resultados de forma eficaz
            e analisar desempenho - tudo em um só lugar.
          </p>

          {/* Benefícios em cards */}
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2">
                Implementação Simplificada
              </h4>
              <p className="text-gray-600">
                Siga passos simples para implementar soluções de IA de alto impacto no seu negócio.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2">
                Acompanhamento de Resultados
              </h4>
              <p className="text-gray-600">
                Organize e monitore seus resultados com nosso sistema de tracking intuitivo.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2">
                Análises Avançadas
              </h4>
              <p className="text-gray-600">
                Obtenha insights a partir de análises abrangentes do impacto das soluções implementadas.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
