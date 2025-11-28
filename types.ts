export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export interface NoteStore {
  notes: Note[];
  addNote: () => void;
  deleteNote: (id: string) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  getNote: (id: string) => Note | undefined;
}
