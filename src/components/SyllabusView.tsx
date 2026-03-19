import React from 'react';
import { Semester } from '../data/subjects';

interface Props {
  semesters: Semester[];
}

export default function SyllabusView({ semesters }: Props) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {semesters.map((semester) => {
        const totalCredits = semester.subjects.reduce((sum, sub) => sum + sub.credits, 0);
        
        return (
          <div key={semester.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 border-b border-stone-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-bold text-stone-900">{semester.title}</h2>
              <div className="text-xs sm:text-sm font-medium text-stone-600 bg-white px-3 py-1 rounded-lg border border-stone-200">
                Total Credits: {totalCredits}
              </div>
            </div>

            {/* Mobile: card-based layout */}
            <div className="sm:hidden divide-y divide-stone-100">
              {semester.subjects.map((subject, idx) => (
                <div key={idx} className="px-4 py-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-medium text-stone-900 leading-snug">{subject.name}</span>
                    <span className="text-xs text-stone-500 font-medium whitespace-nowrap mt-0.5">{subject.credits} cr</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {subject.isCore && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">Core</span>
                    )}
                    {subject.isMath && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">Math</span>
                    )}
                    {subject.isOther && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">Other</span>
                    )}
                    {subject.isMandatory && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">Mandatory</span>
                    )}
                    {!subject.isCore && !subject.isMath && !subject.isOther && !subject.isMandatory && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-600">General</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm text-left table-fixed">
                <thead className="text-xs text-stone-500 uppercase bg-white border-b border-stone-100">
                  <tr>
                    <th className="w-1/2 px-6 py-3 font-medium">Subject Name</th>
                    <th className="w-1/6 px-6 py-3 font-medium text-center">Credits</th>
                    <th className="w-1/3 px-6 py-3 font-medium text-center">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {semester.subjects.map((subject, idx) => (
                    <tr key={idx} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-3 text-stone-900 font-medium">{subject.name}</td>
                      <td className="px-6 py-3 text-center text-stone-700">{subject.credits}</td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
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
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-800">
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
