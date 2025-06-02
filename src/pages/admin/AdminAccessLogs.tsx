
import React from 'react';
import { CourseAccessLogs } from '@/components/admin/courses/CourseAccessLogs';

const AdminAccessLogs: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Logs de Acesso</h1>
        <p className="text-muted-foreground">
          Monitore tentativas de acesso a cursos e recursos do sistema de aprendizado
        </p>
      </div>

      <CourseAccessLogs />
    </div>
  );
};

export default AdminAccessLogs;
