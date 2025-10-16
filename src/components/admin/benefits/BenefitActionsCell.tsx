
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
    <div className="flex items-center gap-3">
      <Link to={`/admin/tools/${tool.id}`}>
        <Button 
          variant="outline" 
          size="sm"
          className="aurora-glass border-success/30 hover:border-success/50 hover:bg-success/10 text-success font-medium backdrop-blur-sm transition-all duration-300"
        >
          <Edit className="h-3 w-3 mr-1" />
          Editar
        </Button>
      </Link>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setAccessControlOpen(true)}
        className="aurora-glass border-operational/30 hover:border-operational/50 hover:bg-operational/10 text-operational font-medium backdrop-blur-sm transition-all duration-300"
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
