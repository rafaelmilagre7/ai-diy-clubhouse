
import React from 'react';
import AuthLayout from '@/components/auth/AuthLayout';

const SignupPage = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="Logo VIVER DE IA Club"
            className="mx-auto h-20 w-auto"
          />
          <h2 className="mt-4 text-2xl font-extrabold text-white">
            Cadastro
          </h2>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6">
          <AuthLayout initialTab="signup" />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
