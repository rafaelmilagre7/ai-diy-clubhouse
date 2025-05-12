
import React from 'react';
import { Comment } from '@/types/commentTypes';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReplyHeaderProps {
  replyTo: Comment | null;
  onCancelReply: () => void;
}

export const ReplyHeader = ({ replyTo, onCancelReply }: ReplyHeaderProps) => {
  if (!replyTo) return null;

  return (
    <div className="flex items-center justify-between p-3 mb-3 bg-viverblue/5 rounded-md border border-viverblue/20">
      <div className="flex items-center gap-2 text-sm">
        <MessageSquare className="h-4 w-4 text-viverblue" />
        <span className="text-textPrimary">
          Respondendo para <span className="font-medium">{replyTo.profiles?.name || 'Usuário'}</span>
        </span>
      </div>
      
      <Button 
        type="button" 
        variant="ghost" 
        size="sm" 
        onClick={onCancelReply} 
        className="h-6 w-6 p-0 text-textSecondary hover:bg-viverblue/10 hover:text-textPrimary"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
