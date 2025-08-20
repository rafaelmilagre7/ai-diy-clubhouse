
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
          className="aurora-glass border-green-500/30 hover:border-green-500/50 hover:bg-green-500/10 text-green-500 font-medium backdrop-blur-sm transition-all duration-300"
        >
          <Edit className="h-3 w-3 mr-1" />
          Editar
        </Button>
      </Link>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setAccessControlOpen(true)}
        className="aurora-glass border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-500 font-medium backdrop-blur-sm transition-all duration-300"
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
