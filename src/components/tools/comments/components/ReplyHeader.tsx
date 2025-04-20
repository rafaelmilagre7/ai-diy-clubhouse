
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Comment } from '@/types/commentTypes';

interface ReplyHeaderProps {
  replyTo: Comment | null;
  onCancelReply: () => void;
}

export const ReplyHeader = ({ replyTo, onCancelReply }: ReplyHeaderProps) => {
  if (!replyTo) return null;
  
  return (
    <div className="mb-3 flex items-center justify-between bg-gray-50 p-2 rounded">
      <div className="text-sm">
        Respondendo a <span className="font-medium">{replyTo.profile?.name}</span>
      </div>
      <Button 
        type="button" 
        variant="ghost" 
        size="sm" 
        onClick={onCancelReply}
        className="h-6 w-6 p-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
