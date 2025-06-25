
import { useState, useEffect } from 'react';

interface InviteAuditItem {
  id: string;
  email: string;
  inviter_email: string;
  created_at: string;
  accepted: boolean;
}

interface UseInviteAuditDataProps {
  timeRange: string;
  searchQuery: string;
  statusFilter: string | null;
}

export const useInviteAuditData = ({ timeRange, searchQuery, statusFilter }: UseInviteAuditDataProps) => {
  const [auditData, setAuditData] = useState<InviteAuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data
    const mockData: InviteAuditItem[] = [
      {
        id: '1',
        email: 'usuario@exemplo.com',
        inviter_email: 'admin@exemplo.com',
        created_at: new Date().toISOString(),
        accepted: true
      }
    ];

    setTimeout(() => {
      setAuditData(mockData);
      setLoading(false);
    }, 1000);
  }, [timeRange, searchQuery, statusFilter]);

  const exportAuditLog = async ({ timeRange, searchQuery, statusFilter }: UseInviteAuditDataProps) => {
    console.log('Exportando auditoria:', { timeRange, searchQuery, statusFilter });
  };

  return { auditData, loading, error, exportAuditLog };
};
