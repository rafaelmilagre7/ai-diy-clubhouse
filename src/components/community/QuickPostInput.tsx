
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth";
import { TopicDialog } from "./editor/TopicDialog";

export function QuickPostInput() {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div 
        className="flex items-center gap-3 p-4 bg-background border rounded-lg shadow-sm cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(true)}
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
          <AvatarFallback>{getInitials(user?.user_metadata?.name || user?.email)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 text-muted-foreground text-sm px-3 py-2 bg-muted/50 rounded-full">
          Escreva algo...
        </div>
      </div>

      <TopicDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
