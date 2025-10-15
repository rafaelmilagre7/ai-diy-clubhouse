import { X, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReplyPreviewProps {
  repliedMessage: {
    id: string;
    content: string;
    senderName: string;
  };
  onCancel: () => void;
  className?: string;
}

export const ReplyPreview = ({
  repliedMessage,
  onCancel,
  className,
}: ReplyPreviewProps) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 bg-muted/50 border-l-2 border-primary',
        className
      )}
    >
      <Reply className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-primary">
          {repliedMessage.senderName}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {repliedMessage.content}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={onCancel}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
};
