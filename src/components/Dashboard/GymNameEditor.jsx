import { useState, useEffect } from 'react';

export default function GymNameEditor({ gymName, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(gymName || '');

  useEffect(() => {
    if (gymName) setValue(gymName);
  }, [gymName]);

  const handleSave = async () => {
    if (value.trim() && value.trim() !== gymName) {
      await onSave(value.trim());
    } else {
      setValue(gymName || '');
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input 
          autoFocus
          className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 text-2xl font-bold focus:outline-none focus:border-sky-500 w-full max-w-sm" 
          value={value} 
          onChange={e => setValue(e.target.value)} 
          onKeyDown={e => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setValue(gymName || '');
              setIsEditing(false);
            }
          }}
          onBlur={handleSave}
        />
      </div>
    );
  }

  return (
    <h1 
      onClick={() => setIsEditing(true)} 
      className="text-2xl sm:text-3xl font-bold text-white tracking-tight cursor-pointer hover:text-slate-300 transition-colors flex items-center gap-2 group"
      title="Click to edit gym name"
    >
      {gymName || 'Your Gym'}
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors opacity-0 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </h1>
  );
}
