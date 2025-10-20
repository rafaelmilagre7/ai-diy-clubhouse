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
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Spacing</Badge>;
      case 'typography':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">Typography</Badge>;
      case 'color':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Color</Badge>;
      case 'shadow':
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">Shadow</Badge>;
      case 'radius':
        return <Badge variant="outline" className="bg-pink-500/10 text-pink-500 border-pink-500/20">Radius</Badge>;
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