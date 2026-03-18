import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function StudentSuccess() {
  const location = useLocation();
  const { studentData, results } = location.state || {};

  if (!studentData) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Submission Successful</h2>
        <p className="text-slate-500 mb-8">Your data has been submitted successfully.</p>

        <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 mb-6 text-left">
          <div className="text-sm text-slate-500 mb-1">Student</div>
          <div className="font-medium text-slate-900">{studentData.name}</div>
          <div className="text-sm text-slate-500 mt-1 uppercase tracking-wider">{studentData.hallTicket}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-xs text-slate-500 uppercase">Total Credits</div>
            <div className="font-semibold">{results.totalCredits}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-xs text-slate-500 uppercase">Core Credits</div>
            <div className="font-semibold">{results.coreCredits}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-xs text-slate-500 uppercase">Math Credits</div>
            <div className="font-semibold">{results.mathCredits}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-xs text-slate-500 uppercase">Backlogs</div>
            <div className="font-semibold">{results.totalBacklogs}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
