
import { Textarea } from "@/components/ui/textarea";

interface QuickPostEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const QuickPostEditor = ({ 
  content, 
  onChange, 
  placeholder = "Escreva algo rápido..." 
}: QuickPostEditorProps) => {
  return (
    <Textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-h-[100px] resize-none"
      rows={4}
    />
  );
};
