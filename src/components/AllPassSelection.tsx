import React from 'react';
import { Semester } from '../data/subjects';
import { CheckCircle2, Circle, ArrowLeft } from 'lucide-react';

interface Props {
  selected: string[];
  onChange: (selected: string[]) => void;
  onSubmit: () => void;
  onBack: () => void;
  semesters: Semester[];
}

export function AllPassSelection({ selected, onChange, onSubmit, onBack, semesters }: Props) {
  const toggleSem = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl sm:text-2xl font-semibold mb-2">All-Pass Semesters</h2>
      <p className="text-sm sm:text-base text-stone-500 mb-6">Select the semesters where you have passed ALL subjects. This skips the detailed form for these semesters.</p>
      
      <div className="space-y-3 mb-8">
        {semesters.map(sem => {
          const isSelected = selected.includes(sem.id);
          return (
            <button
              key={sem.id}
              type="button"
              onClick={() => toggleSem(sem.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                isSelected 
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              <span className={`font-medium ${isSelected ? 'text-[var(--color-text)]' : 'text-stone-700'}`}>
                {sem.title}
              </span>
              {isSelected ? (
                <CheckCircle2 className="w-6 h-6 text-[var(--color-primary)]" />
              ) : (
                <Circle className="w-6 h-6 text-stone-300" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
        <button 
          onClick={onBack}
          className="w-full sm:w-auto px-6 btn-secondary bg-white"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button 
          onClick={onSubmit}
          className="flex-1 btn-primary"
        >
          Continue to Details
        </button>
      </div>
    </div>
  );
}

