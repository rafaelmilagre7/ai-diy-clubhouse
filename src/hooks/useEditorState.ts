
import { useState, useRef, useEffect } from "react";

interface UseEditorStateOptions {
  initialContent?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
}

export function useEditorState({
  initialContent = '',
  onChange,
  placeholder = 'Digite aqui...'
}: UseEditorStateOptions = {}) {
  const [content, setContent] = useState(initialContent);
  const [isEmpty, setIsEmpty] = useState(!initialContent);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialContent !== content) {
      setContent(initialContent);
      setIsEmpty(!initialContent);
      
      if (editorRef.current) {
        editorRef.current.innerHTML = initialContent;
      }
    }
  }, [initialContent]);

  const updateContent = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContent(html);
      setIsEmpty(html === "" || html === "<br>");
      
      if (onChange) {
        onChange(html);
      }
    }
  };

  const getContent = () => {
    return editorRef.current?.innerHTML || content;
  };

  return {
    content,
    isEmpty,
    editorRef,
    placeholder,
    updateContent,
    getContent
  };
}
