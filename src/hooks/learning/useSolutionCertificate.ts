import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { CERTIFICATE_LOGO_URL } from '@/lib/supabase/uploadCertificateLogo';

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
      tempDiv.style.width = '1000px';
      tempDiv.style.height = '700px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';

      // Usar a data de emissão em vez da data de implementação
      const issuedDate = certificate.issued_at || certificate.implementation_date;
      const formattedDate = new Date(issuedDate).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      tempDiv.innerHTML = `
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
        
        <div style="
          width: 100%; 
          height: 100%; 
          background: linear-gradient(135deg, #0ABAB5 0%, #00EAD9 30%, #6DF2E9 70%, #BFEBFF 100%);
          position: relative;
          overflow: hidden;
          color: white;
        ">
          <!-- Gradiente overlay sutil -->
          <div style="
            position: absolute;
            inset: 0;
            background: linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.15) 100%);
          "></div>
          
          <!-- Ornamentos dos cantos -->
          <div style="position: absolute; top: 24px; left: 24px; width: 64px; height: 64px; border-left: 2px solid rgba(255,255,255,0.2); border-top: 2px solid rgba(255,255,255,0.2);"></div>
          <div style="position: absolute; top: 24px; right: 24px; width: 64px; height: 64px; border-right: 2px solid rgba(255,255,255,0.2); border-top: 2px solid rgba(255,255,255,0.2);"></div>
          <div style="position: absolute; bottom: 24px; left: 24px; width: 64px; height: 64px; border-left: 2px solid rgba(255,255,255,0.2); border-bottom: 2px solid rgba(255,255,255,0.2);"></div>
          <div style="position: absolute; bottom: 24px; right: 24px; width: 64px; height: 64px; border-right: 2px solid rgba(255,255,255,0.2); border-bottom: 2px solid rgba(255,255,255,0.2);"></div>
          
          <!-- Círculos decorativos sutis -->
          <div style="position: absolute; top: 32px; left: 25%; width: 96px; height: 96px; border: 1px solid rgba(255,255,255,0.1); border-radius: 50%;"></div>
          <div style="position: absolute; bottom: 48px; right: 25%; width: 80px; height: 80px; border: 1px solid rgba(255,255,255,0.08); border-radius: 50%;"></div>

          <div style="
            position: relative; 
            z-index: 10; 
            padding: 32px; 
            height: 100%; 
            display: flex; 
            flex-direction: column;
            text-align: center;
          ">
            <!-- Logo -->
            <div style="display: flex; justify-content: center; margin-bottom: 24px;">
              <img src="${CERTIFICATE_LOGO_URL}" alt="Viver de IA" style="
                width: 256px; 
                height: 128px; 
                object-fit: contain;
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
              " crossorigin="anonymous" />
            </div>

            <!-- Header -->
            <div style="margin-bottom: 24px;">
              <div style="display: flex; justify-content: center; margin-bottom: 12px;">
                <div style="width: 96px; height: 1px; background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);"></div>
              </div>
              
              <h1 style="
                font-family: 'Playfair Display', serif; 
                font-size: 48px; 
                margin: 0 0 8px 0; 
                font-weight: 700; 
                color: white; 
                text-shadow: 0 4px 8px rgba(0,0,0,0.2); 
                letter-spacing: 2px;
              ">CERTIFICADO</h1>
              
              <p style="
                font-size: 20px; 
                color: rgba(255,255,255,0.95); 
                font-weight: 500; 
                margin: 0;
              ">de Implementação de Solução</p>
              
              <div style="display: flex; justify-content: center; margin-top: 12px;">
                <div style="width: 96px; height: 1px; background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);"></div>
              </div>
            </div>

            <!-- Conteúdo principal -->
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 16px;">
              <p style="font-size: 18px; color: rgba(255,255,255,0.9); font-weight: 500; margin: 0;">
                Certificamos que
              </p>
              
              <div style="
                padding: 24px 32px; 
                background: rgba(255,255,255,0.2); 
                border-radius: 12px; 
                backdrop-filter: blur(4px); 
                border: 1px solid rgba(255,255,255,0.3); 
                box-shadow: 0 8px 16px rgba(0,0,0,0.1);
              ">
                <h2 style="
                  font-family: 'Playfair Display', serif; 
                  font-size: 32px; 
                  font-weight: 700; 
                  margin: 0; 
                  color: white; 
                  letter-spacing: 1px;
                ">${userProfile.name}</h2>
              </div>
              
              <p style="font-size: 18px; color: rgba(255,255,255,0.9); font-weight: 500; margin: 0;">
                concluiu com sucesso a implementação da solução
              </p>
              
              <div style="
                padding: 24px 32px; 
                background: rgba(255,255,255,0.15); 
                border-radius: 12px; 
                border: 1px solid rgba(255,255,255,0.25); 
                box-shadow: 0 8px 16px rgba(0,0,0,0.1);
              ">
                <h3 style="
                  font-family: 'Playfair Display', serif; 
                  font-size: 24px; 
                  font-weight: 600; 
                  margin: 0 0 8px 0; 
                  color: white;
                ">${certificate.solutions.title}</h3>
                <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 16px;">Categoria: ${certificate.solutions.category}</p>
              </div>
              
              <p style="font-size: 18px; color: rgba(255,255,255,0.9); font-weight: 500; margin: 0;">
                em <span style="font-weight: 700; font-size: 20px; letter-spacing: 1px;">${formattedDate}</span>
              </p>
            </div>

            <!-- Footer -->
            <div style="padding-top: 24px; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.2);">
              <div style="display: flex; justify-content: space-between; align-items: end;">
                <!-- Código de validação -->
                <div style="text-align: left;">
                  <p style="font-size: 14px; color: rgba(255,255,255,0.8); margin: 0 0 8px 0; font-weight: 500;">Código de Validação:</p>
                  <div style="
                    background: rgba(255,255,255,0.15); 
                    backdrop-filter: blur(4px); 
                    padding: 8px 12px; 
                    border-radius: 8px; 
                    border: 1px solid rgba(255,255,255,0.2);
                  ">
                    <p style="font-family: monospace; color: white; margin: 0; font-size: 16px; font-weight: 700; letter-spacing: 2px;">${certificate.validation_code}</p>
                  </div>
                </div>
                
                <!-- Assinatura -->
                <div style="text-align: right;">
                  <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <p style="
                      font-family: 'Dancing Script', cursive; 
                      font-size: 40px; 
                      margin: 0 0 12px 0; 
                      color: white; 
                      transform: rotate(-1deg); 
                      filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3)); 
                      font-weight: 700; 
                      line-height: 1;
                    ">Rafael G Milagre</p>
                    <div style="width: 192px; height: 2px; background: linear-gradient(to right, rgba(255,255,255,0.2), rgba(255,255,255,0.6), rgba(255,255,255,0.2)); margin-bottom: 8px;"></div>
                    <p style="font-size: 14px; color: rgba(255,255,255,0.8); margin: 0; font-weight: 500;">Founder do Viver de IA</p>
                  </div>
                </div>
              </div>
              
              <div style="text-align: center; padding-top: 16px; margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
                <p style="font-size: 14px; color: rgba(255,255,255,0.7); margin: 0;">
                  Emitido por <span style="font-family: 'Playfair Display', serif; color: white; font-weight: 700;">Viver de IA</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(tempDiv);

      // Aguardar um pouco para garantir que as fontes carregaram
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Capturar como imagem com melhor qualidade
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        allowTaint: true,
        foreignObjectRendering: true,
        width: 1000,
        height: 700
      });

      // Gerar PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
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
