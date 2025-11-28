import React, { useState, useEffect } from 'react';
import { useNotes } from './hooks/useNotes';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';

const App: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  // If no note is active but notes exist (on desktop), select the first one on mount (optional)
  // But for simple "Apple Notes" feel, empty state is fine.
  
  const activeNote = notes.find((n) => n.id === activeNoteId);

  const handleAddNote = () => {
    const newId = addNote();
    setActiveNoteId(newId);
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-gray-900 font-sans">
      {/* Sidebar: Visible on desktop, or mobile when no note selected */}
      <div 
        className={`
          flex-shrink-0 w-full md:w-80 lg:w-96 h-full border-r border-gray-200 bg-gray-50
          ${activeNoteId ? 'hidden md:flex' : 'flex'}
        `}
      >
        <NoteList
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={setActiveNoteId}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          className="w-full h-full"
        />
      </div>

      {/* Editor: Visible on desktop, or mobile when note selected */}
      <div 
        className={`
          flex-1 h-full bg-white
          ${!activeNoteId ? 'hidden md:flex' : 'flex'}
        `}
      >
        {activeNote ? (
          <NoteEditor
            key={activeNote.id}
            note={activeNote}
            onChange={updateNote}
            onBack={() => setActiveNoteId(null)}
            className="w-full h-full"
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 select-none">
            <svg 
              className="w-24 h-24 mb-4 opacity-20" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p className="text-lg font-medium">Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
