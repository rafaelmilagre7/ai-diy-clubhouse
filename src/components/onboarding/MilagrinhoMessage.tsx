
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface MilagrinhoMessageProps {
  message: string;
}

export const MilagrinhoMessage: React.FC<MilagrinhoMessageProps> = ({ message }) => {
  return (
    <div className="flex items-start space-x-4 p-4 bg-[#0ABAB5]/10 rounded-lg">
      <div className="flex-shrink-0">
        <Avatar>
          <AvatarImage 
            src="/lovable-uploads/833bbb5d-5aa6-47f4-96d2-320bb57726cf.png" 
            alt="Milagrinho Avatar" 
          />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1">
        <p className="text-gray-700 dark:text-gray-200">{message}</p>
      </div>
    </div>
  );
};
