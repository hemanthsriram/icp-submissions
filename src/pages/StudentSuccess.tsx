import React from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export default function StudentSuccess() {
  const location = useLocation();
  const { studentData, results } = location.state || {};

  if (!studentData) {
    return <Navigate to="/cseicp" replace />;
  }

  const streamRoute = studentData.branch === 'AIML ICP' ? '/aimlicp' : '/cseicp';

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4 sm:p-6">
      <div className="card max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[var(--color-cta)]/10 text-[var(--color-cta)] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] mb-2">Submission Successful</h2>
        <p className="text-stone-500 mb-8">Your data has been submitted successfully.</p>

        <div className="bg-stone-50 rounded-xl border border-stone-100 p-4 mb-6 text-left">
          <div className="text-sm text-stone-500 mb-1">Student</div>
          <div className="font-medium text-[var(--color-primary)]">{studentData.name}</div>
          <div className="text-sm text-stone-500 mt-1 uppercase tracking-wider">{studentData.hallTicket}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-left mb-8">
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
            <div className="text-xs text-stone-500 uppercase">Total Credits</div>
            <div className="font-semibold">{results.totalCredits}</div>
          </div>
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
            <div className="text-xs text-stone-500 uppercase">Core Credits</div>
            <div className="font-semibold">{results.coreCredits}</div>
          </div>
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
            <div className="text-xs text-stone-500 uppercase">Math Credits</div>
            <div className="font-semibold">{results.mathCredits}</div>
          </div>
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
            <div className="text-xs text-stone-500 uppercase">Backlogs</div>
            <div className="font-semibold">{results.totalBacklogs}</div>
          </div>
        </div>

        <Link
          to={streamRoute}
          className="inline-flex items-center gap-2 btn-primary w-full justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
          Submit Another Student
        </Link>
      </div>
    </div>
  );
}
