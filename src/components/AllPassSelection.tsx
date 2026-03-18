import React from 'react';
import { semesters } from '../data/subjects';
import { CheckCircle2, Circle } from 'lucide-react';

interface Props {
  selected: string[];
  onChange: (selected: string[]) => void;
  onSubmit: () => void;
}

export function AllPassSelection({ selected, onChange, onSubmit }: Props) {
  const toggleSem = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <h2 className="text-2xl font-semibold mb-2">All-Pass Semesters</h2>
      <p className="text-slate-500 mb-6">Select the semesters where you have passed ALL subjects. This will skip the detailed form for these semesters.</p>
      
      <div className="space-y-3 mb-8">
        {semesters.map(sem => {
          const isSelected = selected.includes(sem.id);
          return (
            <button
              key={sem.id}
              type="button"
              onClick={() => toggleSem(sem.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                isSelected 
                  ? 'border-indigo-600 bg-indigo-50/50' 
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <span className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                {sem.title}
              </span>
              {isSelected ? (
                <CheckCircle2 className="w-6 h-6 text-indigo-600" />
              ) : (
                <Circle className="w-6 h-6 text-slate-300" />
              )}
            </button>
          );
        })}
      </div>

      <button 
        onClick={onSubmit}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors"
      >
        Continue to Details
      </button>
    </div>
  );
}
