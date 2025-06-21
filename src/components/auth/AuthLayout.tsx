
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { SecureLoginForm } from './SecureLoginForm';
import { RegisterForm } from './RegisterForm';
import { ArrowLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { DynamicBrandLogo } from '@/components/common/DynamicBrandLogo';
import { getBrandColors, detectUserType } from '@/services/brandLogoService';

const AuthLayout = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [searchParams] = useSearchParams();

  // Detectar tipo de usuário baseado nos parâmetros da URL
  const userType = detectUserType({
    urlParams: searchParams,
    defaultType: 'club'
  });

  // Obter cores da marca
  const brandColors = getBrandColors(userType);

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
          <DynamicBrandLogo
            userType={userType}
            urlParams={searchParams}
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
              className={`${brandColors.text} ${brandColors.hover} text-sm`}
            >
              {isLogin 
                ? 'Não tem conta? Criar uma nova conta' 
                : 'Já tem conta? Fazer login'
              }
            </button>
          </div>
          
          {isLogin && (
            <div className="mt-4 text-center">
              <Link 
                to="/reset-password" 
                className={`${brandColors.text} ${brandColors.hover} text-sm`}
              >
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
