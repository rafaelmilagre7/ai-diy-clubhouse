
import React from 'react';
import { SupabaseErrorDiagnostics } from '@/components/debug/SupabaseErrorDiagnostics';

const SupabaseDiagnostics: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Diagnóstico do Sistema</h1>
        <p className="text-muted-foreground">
          Monitoramento e diagnóstico da saúde do sistema Supabase
        </p>
      </div>
      
      <SupabaseErrorDiagnostics />
    </div>
  );
};

export default SupabaseDiagnostics;
