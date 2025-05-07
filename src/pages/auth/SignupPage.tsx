
import React from 'react';
import AuthLayout from '@/components/auth/AuthLayout';

const SignupPage = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src="/logo.svg"
            alt="Logo"
            className="mx-auto h-20 w-auto"
          />
          <h2 className="mt-4 text-2xl font-extrabold text-white">
            Cadastro
          </h2>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6">
          <AuthLayout defaultTab="signup" />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
