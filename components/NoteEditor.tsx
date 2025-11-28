import React, { useState, useRef, useEffect } from 'react';
import { Note } from '../types';
import { 
  ChevronLeft, 
  Clock, 
  Eye, 
  EyeOff, 
  Bold, 
  Italic, 
  List, 
  CheckSquare, 
  Heading1, 
  Heading2, 
  Code 
} from 'lucide-react';
import { marked } from 'marked';

interface NoteEditorProps {
  note: Note;
  onChange: (id: string, updates: Partial<Note>) => void;
  onBack: () => void; // For mobile view
  className?: string;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onChange,
  onBack,
  className = ''
}) => {
  // Initialize preview mode: if note has content/title, start in preview. Otherwise edit.
  const [isPreview, setIsPreview] = useState(() => {
    return (note.title.trim().length > 0 || note.content.trim().length > 0);
  });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!note) return null;

  // Auto-focus textarea when switching to edit mode
  useEffect(() => {
    if (!isPreview && textareaRef.current) {
      textareaRef.current.focus();
      // Optional: move cursor to end of content
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isPreview]);

  // Render markdown to HTML
  const getHtml = () => {
    try {
      // Use breaks: true to interpret newlines as <br>
      return { __html: marked.parse(note.content, { breaks: true }) as string };
    } catch (e) {
      return { __html: '<p class="text-red-500">Error rendering markdown</p>' };
    }
  };

  // Helper to insert markdown characters
  const insertFormat = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = note.content;
    
    // If wrapping text (like bold), we wrap the selection.
    // If inserting a line starter (like list), we insert at the beginning of the line(s) or cursor.
    // For simplicity in this lightweight app, we'll wrap/insert at cursor.
    
    const beforeText = text.substring(0, start);
    const selectedText = text.substring(start, end);
    const afterText = text.substring(end);

    const newText = `${beforeText}${before}${selectedText}${after}${afterText}`;
    onChange(note.id, { content: newText });

    // Restore focus and selection
    setTimeout(() => {
        textarea.focus();
        // If we selected text, keep it selected inside the formatting
        // If no text selected, cursor goes between formatting
        const newCursorStart = start + before.length;
        const newCursorEnd = end + before.length;
        textarea.setSelectionRange(newCursorStart, newCursorEnd);
    }, 0);
  };

  const ToolbarButton = ({ icon: Icon, onClick, title }: { icon: any, onClick: () => void, title: string }) => (
    <button
      onClick={onClick}
      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
      title={title}
    >
      <Icon className="w-5 h-5" />
    </button>
  );

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center">
            <button 
            onClick={onBack}
            className="mr-2 p-1 -ml-1 text-gray-600 hover:bg-gray-100 rounded-full"
            >
            <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="font-semibold text-gray-700">Edit Note</span>
        </div>
        <button
            onClick={() => setIsPreview(!isPreview)}
            className="text-blue-600 font-medium text-sm"
        >
            {isPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 md:p-8 overflow-hidden">
        {/* Meta Info & Title */}
        <div className="flex-shrink-0">
            <div className="mb-4 text-xs text-gray-400 flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(note.updatedAt).toLocaleString()}
                </div>
                {/* Desktop Toggle */}
                <button 
                    onClick={() => setIsPreview(!isPreview)}
                    className="hidden md:flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                    {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {isPreview ? 'Edit Mode' : 'Preview Mode'}
                </button>
            </div>
            
            <input
            type="text"
            value={note.title}
            onChange={(e) => onChange(note.id, { title: e.target.value })}
            placeholder="Note Title"
            className="text-3xl md:text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none bg-transparent w-full mb-6"
            />
        </div>

        {/* Toolbar (Only in Edit Mode) */}
        {!isPreview && (
            <div className="flex items-center gap-1 mb-2 pb-2 border-b border-gray-100 overflow-x-auto">
                <ToolbarButton icon={Bold} onClick={() => insertFormat('**', '**')} title="Bold" />
                <ToolbarButton icon={Italic} onClick={() => insertFormat('*', '*')} title="Italic" />
                <div className="w-px h-4 bg-gray-200 mx-2" />
                <ToolbarButton icon={Heading1} onClick={() => insertFormat('# ')} title="Heading 1" />
                <ToolbarButton icon={Heading2} onClick={() => insertFormat('## ')} title="Heading 2" />
                <div className="w-px h-4 bg-gray-200 mx-2" />
                <ToolbarButton icon={List} onClick={() => insertFormat('- ')} title="Bullet List" />
                <ToolbarButton icon={CheckSquare} onClick={() => insertFormat('- [ ] ')} title="Checklist" />
                <ToolbarButton icon={Code} onClick={() => insertFormat('```\n', '\n```')} title="Code Block" />
            </div>
        )}
        
        {/* Editor / Preview Area */}
        <div className="flex-1 relative overflow-y-auto">
            {isPreview ? (
                <div 
                    className="prose prose-slate prose-lg max-w-none pb-20"
                    dangerouslySetInnerHTML={getHtml()} 
                    onClick={() => setIsPreview(false)} 
                    style={{ cursor: 'text' }}
                    title="Click to edit"
                />
            ) : (
                <textarea
                    ref={textareaRef}
                    value={note.content}
                    onChange={(e) => onChange(note.id, { content: e.target.value })}
                    placeholder="Start typing markdown..."
                    className="w-full h-full resize-none text-base md:text-lg text-gray-700 placeholder-gray-300 border-none focus:ring-0 focus:outline-none bg-transparent leading-relaxed font-mono"
                />
            )}
        </div>
      </div>
    </div>
  );
};
