
import { ReactNode } from 'react';

interface ForumLayoutProps {
  children: ReactNode;
}

export const ForumLayout = ({ children }: ForumLayoutProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      {children}
    </div>
  );
};
