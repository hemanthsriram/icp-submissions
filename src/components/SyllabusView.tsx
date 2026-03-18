import React from 'react';
import { semesters } from '../data/subjects';

export default function SyllabusView() {
  return (
    <div className="space-y-8">
      {semesters.map((semester) => {
        const totalCredits = semester.subjects.reduce((sum, sub) => sum + sub.credits, 0);
        
        return (
          <div key={semester.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{semester.title}</h2>
              <div className="text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
                Total Credits: {totalCredits}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 font-medium">Subject Name</th>
                    <th className="px-6 py-3 font-medium text-center">Credits</th>
                    <th className="px-6 py-3 font-medium text-center">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {semester.subjects.map((subject, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 text-slate-900 font-medium">{subject.name}</td>
                      <td className="px-6 py-3 text-center text-slate-700">{subject.credits}</td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {subject.isCore && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                              Core
                            </span>
                          )}
                          {subject.isMath && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                              Math
                            </span>
                          )}
                          {subject.isOther && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                              Other
                            </span>
                          )}
                          {subject.isMandatory && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800">
                              Mandatory
                            </span>
                          )}
                          {!subject.isCore && !subject.isMath && !subject.isOther && !subject.isMandatory && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                              General
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
