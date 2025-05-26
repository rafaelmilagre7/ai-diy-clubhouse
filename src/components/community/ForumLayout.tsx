
import React from 'react';

interface ForumLayoutProps {
  children: React.ReactNode;
}

export const ForumLayout: React.FC<ForumLayoutProps> = ({ children }) => {
  return (
    <div className="max-w-4xl mx-auto">
      {children}
    </div>
  );
};
