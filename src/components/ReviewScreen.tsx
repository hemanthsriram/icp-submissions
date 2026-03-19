import React from 'react';
import { StudentData, ResultsMap, evaluateEligibility } from '../utils/evaluation';
import { Semester } from '../data/subjects';
import { Send, RefreshCw, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

interface Props {
  studentData: StudentData;
  results: ResultsMap;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  semesters: Semester[];
}

export function ReviewScreen({ studentData, results, onBack, onSubmit, isSubmitting, semesters }: Props) {
  const resWithOther = evaluateEligibility(results, true, semesters);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-primary)]">{studentData.name}</h2>
            <p className="text-stone-500 font-mono mt-1">{studentData.hallTicket} • {studentData.branch}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
            <div className="text-sm text-stone-500 mb-1">Total Credits</div>
            <div className="text-2xl font-semibold text-stone-900">{resWithOther.totalCredits}</div>
            <div className="text-xs text-stone-400 mt-1">Target: 80</div>
          </div>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
            <div className="text-sm text-stone-500 mb-1">Core Credits</div>
            <div className="text-2xl font-semibold text-stone-900">{resWithOther.coreCredits}</div>
            <div className="text-xs text-stone-400 mt-1">Target: 40</div>
          </div>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
            <div className="text-sm text-stone-500 mb-1">Math Credits</div>
            <div className="text-2xl font-semibold text-stone-900">{resWithOther.mathCredits}</div>
            <div className="text-xs text-stone-400 mt-1">Target: 10</div>
          </div>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
            <div className="text-sm text-stone-500 mb-1">Backlogs</div>
            <div className="text-2xl font-semibold text-stone-900">{resWithOther.totalBacklogs}</div>
            <div className="text-xs text-stone-400 mt-1">Mandatory: {resWithOther.mandatoryBacklogs}</div>
          </div>
        </div>

        {resWithOther.backlogSubjects.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider mb-3">Failed Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {resWithOther.backlogSubjects.map((sub, i) => (
                <span key={i} className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-sm border border-rose-100">
                  {sub}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
          <button 
            onClick={onBack}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 btn-secondary bg-white"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button 
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 btn-primary"
          >
            {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {isSubmitting ? 'Submitting...' : 'Submit Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
