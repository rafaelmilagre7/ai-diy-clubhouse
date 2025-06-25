
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

interface SolutionCertificate {
  id: string;
  user_id: string;
  solution_id: string;
  implementation_date: string;
  issued_at: string;
  validation_code: string;
  certificate_url?: string;
  solutions?: {
    id: string;
    title: string;
    category: string;
    description: string;
  };
}

export const useSolutionCertificates = (solutionId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar certificados de soluções do usuário
  const { data: certificates = [], isLoading, error } = useQuery({
    queryKey: ['solution-certificates', user?.id, solutionId],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('solution_certificates')
        .select(`
          *,
          solutions (
            id,
            title,
            category,
            description
          )
        `)
        .eq('user_id', user.id as any)
        .order('issued_at', { ascending: false });

      if (solutionId) {
        query = query.eq('solution_id', solutionId as any);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar certificados:', error);
        return [];
      }
      return data as SolutionCertificate[];
    },
    enabled: !!user?.id
  });

  // Verificar elegibilidade para certificado
  const checkEligibility = async (solutionId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // Verificar se a solução foi implementada completamente
      const { data: implementations, error } = await supabase
        .from('solution_implementations')
        .select('*')
        .eq('user_id', user.id as any)
        .eq('solution_id', solutionId as any)
        .eq('completed', true);

      if (error) {
        console.error('Erro ao verificar implementações:', error);
        return false;
      }

      return implementations && implementations.length > 0;
    } catch (error) {
      console.error('Erro ao verificar elegibilidade:', error);
      return false;
    }
  };

  // Gerar certificado
  const generateCertificate = useMutation({
    mutationFn: async (solutionId: string) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Verificar elegibilidade primeiro
      const isEligible = await checkEligibility(solutionId);
      if (!isEligible) {
        throw new Error('Você precisa completar a implementação da solução para gerar o certificado.');
      }

      // Verificar se já existe certificado
      const existingCertificate = certificates.find(cert => cert.solution_id === solutionId);
      if (existingCertificate) {
        throw new Error('Você já possui um certificado para esta solução.');
      }

      // Criar certificado
      const validationCode = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from('solution_certificates')
        .insert({
          user_id: user.id,
          solution_id: solutionId,
          implementation_date: new Date().toISOString(),
          issued_at: new Date().toISOString(),
          validation_code: validationCode
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Certificado gerado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['solution-certificates'] });
    },
    onError: (error: any) => {
      console.error('Erro ao gerar certificado:', error);
      toast.error(error.message || 'Erro ao gerar certificado. Tente novamente.');
    }
  });

  // Download do certificado (simulado por enquanto)
  const downloadCertificate = async (certificateId: string) => {
    try {
      const certificate = certificates.find(c => c.id === certificateId);
      if (!certificate) {
        toast.error('Certificado não encontrado');
        return;
      }

      // Por enquanto, mostrar informações do certificado
      toast.success('Funcionalidade de download será implementada em breve');
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast.error('Erro ao fazer download do certificado');
    }
  };

  return {
    certificates,
    isLoading,
    error,
    checkEligibility,
    generateCertificate: generateCertificate.mutate,
    isGenerating: generateCertificate.isPending,
    downloadCertificate
  };
};
