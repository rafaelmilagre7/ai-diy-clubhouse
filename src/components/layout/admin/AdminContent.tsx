
import { ReactNode } from "react";

interface AdminContentProps {
  children: ReactNode;
}

export const AdminContent = ({ children }: AdminContentProps) => {
  return (
    <main className="flex-1 overflow-auto ml-64">
      <div className="h-full">
        {children}
      </div>
    </main>
  );
};
