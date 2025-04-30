import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

export const Rating = ({ value = 0, onChange, size = 'md', readonly = false }: RatingProps) => {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          className={cn(
            'text-yellow-400 transition-colors',
            readonly ? 'cursor-default' : 'hover:text-yellow-500',
          )}
          disabled={readonly}
        >
          <Star
            className={cn(
              sizeClasses[size],
              star <= value ? 'fill-current' : 'fill-none'
            )}
          />
          <span className="sr-only">{star} stars</span>
        </button>
      ))}
    </div>
  );
}; 