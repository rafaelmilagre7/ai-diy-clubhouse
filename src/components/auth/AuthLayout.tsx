
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { SecureLoginForm } from './SecureLoginForm';
import { RegisterForm } from './RegisterForm';
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AuthLayout = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <img
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
            className="mx-auto h-20 w-auto"
          />
          <h2 className="mt-4 text-2xl font-extrabold text-white">
            {isLogin ? 'Faça seu login' : 'Criar conta'}
          </h2>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6">
          {isLogin ? <SecureLoginForm /> : <RegisterForm />}
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-viverblue hover:text-viverblue/80 text-sm"
            >
              {isLogin 
                ? 'Não tem conta? Criar uma nova conta' 
                : 'Já tem conta? Fazer login'
              }
            </button>
          </div>
          
          {isLogin && (
            <div className="mt-4 text-center">
              <Link to="/reset-password" className="text-viverblue hover:text-viverblue/80 text-sm">
                Esqueceu sua senha?
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
