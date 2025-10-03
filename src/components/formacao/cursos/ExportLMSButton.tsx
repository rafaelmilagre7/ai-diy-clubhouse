import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useLMSStructure } from "@/hooks/learning/useLMSStructure";
import { csvExporter } from "@/utils/csvExporter";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const ExportLMSButton = () => {
  const { data: structureData, isLoading, refetch } = useLMSStructure();
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      // Refetch para garantir dados atualizados
      const { data } = await refetch();
      
      if (!data || data.length === 0) {
        toast({
          title: "Nenhum dado encontrado",
          description: "Não há estrutura do LMS para exportar.",
          variant: "destructive",
        });
        return;
      }

      const headers = {
        curso: 'Curso',
        modulo: 'Módulo',
        aula: 'Aula',
        statusCurso: 'Status Curso',
        statusModulo: 'Status Módulo',
        statusAula: 'Status Aula',
        ordemCurso: 'Ordem Curso',
        ordemModulo: 'Ordem Módulo',
        ordemAula: 'Ordem Aula',
      };

      const filename = `estrutura-lms-${format(new Date(), 'yyyy-MM-dd')}.csv`;

      csvExporter.exportToCSV(data, headers, filename, {
        dateFormat: 'BR',
        includeHeaders: true,
      });

      toast({
        title: "Exportação concluída!",
        description: `${data.length} registros exportados com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao exportar estrutura do LMS:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar a estrutura do LMS.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      disabled={isLoading}
    >
      <Download className="h-4 w-4 mr-2" />
      {isLoading ? 'Carregando...' : 'Exportar Estrutura'}
    </Button>
  );
};
