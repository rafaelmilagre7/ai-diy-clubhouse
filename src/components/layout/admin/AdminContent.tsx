
import { ReactNode } from "react";

interface AdminContentProps {
  children: ReactNode;
}

export const AdminContent = ({ children }: AdminContentProps) => {
  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {children}
      </div>
    </main>
  );
};
