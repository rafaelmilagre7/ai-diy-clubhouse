
import React from 'react';
import { SupabaseErrorDiagnostics } from '@/components/debug/SupabaseErrorDiagnostics';

const SupabaseDiagnostics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Diagnóstico do Supabase</h1>
        <p className="text-muted-foreground">
          Análise detalhada dos erros e status de saúde do sistema Supabase.
        </p>
      </div>

      <SupabaseErrorDiagnostics />
    </div>
  );
};

export default SupabaseDiagnostics;
