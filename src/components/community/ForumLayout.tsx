
import React from "react";

interface ForumLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export const ForumLayout = ({ children, sidebar }: ForumLayoutProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <div className="bg-card shadow-sm rounded-lg">
          {children}
        </div>
      </div>
      {sidebar && (
        <div className="lg:col-span-1">
          {sidebar}
        </div>
      )}
    </div>
  );
};
