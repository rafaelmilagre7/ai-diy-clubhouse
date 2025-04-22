
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AdminContentProps {
  className?: string;
  children: ReactNode;
}

export const AdminContent = ({ className, children }: AdminContentProps) => {
  return (
    <main className={cn("flex-1 overflow-auto p-4 md:p-6", className)}>
      {children}
    </main>
  );
};
