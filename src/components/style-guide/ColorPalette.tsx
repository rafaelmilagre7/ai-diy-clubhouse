import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ColorSwatchProps {
  name: string;
  cssVar: string;
  className?: string;
  hex?: string;
  showCopy?: boolean;
}

export function ColorSwatch({ name, cssVar, className, hex, showCopy = true }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: `${text} copiado para a área de transferência`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group space-y-2">
      <div 
        className={cn(
          "h-24 rounded-lg border border-border relative overflow-hidden transition-all duration-200",
          "hover:scale-105 hover:shadow-lg cursor-pointer",
          className
        )}
        onClick={() => showCopy && copyToClipboard(cssVar)}
      >
        {showCopy && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              {copied ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <Copy className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{name}</p>
        <code className="text-xs text-muted-foreground">{cssVar}</code>
        {hex && <p className="text-xs text-muted-foreground">{hex}</p>}
      </div>
    </div>
  );
}

interface ColorPaletteProps {
  colors: ColorSwatchProps[];
  columns?: number;
}

export function ColorPalette({ colors, columns = 4 }: ColorPaletteProps) {
  return (
    <div className={cn(
      "grid gap-4",
      columns === 2 && "grid-cols-2",
      columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      columns === 5 && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
      columns === 8 && "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8"
    )}>
      {colors.map((color, idx) => (
        <ColorSwatch key={idx} {...color} />
      ))}
    </div>
  );
}