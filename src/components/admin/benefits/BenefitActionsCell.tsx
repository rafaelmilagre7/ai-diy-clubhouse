
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tool } from '@/types/toolTypes';
import { BenefitAccessControl } from '@/components/admin/tools/BenefitAccessControl';

interface BenefitActionsCellProps {
  tool: Tool;
}

export const BenefitActionsCell = ({ tool }: BenefitActionsCellProps) => {
  const [accessControlOpen, setAccessControlOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Link to={`/admin/tools/${tool.id}`}>
        <Button variant="outline" size="sm">
          <Edit className="h-3 w-3 mr-1" />
          Editar
        </Button>
      </Link>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setAccessControlOpen(true)}
      >
        <Shield className="h-3 w-3 mr-1" />
        Acesso
      </Button>
      
      <BenefitAccessControl
        open={accessControlOpen}
        onOpenChange={setAccessControlOpen}
        tool={tool}
      />
    </div>
  );
};
