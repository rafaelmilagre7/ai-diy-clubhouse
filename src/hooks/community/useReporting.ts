
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export type ReportType = 'topic' | 'post';

interface ReportData {
  type: ReportType;
  targetId: string;
  reportedUserId: string;
  reason: string;
  description?: string;
}

interface CommunityReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  topic_id?: string;
  post_id?: string;
  report_type: ReportType;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  updated_at: string;
}

export const useReporting = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [currentReportData, setCurrentReportData] = useState<ReportData | null>(null);

  const openReportModal = (type: ReportType, targetId: string, reportedUserId: string) => {
    setCurrentReportData({
      type,
      targetId,
      reportedUserId,
      reason: '',
      description: ''
    });
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setCurrentReportData(null);
  };

  const submitReport = async (data: ReportData) => {
    if (!user) {
      toast.error('Você precisa estar logado para reportar conteúdo');
      return;
    }

    setIsSubmitting(true);

    try {
      const reportPayload = {
        reporter_id: user.id,
        reported_user_id: data.reportedUserId,
        report_type: data.type,
        reason: data.reason,
        description: data.description,
        ...(data.type === 'topic' ? { topic_id: data.targetId } : { post_id: data.targetId })
      };

      const { error } = await supabase
        .from('community_reports')
        .insert(reportPayload as any);

      if (error) throw error;

      toast.success('Denúncia enviada com sucesso. Nossa equipe irá analisar o conteúdo.');
      closeReportModal();
    } catch (error: any) {
      console.error('Erro ao enviar denúncia:', error);
      toast.error('Erro ao enviar denúncia. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitReport,
    isSubmitting,
    openReportModal,
    closeReportModal,
    isReportModalOpen,
    currentReportData
  };
};
