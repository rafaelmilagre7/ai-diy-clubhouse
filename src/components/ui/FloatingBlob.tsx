import React from 'react';
import { cn } from '@/lib/utils';

interface FloatingBlobProps {
  variant?: 'networking' | 'commercial' | 'partnership' | 'knowledge';
  size?: 'small' | 'medium' | 'large';
  position?: 1 | 2 | 3;
  className?: string;
}

export const FloatingBlob: React.FC<FloatingBlobProps> = ({
  variant = 'networking',
  size = 'medium',
  position = 1,
  className
}) => {
  const variantClasses = {
    networking: 'liquid-blob-1',
    commercial: 'liquid-blob-2',
    partnership: 'liquid-blob-3',
    knowledge: 'liquid-blob-1'
  };

  const sizeClasses = {
    small: 'w-[200px] h-[200px]',
    medium: 'w-[350px] h-[350px]',
    large: 'w-[500px] h-[500px]'
  };

  return (
    <div
      className={cn(
        'liquid-blob',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
    />
  );
};

interface FloatingBlobContainerProps {
  children: React.ReactNode;
  showBlobs?: boolean;
  blobCount?: number;
}

export const FloatingBlobContainer: React.FC<FloatingBlobContainerProps> = ({
  children,
  showBlobs = true,
  blobCount = 3
}) => {
  return (
    <div className="relative overflow-hidden">
      {showBlobs && (
        <>
          {blobCount >= 1 && (
            <FloatingBlob 
              variant="networking" 
              position={1} 
              size="large"
              className="absolute -top-[10%] -left-[10%]"
            />
          )}
          {blobCount >= 2 && (
            <FloatingBlob 
              variant="commercial" 
              position={2} 
              size="medium"
              className="absolute top-[50%] -right-[10%]"
            />
          )}
          {blobCount >= 3 && (
            <FloatingBlob 
              variant="partnership" 
              position={3} 
              size="medium"
              className="absolute -bottom-[10%] left-[30%]"
            />
          )}
        </>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
