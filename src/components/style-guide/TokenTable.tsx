import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface Token {
  name: string;
  value: string;
  usage: string;
  type?: 'spacing' | 'typography' | 'color' | 'shadow' | 'radius' | 'other';
}

interface TokenTableProps {
  title: string;
  description?: string;
  tokens: Token[];
}

export function TokenTable({ title, description, tokens }: TokenTableProps) {
  const getTypeBadge = (type?: string) => {
    switch (type) {
      case 'spacing':
        return <Badge variant="outline" className="bg-status-info/10 text-status-info border-status-info/20">Spacing</Badge>;
      case 'typography':
        return <Badge variant="outline" className="bg-aurora-accent/10 text-aurora-accent border-aurora-accent/20">Typography</Badge>;
      case 'color':
        return <Badge variant="outline" className="bg-status-success/10 text-status-success border-status-success/20">Color</Badge>;
      case 'shadow':
        return <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning/20">Shadow</Badge>;
      case 'radius':
        return <Badge variant="outline" className="bg-aurora-secondary/10 text-aurora-secondary border-aurora-secondary/20">Radius</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="surface-elevated">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-table-sm">Token</TableHead>
                <TableHead className="w-table-md">Valor</TableHead>
                <TableHead>Uso</TableHead>
                {tokens.some(t => t.type) && <TableHead className="w-button-min">Tipo</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-mono text-sm">{token.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{token.value}</TableCell>
                  <TableCell className="text-sm">{token.usage}</TableCell>
                  {token.type && <TableCell>{getTypeBadge(token.type)}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}