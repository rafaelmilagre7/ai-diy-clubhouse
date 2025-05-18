
import { useCallback } from "react";

interface EditorCommandsOptions {
  getContent: () => string;
  updateContent: () => void;
}

export function useEditorCommands({ getContent, updateContent }: EditorCommandsOptions) {
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
  }, [updateContent]);

  const formatBold = useCallback(() => execCommand('bold'), [execCommand]);
  const formatItalic = useCallback(() => execCommand('italic'), [execCommand]);
  const formatUnorderedList = useCallback(() => execCommand('insertUnorderedList'), [execCommand]);
  const formatOrderedList = useCallback(() => execCommand('insertOrderedList'), [execCommand]);
  const formatLink = useCallback(() => {
    const url = prompt('Digite a URL do link:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);
  const formatCodeBlock = useCallback(() => execCommand('formatBlock', '<pre>'), [execCommand]);
  const formatQuote = useCallback(() => execCommand('formatBlock', '<blockquote>'), [execCommand]);
  const insertHTML = useCallback((html: string) => execCommand('insertHTML', html), [execCommand]);

  return {
    execCommand,
    formatBold,
    formatItalic,
    formatUnorderedList,
    formatOrderedList,
    formatLink,
    formatCodeBlock,
    formatQuote,
    insertHTML,
  };
}
