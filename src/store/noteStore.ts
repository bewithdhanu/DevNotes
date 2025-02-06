import { create } from 'zustand';
import { dbManager as db } from '../database/db';
import type { Note } from '../database/db';

type State = {
  notes: Note[];
  deletedNote: Note | null;
  showUndo: boolean;
  hasMore: boolean;
};

type Actions = {
  loadNotes: (page: number, date?: Date) => Promise<void>;
  createNote: (content: string) => Promise<void>;
  searchNotes: (query: string) => Promise<void>;
  updateNote: (id: number, content: string) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  undoDelete: () => Promise<void>;
  clearUndo: () => void;
};

export const useNoteStore = create<State & Actions>((set, get) => ({
  notes: [],
  deletedNote: null,
  showUndo: false,
  hasMore: true,
  
  loadNotes: async (page: number, date?: Date) => {
    const limit = 20; // Notes per page
    let newNotes: Note[];
    
    if (date) {
      // Load date-filtered notes with pagination
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      newNotes = await db.getNotesForDate(startOfDay.toISOString(), endOfDay.toISOString(), page, limit);
    } else {
      // Load all notes with pagination
      newNotes = await db.getNotes(page, limit);
    }

    set((state) => ({
      notes: page === 0 ? newNotes : [...state.notes, ...newNotes],
      hasMore: newNotes.length === limit
    }));
  },
  
  createNote: async (content: string) => {
    await db.createNote(content);
    const notes = await db.getNotes(0);
    set({ notes });
  },
  
  searchNotes: async (query: string) => {
    const notes = await db.searchNotes(query);
    set({ notes });
  },

  updateNote: async (id: number, content: string) => {
    await db.updateNote(id, content);
    const notes = await db.getNotes(0);
    set({ notes });
  },

  deleteNote: async (id: number) => {
    try {
      const noteToDelete = get().notes.find(note => note.id === id);
      if (!noteToDelete) return;

      await db.deleteNote(id);
      const notes = await db.getNotes(0);
      
      set({ 
        notes,
        deletedNote: {
          ...noteToDelete,
          id: noteToDelete.id
        },
        showUndo: true
      });

      setTimeout(() => {
        set(state => {
          if (state.deletedNote?.id === id) {
            return { showUndo: false, deletedNote: null };
          }
          return state;
        });
      }, 5000);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  },

  undoDelete: async () => {
    const { deletedNote } = get();
    if (deletedNote) {
      // Pass the original timestamps when restoring
      await db.createNote(
        deletedNote.content,
        deletedNote.created_at,
        deletedNote.updated_at
      );
      const notes = await db.getNotes(0);
      set({ 
        notes,
        deletedNote: null,
        showUndo: false
      });
    }
  },

  clearUndo: () => {
    set({ 
      deletedNote: null,
      showUndo: false
    });
  }
}));