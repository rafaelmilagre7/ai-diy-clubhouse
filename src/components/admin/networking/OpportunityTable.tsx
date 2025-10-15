import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, ToggleLeft, ToggleRight, ArrowUpDown } from 'lucide-react';
import { Opportunity } from '@/hooks/networking/useOpportunities';
import { formatRelativeDate } from '@/lib/utils';
import { motion } from 'framer-motion';

interface OpportunityTableProps {
  opportunities: Opportunity[];
  onView: (opportunity: Opportunity) => void;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const opportunityTypeLabels: Record<string, { label: string; emoji: string }> = {
  parceria: { label: 'Parceria', emoji: '🤝' },
  fornecedor: { label: 'Fornecedor', emoji: '📦' },
  cliente: { label: 'Cliente', emoji: '💼' },
  investimento: { label: 'Investimento', emoji: '💰' },
  outro: { label: 'Outro', emoji: '🎯' },
};

export const OpportunityTable = ({
  opportunities,
  onView,
  onToggle,
  onDelete,
  loading,
}: OpportunityTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }]);

  const columns: ColumnDef<Opportunity>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-white/5"
        >
          Título
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p className="font-medium truncate">{row.original.title}</p>
          <p className="text-xs text-muted-foreground truncate">{row.original.description}</p>
        </div>
      ),
    },
    {
      accessorKey: 'profiles',
      header: 'Autor',
      cell: ({ row }) => {
        const profile = row.original.profiles;
        return (
          <div>
            <p className="font-medium text-sm">{profile?.name || 'Sem nome'}</p>
            <p className="text-xs text-muted-foreground">{profile?.company_name || '—'}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'opportunity_type',
      header: 'Tipo',
      cell: ({ row }) => {
        const type = row.original.opportunity_type;
        const typeData = opportunityTypeLabels[type] || opportunityTypeLabels.outro;
        return (
          <Badge variant="outline" className="gap-1">
            <span>{typeData.emoji}</span>
            {typeData.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => {
        const tags = row.original.tags || [];
        if (tags.length === 0) return <span className="text-muted-foreground text-sm">—</span>;
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-white/5"
        >
          Criado em
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm">{formatRelativeDate(row.original.created_at)}</span>
      ),
    },
    {
      accessorKey: 'views_count',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-white/5"
        >
          Views
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{row.original.views_count || 0}</span>
        </div>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'secondary'}>
          {row.original.is_active ? 'Ativa' : 'Inativa'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(row.original)}
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggle(row.original.id, !row.original.is_active)}
            className="h-8 w-8"
          >
            {row.original.is_active ? (
              <ToggleRight className="h-4 w-4 text-success" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original.id)}
            className="h-8 w-8 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: opportunities,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return (
      <div className="liquid-glass-card p-8 rounded-xl">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="liquid-glass-card rounded-xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-white/10 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="sticky top-0 bg-background/95 backdrop-blur">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhuma oportunidade encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
