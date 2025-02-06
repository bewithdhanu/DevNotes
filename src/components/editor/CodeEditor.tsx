import React, { useState, useEffect, useRef } from 'react';
import { dbManager } from '../../database/db';

interface CodeEditorProps {
  onSubmit: (content: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Load temp content on mount
  useEffect(() => {
    const loadTempContent = async () => {
      try {
        setIsLoading(true);
        const savedContent = await dbManager.getTempContent();
        setContent(savedContent);
      } catch (error) {
        console.error('Error loading temp content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTempContent();
  }, []);

  // Save to temp storage whenever content changes
  useEffect(() => {
    if (!isLoading) {  // Don't save while initial loading
      const saveTempContent = async () => {
        await dbManager.saveTempContent(content);
      };
      saveTempContent();
    }
  }, [content, isLoading]);

  const handleSave = async () => {
    if (content.trim()) {
      onSubmit(content);
      setContent('');
      await dbManager.clearTempContent();
    }
  };

  const handleCancel = async () => {
    setContent('');
    await dbManager.clearTempContent();
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '0';
      textarea.style.height = `${textarea.scrollHeight - 1}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [content]);

  return (
    <div className="bg-editor-gutter rounded shadow-sm">
      {content.trim() && (
        <div className="flex items-center gap-2 px-2 py-1.5 border-b border-gray-700">
          <button
            onClick={handleSave}
            className="px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-xs rounded hover:bg-gray-700 text-gray-300"
          >
            Cancel
          </button>
        </div>
      )}
      <div className="p-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            adjustTextareaHeight();
          }}
          placeholder="Type your note here..."
          className="w-full bg-editor-gutter text-editor-text focus:outline-none resize-none 
                   font-mono text-sm leading-5 whitespace-pre-wrap overflow-hidden border-0
                   m-0 p-0"
          spellCheck="false"
        />
      </div>
    </div>
  );
}; 