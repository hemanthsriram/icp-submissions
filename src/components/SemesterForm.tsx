import React, { useState, useEffect } from 'react';
import { Semester } from '../data/subjects';
import { ArrowLeft } from 'lucide-react';

interface Props {
  semester: Semester;
  initialResults: any;
  onSubmit: (results: any) => void;
  onBack: () => void;
}

export function SemesterForm({ semester, initialResults, onSubmit, onBack }: Props) {
  const [results, setResults] = useState<any>(initialResults);

  useEffect(() => {
    if (Object.keys(initialResults).length === 0) {
      const initial: any = {};
      semester.subjects.forEach(sub => {
        initial[sub.name] = { passed: true };
      });
      setResults(initial);
    } else {
      setResults(initialResults);
    }
  }, [semester, initialResults]);

  const handleToggle = (subjectName: string, passed: boolean) => {
    setResults((prev: any) => ({
      ...prev,
      [subjectName]: { passed }
    }));
  };

  const currentCredits = semester.subjects.reduce((sum, sub) => {
    return sum + (results[sub.name]?.passed ? sub.credits : 0);
  }, 0);

  const totalPossible = semester.subjects.reduce((sum, sub) => sum + sub.credits, 0);

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="bg-white border-b border-stone-200 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-lg sm:text-xl font-semibold">{semester.title}</h2>
        <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1 rounded-full text-sm font-medium">
          Credits: {currentCredits} / {totalPossible}
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="space-y-1">
          {semester.subjects.map((sub, idx) => {
            const isPassed = results[sub.name]?.passed ?? true;
            return (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-stone-100 last:border-0 gap-2 sm:gap-0">
                <div className="flex-1 pr-0 sm:pr-4">
                  <div className="font-medium text-stone-800 text-sm sm:text-base">{sub.name}</div>
                  <div className="text-xs text-stone-500 mt-0.5 flex flex-wrap gap-2">
                    <span>{sub.credits} Credits</span>
                    {sub.isCore && <span className="text-blue-600 font-medium">CORE</span>}
                    {sub.isMath && <span className="text-emerald-600 font-medium">MATH</span>}
                    {sub.isMandatory && <span className="text-amber-600 font-medium">MANDATORY</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleToggle(sub.name, true)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      isPassed ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggle(sub.name, false)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      !isPassed ? 'bg-white text-rose-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    Fail
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
          <button 
            onClick={onBack}
            className="w-full sm:w-auto px-6 btn-secondary bg-white"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button 
            onClick={() => onSubmit(results)}
            className="flex-1 btn-primary"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
