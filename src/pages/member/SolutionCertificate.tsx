
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Award, Download, Share2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

const SolutionCertificate = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();

  const { data: solution, isLoading: solutionLoading } = useQuery({
    queryKey: ["solution", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("solutions")
        .select("*")
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["progress", id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("solution_id", id!)
        .eq("user_id", user!.id)
        .eq("is_completed", true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const generatePDF = async () => {
    const element = document.getElementById("certificate");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`certificado-${solution?.slug || "solucao"}.pdf`);

      toast.success("Certificado baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar o certificado");
    }
  };

  const shareCertificate = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificado - ${solution?.title}`,
          text: `Completei a implementação da solução: ${solution?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Erro ao compartilhar:", error);
      }
    } else {
      // Fallback para copiar URL
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  if (solutionLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!progress || !solution) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Certificado não encontrado ou você ainda não completou esta solução.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Garantir que temos nome e email válidos
  const userName = profile?.name || profile?.email || "Usuário";
  const userEmail = profile?.email || "";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex gap-4">
        <Button onClick={generatePDF} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Baixar PDF
        </Button>
        <Button variant="outline" onClick={shareCertificate} className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Compartilhar
        </Button>
      </div>

      <div
        id="certificate"
        className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto border-8 border-primary/20"
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Award className="h-16 w-16 text-primary" />
          </div>

          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">CERTIFICADO</h1>
            <p className="text-lg text-muted-foreground">de Conclusão</p>
          </div>

          <div className="py-8">
            <p className="text-lg mb-4">Certificamos que</p>
            <h2 className="text-3xl font-bold text-foreground mb-4">{userName}</h2>
            <p className="text-lg">concluiu com sucesso a implementação da solução</p>
            <h3 className="text-2xl font-semibold text-primary mt-4 mb-6">
              {solution.title}
            </h3>

            <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Concluído em{" "}
                  {format(new Date(progress.completed_at!), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </div>
              <Badge variant="secondary">{solution.category}</Badge>
            </div>
          </div>

          <div className="pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              Este certificado foi emitido digitalmente pela plataforma
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              ID do Certificado: {progress.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionCertificate;
