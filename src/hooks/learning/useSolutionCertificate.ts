
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useSolutionCertificate = (solutionId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar certificado existente e verificar elegibilidade
  const { data, isLoading, error } = useQuery({
    queryKey: ['solution-certificate', user?.id, solutionId],
    queryFn: async () => {
      if (!user?.id) return { certificate: null, isEligible: false, progress: null };
      
      console.log('Buscando certificado para solução:', solutionId);
      
      // Primeiro, verificar se já existe um certificado
      const { data: existingCert, error: certError } = await supabase
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
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .maybeSingle();

      if (certError) {
        console.error('Erro ao buscar certificado:', certError);
      }

      // Verificar se o usuário completou a solução
      const { data: progress, error: progressError } = await supabase
        .from('progress')
        .select(`
          *,
          solutions (
            id,
            title,
            category,
            description
          )
        `)
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .maybeSingle();

      if (progressError) {
        console.error('Erro ao buscar progresso:', progressError);
      }

      const isEligible = progress?.is_completed === true;
      
      console.log('Dados encontrados:', {
        existingCert: !!existingCert,
        progress: !!progress,
        isCompleted: progress?.is_completed,
        isEligible
      });

      // Se é elegível mas não tem certificado, gerar automaticamente
      if (isEligible && !existingCert && progress?.solutions) {
        console.log('Gerando certificado automaticamente...');
        
        // Gerar código de validação
        const validationCode = Array.from({ length: 12 }, () => 
          'ABCDEFGHJKMNPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 34)]
        ).join('');

        try {
          const { data: newCert, error: createError } = await supabase
            .from('solution_certificates')
            .insert({
              user_id: user.id,
              solution_id: solutionId,
              implementation_date: progress.completed_at || progress.updated_at,
              validation_code: validationCode,
              issued_at: new Date().toISOString()
            })
            .select(`
              *,
              solutions (
                id,
                title,
                category,
                description
              )
            `)
            .single();

          if (createError) {
            console.error('Erro ao criar certificado:', createError);
            throw createError;
          }

          console.log('Certificado criado:', newCert);
          return {
            certificate: newCert,
            isEligible: true,
            progress
          };
        } catch (error) {
          console.error('Falha ao gerar certificado:', error);
          return {
            certificate: null,
            isEligible: true,
            progress
          };
        }
      }

      return {
        certificate: existingCert,
        isEligible,
        progress
      };
    },
    enabled: !!user?.id && !!solutionId
  });

  // Gerar certificado manualmente
  const generateCertificate = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Verificar se é elegível
      const { data: progress, error: progressError } = await supabase
        .from('progress')
        .select(`
          *,
          solutions (
            id,
            title,
            category,
            description
          )
        `)
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .eq('is_completed', true)
        .single();

      if (progressError || !progress) {
        throw new Error('Você precisa completar a implementação da solução primeiro');
      }

      // Gerar código de validação
      const validationCode = Array.from({ length: 12 }, () => 
        'ABCDEFGHJKMNPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 34)]
      ).join('');

      // Criar certificado
      const { data: certificate, error: createError } = await supabase
        .from('solution_certificates')
        .insert({
          user_id: user.id,
          solution_id: solutionId,
          implementation_date: progress.completed_at || progress.updated_at,
          validation_code: validationCode,
          issued_at: new Date().toISOString()
        })
        .select(`
          *,
          solutions (
            id,
            title,
            category,
            description
          )
        `)
        .single();

      if (createError) throw createError;
      return certificate;
    },
    onSuccess: () => {
      toast.success('Certificado gerado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['solution-certificate'] });
    },
    onError: (error: any) => {
      console.error('Erro ao gerar certificado:', error);
      toast.error(error.message || 'Erro ao gerar certificado. Tente novamente.');
    }
  });

  // Download do certificado como PDF
  const downloadCertificate = async (certificate: any, userProfile: any) => {
    try {
      // Importar bibliotecas dinamicamente
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      // Criar elemento temporário com o certificado
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.height = '600px';
      tempDiv.style.background = 'linear-gradient(135deg, #0ABAB5 0%, #00EAD9 50%, #6DF2E9 100%)';
      tempDiv.style.color = 'white';
      tempDiv.style.padding = '40px';
      tempDiv.style.textAlign = 'center';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.position = 'relative';

      const formattedDate = new Date(certificate.implementation_date).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      tempDiv.innerHTML = `
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&family=Dancing+Script:wght@400;700&family=Allura:wght@400&display=swap" rel="stylesheet">
        <div style="text-align: center; line-height: 1.6; position: relative; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
          <!-- Logo no topo -->
          <div style="display: flex; justify-content: center; margin-bottom: 20px;">
            <div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
              <img src="/lovable-uploads/332ff44b-8628-4122-b080-843e65b0882f.png" alt="Viver de IA" style="width: 100%; height: 100%; object-fit: contain;" />
            </div>
          </div>
          
          <!-- Conteúdo principal -->
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
            <h1 style="font-size: 48px; margin-bottom: 10px; font-weight: bold; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">CERTIFICADO</h1>
            <p style="font-size: 20px; margin-bottom: 30px; color: rgba(255,255,255,0.9);">de Implementação de Solução</p>
            
            <p style="font-size: 18px; margin-bottom: 20px; color: rgba(255,255,255,0.9);">Certificamos que</p>
            
            <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 12px; margin: 20px 0; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
              <h2 style="font-size: 28px; font-weight: bold; margin: 0; color: white;">${userProfile.name}</h2>
            </div>
            
            <p style="font-size: 18px; margin: 20px 0; color: rgba(255,255,255,0.9);">concluiu com sucesso a implementação da solução</p>
            
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2); margin: 20px 0;">
              <h3 style="font-size: 22px; margin: 0; margin-bottom: 8px; color: white; font-weight: 600;">${certificate.solutions.title}</h3>
              <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">Categoria: ${certificate.solutions.category}</p>
            </div>
            
            <p style="font-size: 16px; margin: 20px 0; color: rgba(255,255,255,0.9);">em <span style="font-weight: 600;">${formattedDate}</span></p>
          </div>
          
          <!-- Footer com código de validação e assinatura -->
          <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 25px; margin-top: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: end; margin-bottom: 15px;">
              <!-- Código de validação -->
              <div style="text-align: left;">
                <p style="font-size: 12px; color: rgba(255,255,255,0.7); margin: 0; margin-bottom: 5px;">Código de Validação:</p>
                <p style="font-family: monospace; color: white; margin: 0; font-size: 13px; font-weight: 600;">${certificate.validation_code}</p>
              </div>
              
              <!-- Assinatura -->
              <div style="text-align: right;">
                <div style="position: relative; width: 280px; height: 40px; border-bottom: 1px solid rgba(255,255,255,0.3); display: flex; align-items: end; margin-bottom: 5px;">
                  <p style="font-family: 'Great Vibes', 'Allura', 'Dancing Script', cursive; font-size: 36px; margin: 0; color: white; transform: rotate(-2deg); text-shadow: 2px 2px 4px rgba(0,0,0,0.4); letter-spacing: 2px; font-weight: 400; margin-bottom: 4px;">Rafael G Milagre</p>
                </div>
                <p style="font-size: 11px; color: rgba(255,255,255,0.7); margin: 0; margin-top: 8px;">Founder do Viver de IA</p>
              </div>
            </div>
            
            <div style="text-align: center;">
              <p style="font-size: 12px; color: rgba(255,255,255,0.6); margin: 0;">
                Emitido por <span style="color: white; font-weight: 600;">Viver de IA</span>
              </p>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(tempDiv);

      // Aguardar um pouco para garantir que as fontes carregaram
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Capturar como imagem
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        allowTaint: true,
        foreignObjectRendering: true
      });

      // Gerar PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 297; // A4 landscape width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`certificado-${certificate.solutions.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);

      // Remover elemento temporário
      document.body.removeChild(tempDiv);
      
      toast.success('Certificado baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast.error('Erro ao fazer download do certificado');
    }
  };

  return {
    certificate: data?.certificate,
    isEligible: data?.isEligible || false,
    isLoading,
    error,
    generateCertificate: generateCertificate.mutate,
    isGenerating: generateCertificate.isPending,
    downloadCertificate
  };
};
