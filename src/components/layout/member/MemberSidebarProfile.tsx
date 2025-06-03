
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface MemberSidebarProfileProps {
  sidebarOpen: boolean;
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar?: string | null;
  getInitials: (name: string | null) => string;
}

export const MemberSidebarProfile: React.FC<MemberSidebarProfileProps> = ({
  sidebarOpen,
  profileName,
  profileEmail,
  profileAvatar,
  getInitials
}) => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <div className="border-t border-gray-700 p-4">
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profileAvatar || ''} />
          <AvatarFallback className="bg-viverblue text-white text-sm">
            {getInitials(profileName)}
          </AvatarFallback>
        </Avatar>
        
        {sidebarOpen && (
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {profileName || 'Usuário'}
            </p>
            <p className="text-gray-400 text-xs truncate">
              {profileEmail}
            </p>
          </div>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="w-full justify-start gap-2 text-gray-400 hover:text-white hover:bg-gray-800"
      >
        <LogOut size={16} />
        {sidebarOpen && <span>Sair</span>}
      </Button>
    </div>
  );
};
