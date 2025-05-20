
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, AlertTriangle } from "lucide-react";

interface PostActionsProps {
  onReplyClick: () => void;
  isLocked?: boolean;
  isNestedReply?: boolean;
}

export const PostActions = ({ onReplyClick, isLocked, isNestedReply }: PostActionsProps) => {
  return (
    <div className="mt-4 flex items-center gap-2">
      {!isLocked && !isNestedReply && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onReplyClick}
          className="text-xs"
        >
          <MessageSquare className="h-3 w-3 mr-1" />
          Responder
        </Button>
      )}
      
      <Button variant="ghost" size="sm" className="text-xs">
        <ThumbsUp className="h-3 w-3 mr-1" />
        Curtir
      </Button>
      
      <Button variant="ghost" size="sm" className="text-xs">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Reportar
      </Button>
    </div>
  );
};
