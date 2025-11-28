import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';

const STORAGE_KEY = 'localnotes-data-v1';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load notes', e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const addNote = useCallback(() => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    return newNote.id;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note
      )
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  return { notes, addNote, updateNote, deleteNote };
};
