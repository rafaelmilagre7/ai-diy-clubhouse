import React from 'react';
import { cn } from '@/lib/utils';
import { LessonTag } from '@/lib/supabase/types/learning';

interface TagBadgeProps {
  tag: LessonTag;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  clickable?: boolean;
  onClick?: (tag: LessonTag) => void;
  className?: string;
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  size = 'md',
  variant = 'default',
  clickable = false,
  onClick,
  className
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const handleClick = () => {
    if (clickable && onClick) {
      onClick(tag);
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full transition-all duration-200',
        sizeClasses[size],
        variant === 'default' ? 'text-white' : 'border-2',
        clickable && 'cursor-pointer hover:scale-105 hover:shadow-md',
        className
      )}
      style={{
        backgroundColor: variant === 'default' ? tag.color : 'transparent',
        borderColor: variant === 'outline' ? tag.color : undefined,
        color: variant === 'outline' ? tag.color : undefined
      }}
      onClick={handleClick}
      title={tag.description || tag.name}
    >
      {tag.name}
    </span>
  );
};