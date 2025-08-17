
import React from 'react';
import { SetNewPasswordForm } from '@/components/auth/SetNewPasswordForm';
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const SetNewPassword = () => {
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
          <div className="mx-auto w-64 h-16 flex items-center justify-center mb-4">
            <svg viewBox="0 0 200 50" className="h-full w-auto">
              <text 
                x="100" 
                y="30" 
                textAnchor="middle" 
                className="fill-white text-2xl font-bold"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                VIVER DE IA
              </text>
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-white">
            Definir Nova Senha
          </h2>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6">
          <SetNewPasswordForm />
        </div>
        
        <div className="mt-4 text-center">
          <Link to="/login" className="text-viverblue hover:text-viverblue/80 inline-flex items-center text-sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar para página de login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SetNewPassword;
