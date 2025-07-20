
import React from "react";

interface ForumLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export const ForumLayout = ({ children, sidebar }: ForumLayoutProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-6">
      <div className="lg:col-span-3">
        <div className="relative">
          {/* Glow effect sutil */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-30"></div>
          <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
            <div className="p-1 bg-gradient-to-r from-primary/10 via-transparent to-accent/10">
              <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {sidebar && (
        <div className="lg:col-span-1">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-primary/20 rounded-2xl blur opacity-30"></div>
            <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
              {sidebar}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
