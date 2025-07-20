
import { Textarea } from "@/components/ui/textarea";

interface VisualTopicEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const VisualTopicEditor = ({ 
  content, 
  onChange, 
  placeholder = "Escreva seu conteúdo..." 
}: VisualTopicEditorProps) => {
  return (
    <Textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-h-[200px] resize-none"
      rows={8}
    />
  );
};
