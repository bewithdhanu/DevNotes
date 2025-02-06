import React, { useEffect, useRef } from 'react';
import type { Note } from '../../database/db';
import { formatDate, formatTime } from '../../utils/dateFormat';

interface NoteListProps {
  notes: Note[];
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onUpdate: (id: number, content: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  hasMore: boolean;
}

// Merge NoteItem into NoteList
const NoteItem: React.FC<{
  note: Note;
  date: string;
  showDate: boolean;
  onUpdate: (id: number, content: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}> = ({ note, date, showDate, onUpdate, onDelete }) => {
  const [content, setContent] = React.useState(note.content);
  const [isFocused, setIsFocused] = React.useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (content !== note.content && note.id) {
      const saveTimeout = setTimeout(() => {
        onUpdate(note.id, content);
      }, 500);
      return () => clearTimeout(saveTimeout);
    }
  }, [content, note.id, note.content, onUpdate]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!note.id) return;

    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await onDelete(note.id);
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  return (
    <>
      {showDate && (
        <div className="bg-editor-bg px-2 pt-0 first:pt-2">
          <h2 className="text-xs font-medium text-gray-400">
            {date}
          </h2>
        </div>
      )}
      <div className="mt-1">
        <div className="relative bg-editor-gutter rounded shadow-sm">
          {isFocused && (
            <div className="px-2 py-1.5 border-b border-gray-700">
              <button
                ref={deleteButtonRef}
                onClick={handleDelete}
                className="px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white 
                         cursor-pointer select-none"
                type="button"
              >
                Delete
              </button>
            </div>
          )}
          <div className="relative p-2">
            <span className="absolute top-2 right-2 text-xs text-gray-500 px-1.5 py-0.5 bg-editor-bg rounded">
              {formatTime(new Date(note.created_at))}
            </span>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                adjustTextareaHeight();
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={(e) => {
                if (!deleteButtonRef.current?.contains(e.relatedTarget as Node)) {
                  setIsFocused(false);
                }
              }}
              className="w-full bg-editor-gutter text-editor-text focus:outline-none resize-none 
                       font-mono text-sm leading-5 whitespace-pre-wrap overflow-hidden border-0
                       m-0 p-0"
              spellCheck="false"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  onScroll,
  onUpdate,
  onDelete,
  hasMore
}) => {
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (hasMore) {
      onScroll(e);
    }
  };

  return (
    <div 
      className="px-4 pb-4 h-[calc(100vh-120px)] overflow-y-auto"
      onScroll={handleScroll}
    >
      <div className="space-y-2">
        {notes.map((note: Note, index: number) => {
          const date = formatDate(new Date(note.created_at));
          const showDate = index === 0 || 
            formatDate(new Date(notes[index - 1].created_at)) !== date;

          return (
            <NoteItem 
              key={note.id}
              note={note}
              date={date}
              showDate={showDate}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          );
        })}
      </div>
      {hasMore && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Scroll for more...
        </div>
      )}
    </div>
  );
}; 