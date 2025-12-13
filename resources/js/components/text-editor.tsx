/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState } from 'react';

interface Props {
  onChange: (html: string) => void;
  initialValue?: string;
  placeholder?: string;
}

interface ToolbarButton {
  cmd: string;
  label: string;
  arg?: string;
  prompt?: boolean;
}

const toolbarButtons: ToolbarButton[] = [
  { cmd: 'bold', label: '<b>B</b>' },
  { cmd: 'italic', label: '<i>I</i>' },
  { cmd: 'underline', label: '<u>U</u>' },
  { cmd: 'strikeThrough', label: '<s>S</s>' },
  { cmd: 'insertUnorderedList', label: '• List' },
  { cmd: 'insertOrderedList', label: '1. List' },
  { cmd: 'formatBlock', arg: 'h1', label: '<h1>H1</h1>' },
  { cmd: 'formatBlock', arg: 'h2', label: '<h2>H2</h2>' },
  { cmd: 'formatBlock', arg: 'h3', label: '<h3>H3</h3>' },
  { cmd: 'createLink', label: 'Link', prompt: true },
  { cmd: 'undo', label: '↺ Undo' },
  { cmd: 'redo', label: '↻ Redo' },
];

const CustomTextEditor: React.FC<Props> = ({ onChange, initialValue = '', placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeCommands, setActiveCommands] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize content
  useEffect(() => {
    if (editorRef.current && initialValue && !isInitialized) {
      editorRef.current.innerHTML = initialValue;
      placeCaretAtEnd(editorRef.current);
      setIsInitialized(true);
      updateToolbarState();
    }
  }, [initialValue, isInitialized]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            execCommand('bold');
            break;
          case 'i':
            e.preventDefault();
            execCommand('italic');
            break;
          case 'u':
            e.preventDefault();
            execCommand('underline');
            break;
          case 'z':
            e.preventDefault();
            execCommand('undo');
            break;
          case 'y':
            e.preventDefault();
            execCommand('redo');
            break;
        }
      }
    };
    editorRef.current?.addEventListener('keydown', handleKeyDown);
    return () => editorRef.current?.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update toolbar on selection change
  useEffect(() => {
    const handleSelectionChange = () => updateToolbarState();
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const updateContent = () => {
    const html = editorRef.current?.innerHTML || '';
    onChange(html);
    updateToolbarState();
  };

  const updateToolbarState = () => {
    const active: string[] = [];
    const selection = window.getSelection();
    const parent = selection?.anchorNode?.parentElement;

    toolbarButtons.forEach(({ cmd, arg }) => {
      try {
        if (cmd === 'formatBlock' && arg) {
          if (parent?.tagName.toLowerCase() === arg.toLowerCase()) active.push(cmd + arg);
        } else if (cmd === 'insertUnorderedList' || cmd === 'insertOrderedList') {
          // Check if inside a list
          if (parent?.closest(cmd === 'insertUnorderedList' ? 'ul' : 'ol')) active.push(cmd);
        } else if (document.queryCommandState(cmd)) {
          active.push(cmd);
        }
      } catch (e) {
        console.error(e);
      }
    });
    setActiveCommands(active);
  };

  const execCommand = (cmd: string, arg?: string, promptUser?: boolean) => {
    let value = arg || '';
    if (promptUser && cmd === 'createLink') {
      const url = prompt('Enter URL');
      if (!url) return;
      value = url;
    }
    document.execCommand(cmd, false, value);
    updateContent();
  };

  const placeCaretAtEnd = (el: HTMLElement) => {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  return (
    <div className="border p-2 rounded-md space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 border-b pb-2 text-sm">
        {toolbarButtons.map(({ cmd, arg, label, prompt }, i) => (
          <button
            key={i}
            type="button"
            className={`px-2 py-1 border rounded text-xs cursor-pointer transition ${
              activeCommands.includes(cmd + (arg || ''))
                ? 'dark:bg-gray-700/30 dark:text-white bg-gray-200/80 border-gray-400 dark:border-gray-600'
                : 'dark:hover:bg-gray-700/30 hover:bg-gray-200/80 hover:text-gray-900 dark:text-gray-300'
            }`}
            onClick={() => execCommand(cmd, arg, prompt)}
            dangerouslySetInnerHTML={{ __html: label }}
          />
        ))}
      </div>

      {/* Editable Area */}
        <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={updateContent}
        data-placeholder={placeholder || 'Start typing...'}
        className="editor-content min-h-[200px] p-3 border rounded focus:outline-none prose"
        style={{
            direction: 'ltr',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
        }}
        />

    </div>
  );
};

export default CustomTextEditor;
