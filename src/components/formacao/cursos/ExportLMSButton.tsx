import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useLMSStructure } from "@/hooks/learning/useLMSStructure";
import { csvExporter } from "@/utils/csvExporter";
import { useToastModern } from "@/hooks/useToastModern";
import { format } from "date-fns";

export const ExportLMSButton = () => {
  const { data: structureData, isLoading, refetch } = useLMSStructure();
  const { showSuccess, showError } = useToastModern();

  const handleExport = async () => {
    try {
      // Refetch para garantir dados atualizados
      const { data } = await refetch();
      
      if (!data || data.length === 0) {
        showError("Nenhum dado encontrado", "Não há estrutura do LMS para exportar.");
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

      showSuccess("Exportação concluída!", `${data.length} registros exportados com sucesso.`);
    } catch (error) {
      console.error('Erro ao exportar estrutura do LMS:', error);
      showError("Erro na exportação", "Não foi possível exportar a estrutura do LMS.");
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
