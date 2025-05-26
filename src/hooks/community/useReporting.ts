
import { useState } from 'react';
import { useModeration } from '@/hooks/admin/useModeration';

export const useReporting = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    type: 'topic' | 'post';
    id: string;
    userId?: string;
  } | null>(null);
  
  const { createReport } = useModeration();

  const openReportModal = (type: 'topic' | 'post', id: string, userId?: string) => {
    setReportTarget({ type, id, userId });
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setReportTarget(null);
  };

  const submitReport = async (reportData: {
    report_type: string;
    reason: string;
    description?: string;
  }) => {
    if (!reportTarget) return;

    const payload = {
      ...reportData,
      ...(reportTarget.type === 'topic' 
        ? { topic_id: reportTarget.id } 
        : { post_id: reportTarget.id }
      ),
      ...(reportTarget.userId && { reported_user_id: reportTarget.userId })
    };

    await createReport(payload);
    closeReportModal();
  };

  return {
    isReportModalOpen,
    reportTarget,
    openReportModal,
    closeReportModal,
    submitReport
  };
};
