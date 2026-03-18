import React from 'react';
import { StudentData, ResultsMap, evaluateEligibility } from '../utils/evaluation';
import { Send, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  studentData: StudentData;
  results: ResultsMap;
  onRestart: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ReviewScreen({ studentData, results, onRestart, onSubmit, isSubmitting }: Props) {
  const resWithOther = evaluateEligibility(results, true);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{studentData.name}</h2>
            <p className="text-slate-500 font-mono mt-1">{studentData.hallTicket} • {studentData.branch}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">Total Credits</div>
            <div className="text-2xl font-semibold text-slate-900">{resWithOther.totalCredits}</div>
            <div className="text-xs text-slate-400 mt-1">Target: 80</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">Core Credits</div>
            <div className="text-2xl font-semibold text-slate-900">{resWithOther.coreCredits}</div>
            <div className="text-xs text-slate-400 mt-1">Target: 40</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">Math Credits</div>
            <div className="text-2xl font-semibold text-slate-900">{resWithOther.mathCredits}</div>
            <div className="text-xs text-slate-400 mt-1">Target: 10</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">Backlogs</div>
            <div className="text-2xl font-semibold text-slate-900">{resWithOther.totalBacklogs}</div>
            <div className="text-xs text-slate-400 mt-1">Mandatory: {resWithOther.mandatoryBacklogs}</div>
          </div>
        </div>

        {resWithOther.backlogSubjects.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Failed Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {resWithOther.backlogSubjects.map((sub, i) => (
                <span key={i} className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-sm border border-rose-100">
                  {sub}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button 
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {isSubmitting ? 'Submitting...' : 'Submit Data'}
          </button>
          <button 
            onClick={onRestart}
            disabled={isSubmitting}
            className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className="w-5 h-5" />
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
