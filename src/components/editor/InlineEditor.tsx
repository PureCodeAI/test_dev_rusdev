import { useState, useRef, useEffect } from 'react';
import { RichTextToolbar } from './RichTextToolbar';

interface InlineEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  tag?: 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
}

export const InlineEditor = ({
  value,
  onChange,
  onBlur,
  placeholder = 'Кликните для редактирования',
  className = '',
  tag = 'div',
  isEditing,
  onEditStart,
  onEditEnd
}: InlineEditorProps) => {
  const editorRef = useRef<HTMLElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection && editorRef.current.firstChild) {
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!isEditing) {
      onEditStart();
    }
  };

  const handleBlur = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
    setShowToolbar(false);
    onEditEnd();
    if (onBlur) {
      onBlur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertLineBreak');
    }
    if (e.key === 'Escape') {
      handleBlur();
    }
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0 && isEditing) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarPosition({
        top: rect.top - 50,
        left: rect.left + rect.width / 2
      });
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      document.addEventListener('selectionchange', handleSelectionChange);
      return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
      };
    }
  }, [isEditing]);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const Tag = tag as keyof JSX.IntrinsicElements;

  if (!isEditing) {
    return (
      <Tag
        className={className}
        onDoubleClick={handleDoubleClick}
        dangerouslySetInnerHTML={{ __html: value || placeholder }}
        style={{ 
          cursor: 'text',
          minHeight: '1.5em',
          color: !value ? '#999' : 'inherit'
        }}
      />
    );
  }

  return (
    <>
      <Tag
        ref={editorRef as any}
        contentEditable
        className={className}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: value || '' }}
        style={{ 
          outline: '2px solid #3b82f6',
          outlineOffset: '2px',
          minHeight: '1.5em'
        }}
      />
      {showToolbar && (
        <RichTextToolbar
          position={toolbarPosition}
          onFormat={handleFormat}
        />
      )}
    </>
  );
};

