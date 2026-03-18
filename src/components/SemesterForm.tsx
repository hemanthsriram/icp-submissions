import React, { useState, useEffect } from 'react';
import { Semester } from '../data/subjects';

interface Props {
  semester: Semester;
  initialResults: any;
  onSubmit: (results: any) => void;
}

export function SemesterForm({ semester, initialResults, onSubmit }: Props) {
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{semester.title}</h2>
        <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
          Credits: {currentCredits} / {totalPossible}
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-1">
          {semester.subjects.map((sub, idx) => {
            const isPassed = results[sub.name]?.passed ?? true;
            return (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div className="flex-1 pr-4">
                  <div className="font-medium text-slate-800">{sub.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-2">
                    <span>{sub.credits} Credits</span>
                    {sub.isCore && <span className="text-blue-600 font-medium">CORE</span>}
                    {sub.isMath && <span className="text-emerald-600 font-medium">MATH</span>}
                    {sub.isMandatory && <span className="text-amber-600 font-medium">MANDATORY</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleToggle(sub.name, true)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isPassed ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggle(sub.name, false)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      !isPassed ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Fail
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <button 
            onClick={() => onSubmit(results)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
