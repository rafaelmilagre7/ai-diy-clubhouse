
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";

export const useReporting = () => {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingItemId, setReportingItemId] = useState<string | null>(null);
  const [reportingItemType, setReportingItemType] = useState<'topic' | 'post' | null>(null);
  const [reportingUserId, setReportingUserId] = useState<string | null>(null);
  const { user } = useAuth();

  const openReportModal = (type: 'topic' | 'post', itemId: string, userId: string) => {
    setReportingItemType(type);
    setReportingItemId(itemId);
    setReportingUserId(userId);
    setReportModalOpen(true);
  };

  const closeReportModal = () => {
    setReportModalOpen(false);
    setReportingItemId(null);
    setReportingItemType(null);
    setReportingUserId(null);
  };

  const submitReport = async (data: {
    report_type: string;
    reason: string;
    description?: string;
  }) => {
    if (!user || !reportingItemId || !reportingItemType) {
      toast.error("Dados insuficientes para enviar o relatório");
      return;
    }

    try {
      // Definir tipo base do relatório
      interface BaseReportData {
        reporter_id: string;
        reported_user_id: string | null;
        report_type: string;
        reason: string;
        description?: string;
        status: string;
        topic_id?: string;
        post_id?: string;
      }

      const reportData: BaseReportData = {
        reporter_id: user.id,
        reported_user_id: reportingUserId,
        report_type: data.report_type,
        reason: data.reason,
        description: data.description,
        status: 'pending'
      };

      // Adicionar ID específico baseado no tipo
      if (reportingItemType === 'topic') {
        reportData.topic_id = reportingItemId;
      } else {
        reportData.post_id = reportingItemId;
      }

      const { error } = await supabase
        .from('community_reports')
        .insert([reportData]);

      if (error) throw error;

      toast.success("Relatório enviado com sucesso. Nossa equipe irá analisá-lo.");
      closeReportModal();
    } catch (error: any) {
      console.error("Erro ao enviar relatório:", error);
      toast.error("Erro ao enviar relatório. Tente novamente.");
    }
  };

  return {
    reportModalOpen,
    reportingItemType,
    openReportModal,
    closeReportModal,
    submitReport
  };
};
