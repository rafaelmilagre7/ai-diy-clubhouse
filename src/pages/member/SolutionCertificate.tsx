
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import LoadingScreen from "@/components/common/LoadingScreen";

interface CertificateUser {
  name: string;
  email: string;
}

const SolutionCertificate = () => {
  const { solutionId } = useParams<{ solutionId: string }>();
  const { profile } = useAuth();

  const { data: solution, isLoading } = useQuery({
    queryKey: ['solution', solutionId],
    queryFn: async () => {
      if (!solutionId) throw new Error('ID da solução não fornecido');
      
      const { data, error } = await supabase
        .from('solutions')
        .select('title, description')
        .eq('id', solutionId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!solutionId
  });

  const generatePDF = async () => {
    try {
      const element = document.getElementById('certificate');
      if (!element) return;

      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`certificado-${solution?.title || 'solucao'}.pdf`);
      
      toast.success('Certificado baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar certificado');
    }
  };

  const shareCard = async () => {
    try {
      const url = window.location.href;
      await navigator.share({
        title: `Certificado - ${solution?.title}`,
        text: `Completei a solução "${solution?.title}" na plataforma!`,
        url: url
      });
    } catch (error) {
      // Fallback para copiar para clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para clipboard!');
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando certificado..." />;
  }

  if (!solution) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Solução não encontrada</h2>
        <p className="text-muted-foreground">
          A solução que você está procurando não existe.
        </p>
      </div>
    );
  }

  // Garantir que temos dados válidos para o certificado
  const certificateUser: CertificateUser = {
    name: profile?.name || 'Nome não informado',
    email: profile?.email || 'Email não informado'
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Certificado de Conclusão</h1>
        
        <div className="flex gap-2">
          <Button onClick={shareCard} variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar
          </Button>
          <Button onClick={generatePDF}>
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>
        </div>
      </div>

      <div 
        id="certificate"
        className="bg-gradient-to-br from-blue-50 to-indigo-100 p-12 rounded-lg border-4 border-blue-200 text-center min-h-[600px] flex flex-col justify-center"
      >
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">
            Certificado de Conclusão
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
        </div>

        <div className="mb-8">
          <p className="text-lg text-gray-700 mb-4">Certificamos que</p>
          <h3 className="text-3xl font-bold text-blue-900 mb-4">
            {certificateUser.name}
          </h3>
          <p className="text-lg text-gray-700 mb-4">
            concluiu com sucesso a solução
          </p>
          <h4 className="text-2xl font-semibold text-blue-800 mb-8">
            "{solution.title}"
          </h4>
        </div>

        <div className="mb-8">
          <p className="text-gray-600 mb-2">
            Data de conclusão: {new Date().toLocaleDateString('pt-BR')}
          </p>
          <p className="text-gray-600">
            Email: {certificateUser.email}
          </p>
        </div>

        <div className="flex justify-center items-center mt-auto">
          <div className="text-center">
            <div className="w-48 h-0.5 bg-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">Plataforma de IA</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionCertificate;
