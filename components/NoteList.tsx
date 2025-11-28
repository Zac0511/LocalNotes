import React, { useState, useMemo } from 'react';
import { Note } from '../types';
import { Plus, Search, Trash2, FileText } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onAddNote: () => void;
  onDeleteNote: (id: string) => void;
  className?: string;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
  onAddNote,
  onDeleteNote,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotes = useMemo(() => {
    if (!searchTerm) return notes;
    const lowerTerm = searchTerm.toLowerCase();
    return notes.filter(
      (note) =>
        (note.title && note.title.toLowerCase().includes(lowerTerm)) ||
        (note.content && note.content.toLowerCase().includes(lowerTerm))
    );
  }, [notes, searchTerm]);

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  return (
    <div className={`flex flex-col h-full bg-gray-50 border-r border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            LocalNotes
          </h1>
          <button
            onClick={onAddNote}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm"
            aria-label="Create new note"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 px-6 text-center">
            <p>{searchTerm ? "No matches found." : "No notes yet."}</p>
            {!searchTerm && <p className="text-xs mt-1">Tap + to create one.</p>}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredNotes.map((note) => (
              <li key={note.id} className="group relative">
                <button
                  onClick={() => onSelectNote(note.id)}
                  className={`w-full text-left p-4 transition-colors hover:bg-white focus:outline-none ${
                    activeNoteId === note.id ? 'bg-white border-l-4 border-blue-600 shadow-sm' : 'border-l-4 border-transparent'
                  }`}
                >
                  <h3 className={`font-semibold truncate mb-1 ${!note.title ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                    {note.title || 'Untitled Note'}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 font-medium">
                    {formatDate(note.updatedAt)}
                  </p>
                  <p className="text-sm text-gray-600 truncate h-5">
                    {note.content || 'No additional text'}
                  </p>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if(window.confirm('Delete this note?')) onDeleteNote(note.id);
                  }}
                  className="absolute right-2 top-2 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-0 opacity-100 focus:opacity-100"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
