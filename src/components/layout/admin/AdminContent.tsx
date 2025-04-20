
import { ReactNode } from "react";

interface AdminContentProps {
  children: ReactNode;
}

export const AdminContent = ({ children }: AdminContentProps) => {
  return (
    <main className="flex-1 p-4 md:p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  );
};
