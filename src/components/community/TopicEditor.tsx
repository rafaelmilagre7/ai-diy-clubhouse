
import { Textarea } from "@/components/ui/textarea";

interface TopicEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const TopicEditor = ({ 
  content, 
  onChange, 
  placeholder = "Descreva seu tópico em detalhes..." 
}: TopicEditorProps) => {
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
