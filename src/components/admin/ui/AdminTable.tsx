import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminCard } from './AdminCard';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface AdminTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
  onRowClick?: (item: T, index: number) => void;
  variant?: 'default' | 'compact' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Tabela padrão do admin com design system Aurora
 * Suporte a diferentes variantes, loading states e interatividade
 */
export function AdminTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyState,
  className,
  onRowClick,
  variant = 'default',
  size = 'md'
}: AdminTableProps<T>) {
  const variants = {
    default: '',
    compact: '[&_td]:py-2 [&_th]:py-2',
    bordered: '[&_td]:border-r [&_td]:border-border/30 [&_th]:border-r [&_th]:border-border/30'
  };

  const sizes = {
    sm: '[&_td]:px-2 [&_th]:px-2 [&_td]:text-sm [&_th]:text-sm',
    md: '[&_td]:px-4 [&_th]:px-4',
    lg: '[&_td]:px-6 [&_th]:px-6 [&_td]:text-lg [&_th]:text-lg'
  };

  const LoadingSkeleton = () => (
    <TableBody>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          {columns.map((column, colIndex) => (
            <TableCell key={colIndex}>
              <div className="h-4 bg-muted animate-pulse rounded" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );

  const EmptyState = () => (
    <TableBody>
      <TableRow>
        <TableCell colSpan={columns.length} className="h-32">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            {emptyState || (
              <>
                <p className="text-body text-text-muted">
                  Nenhum item encontrado
                </p>
                <p className="text-body-small text-text-muted">
                  Tente ajustar os filtros ou adicionar novos dados
                </p>
              </>
            )}
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  );

  const getValue = (item: T, key: keyof T | string): any => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], item);
    }
    return item[key as keyof T];
  };

  return (
    <AdminCard className={className}>
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table className={cn(
            'w-full',
            variants[variant],
            sizes[size]
          )}>
            <TableHeader>
              <TableRow className="border-b border-border/50">
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className={cn(
                      'text-text-secondary font-medium bg-surface-base',
                      column.width && `w-[${column.width}]`,
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            {loading ? (
              <LoadingSkeleton />
            ) : data.length === 0 ? (
              <EmptyState />
            ) : (
              <TableBody>
                {data.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.2, 
                      delay: index * 0.05,
                      ease: 'easeOut' 
                    }}
                    className={cn(
                      'border-b border-border/30 transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-surface-elevated'
                    )}
                    onClick={() => onRowClick?.(item, index)}
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={colIndex}
                        className={cn(
                          'text-text-primary',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {column.render
                          ? column.render(item, index)
                          : String(getValue(item, column.key) || '-')
                        }
                      </TableCell>
                    ))}
                  </motion.tr>
                ))}
              </TableBody>
            )}
          </Table>
        </div>
      </div>
    </AdminCard>
  );
}