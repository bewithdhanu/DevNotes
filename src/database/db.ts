import Dexie from 'dexie';
import type { Table } from 'dexie';

// Types for database records (with optional id)
export interface DBNote {
  id?: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TempContent {
  id: 'editor';
  content: string;
}

// Types for application use (with required id)
export interface Note extends Omit<DBNote, 'id'> {
  id: number;
}

class NotesDatabase extends Dexie {
  notes!: Table<DBNote>;
  tempContent!: Table<TempContent>;

  constructor() {
    super('NotesDB');
    
    // Define all tables and indexes
    this.version(1).stores({
      notes: '++id, content, created_at, updated_at'
    });

    // Add tempContent table in version 2
    this.version(2).stores({
      notes: '++id, content, created_at, updated_at',
      tempContent: 'id'
    }).upgrade(tx => {
      // Initialize tempContent with empty content if needed
      return tx.table('tempContent').put({ id: 'editor', content: '' });
    });
  }

  async saveTempContent(content: string) {
    try {
      await this.tempContent.put({ id: 'editor', content });
    } catch (error) {
      console.error('Error saving temp content:', error);
    }
  }

  async getTempContent(): Promise<string> {
    try {
      const temp = await this.tempContent.get('editor');
      return temp?.content || '';
    } catch (error) {
      console.error('Error getting temp content:', error);
      return '';
    }
  }

  async clearTempContent() {
    try {
      await this.tempContent.put({ id: 'editor', content: '' });
    } catch (error) {
      console.error('Error clearing temp content:', error);
    }
  }

  // Search with improved matching
  async searchNotes(query: string): Promise<Note[]> {
    const allNotes = await this.notes.toArray();
    const searchTerm = query.toLowerCase();
    
    return allNotes
      .filter((note): note is Note => note.id !== undefined)
      .map(note => {
        const content = note.content.toLowerCase();
        // Check if content contains the exact search term
        const exactMatch = content.includes(searchTerm);
        // Calculate Levenshtein distance only if no exact match
        const distance = exactMatch ? 0 : this.levenshteinDistance(searchTerm, content);
        
        return { note, distance, exactMatch };
      })
      .filter(({ distance, exactMatch }) => exactMatch || distance < 3)
      .sort((a, b) => {
        // Prioritize exact matches, then by Levenshtein distance
        if (a.exactMatch && !b.exactMatch) return -1;
        if (!a.exactMatch && b.exactMatch) return 1;
        return a.distance - b.distance;
      })
      .map(({ note }) => note);
  }

  // Improved Levenshtein distance for substrings
  private levenshteinDistance(needle: string, haystack: string): number {
    if (needle.length === 0) return haystack.length;
    if (haystack.length === 0) return needle.length;

    // Check for substring matches first
    if (haystack.includes(needle)) return 0;

    let minDistance = needle.length; // Initialize with maximum possible distance

    // Slide through the haystack looking for the best match
    for (let i = 0; i <= haystack.length - needle.length; i++) {
      const substring = haystack.substr(i, needle.length);
      const distance = this.calculateLevenshtein(needle, substring);
      minDistance = Math.min(minDistance, distance);
    }

    return minDistance;
  }

  private calculateLevenshtein(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => 
      Array(a.length + 1).fill(null)
    );

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }

    return matrix[b.length][a.length];
  }

  async getNotes(page: number = 0, limit: number = 20): Promise<Note[]> {
    const dbNotes = await this.notes
      .orderBy('created_at')
      .reverse()
      .offset(page * limit)
      .limit(limit)
      .toArray();

    return dbNotes
      .filter((note): note is Note => note.id !== undefined)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getNotesForDate(
    startDate: string,
    endDate: string,
    page: number = 0,
    limit: number = 20
  ): Promise<Note[]> {
    const dbNotes = await this.notes
      .where('created_at')
      .between(startDate, endDate)
      .reverse()
      .offset(page * limit)
      .limit(limit)
      .toArray();

    // Sort again to ensure correct order
    return dbNotes
      .filter((note): note is Note => note.id !== undefined)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createNote(content: string, created_at?: string, updated_at?: string) {
    return await this.notes.add({
      content,
      created_at: created_at || new Date().toISOString(),
      updated_at: updated_at || new Date().toISOString()
    });
  }

  async updateNote(id: number, content: string) {
    return await this.notes.update(id, {
      content,
      updated_at: new Date().toISOString()
    });
  }

  async deleteNote(id: number) {
    console.log('DB deleteNote called with id:', id);
    try {
      await this.notes.delete(id);
      console.log('DB delete successful');
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  async getDatesWithNotes(): Promise<Date[]> {
    const notes = await this.notes.toArray();
    const dates = notes.map(note => new Date(note.created_at));
    
    // Remove duplicates and sort in descending order
    return Array.from(new Set(
      dates.map(date => date.toISOString().split('T')[0])
    ))
    .map(dateStr => new Date(dateStr))
    .sort((a, b) => b.getTime() - a.getTime());
  }
}

// Create and export a single instance
export const dbManager = new NotesDatabase();

// Initialize the database
dbManager.on('ready', () => {
  // Ensure tempContent exists
  dbManager.transaction('rw', dbManager.tempContent, async () => {
    const temp = await dbManager.tempContent.get('editor');
    if (!temp) {
      await dbManager.tempContent.put({ id: 'editor', content: '' });
    }
  }).catch(err => {
    console.error('Error initializing temp content:', err);
  });
});