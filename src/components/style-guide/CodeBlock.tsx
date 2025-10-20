import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({ code, language = 'tsx', title, showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      title: "Código copiado!",
      description: "Código copiado para a área de transferência",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-muted/30">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">{language}</span>
        </div>
      )}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="absolute top-2 right-2 z-10 h-8 w-8 p-0"
        >
          {copied ? (
            <Check className="h-4 w-4 text-status-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-foreground/90">
            {showLineNumbers ? (
              <table className="w-full">
                <tbody>
                  {lines.map((line, idx) => (
                    <tr key={idx}>
                      <td className="pr-4 text-right text-muted-foreground select-none w-8">
                        {idx + 1}
                      </td>
                      <td>{line}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              code
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}