import React, { useState, useEffect } from 'react';
import { useNoteStore } from './store/noteStore';
import { NoteList } from './components/notes/NoteList';
import { CodeEditor } from './components/editor/CodeEditor';
import { useInfiniteScroll } from './hooks/useInfiniteScroll';
import { VerticalDatePicker } from './components/datepicker/VerticalDatePicker';
import './scripts/generateTestNotes';

// Merge Header component into App
const Header: React.FC<{
  searchQuery: string;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ searchQuery, onSearch }) => {
  return (
    <header className="sticky top-0 bg-editor-bg/95 backdrop-blur-sm z-10">
      <div className="px-4 py-2 border-b border-editor-line flex justify-end">
        <input
          type="text"
          value={searchQuery}
          onChange={onSearch}
          placeholder="Search notes..."
          className="w-64 bg-editor-gutter text-editor-text px-3 py-1 rounded
                   focus:outline-none text-sm"
        />
      </div>
    </header>
  );
};

// Merge UndoNotification into App.tsx
const UndoNotification = () => {
  const { showUndo, undoDelete, clearUndo } = useNoteStore();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearUndo();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [clearUndo]);

  if (!showUndo) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50
                    bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg 
                    flex items-center gap-3 animate-fade-in">
      <span>Note deleted</span>
      <button
        onClick={undoDelete}
        className="text-blue-400 hover:text-blue-300 font-medium"
      >
        Undo
      </button>
    </div>
  );
};

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { notes, hasMore, loadNotes, searchNotes, createNote, updateNote, deleteNote } = useNoteStore();

  useEffect(() => {
    if (searchQuery) {
      searchNotes(searchQuery);
    } else if (selectedDate) {
      loadNotes(0, selectedDate);
    } else {
      loadNotes(page);
    }
  }, [loadNotes, page, searchQuery, searchNotes, selectedDate]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query) {
      searchNotes(query);
    } else {
      loadNotes(0);
      setPage(0);
    }
  };

  const handleScroll = useInfiniteScroll((increment) => {
    if (hasMore && !searchQuery) {  // Don't paginate during search
      const nextPage = page + increment;
      setPage(nextPage);
      if (selectedDate) {
        loadNotes(nextPage, selectedDate);
      } else {
        loadNotes(nextPage);
      }
    }
  });

  const handleSubmit = (content: string) => {
    createNote(content);
  };

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    setPage(0);
  };

  const handleDateReset = () => {
    setSelectedDate(null);
    setPage(0);
    loadNotes(0);
  };

  return (
    <>
      <div className="min-h-screen bg-editor-bg flex flex-col overflow-hidden pr-16">
        <Header searchQuery={searchQuery} onSearch={handleSearch} />
        <div className="overflow-y-auto scroll-area">
          <div className="px-4 pt-4 flex-shrink-0">
            <CodeEditor onSubmit={handleSubmit} />
          </div>
          <div className="flex-1">
            <NoteList 
              notes={notes} 
              onScroll={handleScroll}
              onUpdate={updateNote}
              onDelete={deleteNote}
              hasMore={hasMore}
            />
          </div>
        </div>
        <VerticalDatePicker 
          onSelectDate={handleDateSelect}
          selectedDate={selectedDate}
          onReset={handleDateReset}
        />
      </div>
      <UndoNotification />
    </>
  );
}

export default App; 