import React, { useState } from 'react';
import { Semester } from '../data/subjects';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, User, Hash, BookOpen, Filter, Trash2, Edit2, Save } from 'lucide-react';

interface Props {
  submission: any;
  index: number;
  adminToken?: string;
  onUpdate?: () => void;
  stream?: string;
  semesters: Semester[];
  readOnly?: boolean;
}

export default function StudentDetailCard({ submission, index, adminToken, onUpdate, stream = 'CSE ICP', semesters, readOnly = false }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filters, setFilters] = useState({ core: false, mandatory: false });
  const { studentData, results, resultsWithOther } = submission;
  
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editStudent, setEditStudent] = useState(studentData);
  const [editResults, setEditResults] = useState(results);

  const toggleSubjectPass = (semId: string, subName: string, passed: boolean) => {
    setEditResults((prev: any) => ({
      ...prev,
      [semId]: {
        ...prev[semId],
        [subName]: { ...prev[semId]?.[subName], passed }
      }
    }));
  };

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const url = '/api/admin/student/' + encodeURIComponent(studentData.hallTicket) + '?stream=' + encodeURIComponent(stream);
      const res = await fetch(url, { 
        method: 'DELETE', 
        headers: { Authorization: 'Bearer ' + adminToken } 
      });
      if (!res.ok) {
        let errData: any = {};
        try { errData = await res.json(); } catch(ex) {}
        throw new Error(errData.error || ('Server Error: ' + res.status));
      }
      if (onUpdate) onUpdate();
    } catch (err: any) {
      console.error('[DELETE] Error:', err);
      alert('Failed to delete student: ' + err.message);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/student/' + encodeURIComponent(studentData.hallTicket), { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + adminToken },
        body: JSON.stringify({ studentData: editStudent, results: editResults })
      });
      if (!res.ok) {
        let errData: any = {};
        try { errData = await res.json(); } catch(ex) {}
        throw new Error(errData.error || ('Server Error: ' + res.status));
      }
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (e: any) {
      alert('Failed to save student: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card">
      {/* Header: Student Info */}
      <div
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between cursor-pointer"
        onClick={(e) => { 
          // Prevent expanding if clicking inside inputs
          if (!isEditing) setExpanded(!expanded);
        }}
      >
        <div className="flex items-start gap-4 w-full sm:w-auto">
          <div className="w-10 h-10 mt-1 shrink-0 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-sm">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input 
                className="text-lg font-semibold text-[var(--color-primary)] border-b-2 border-stone-300 focus:border-[var(--color-primary)] outline-none bg-transparent px-1 min-w-[200px]"
                value={editStudent.name}
                onChange={e => setEditStudent({...editStudent, name: e.target.value})}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <h3 className="text-base sm:text-lg font-semibold text-[var(--color-primary)] truncate">{studentData.name}</h3>
            )}
            
            <p className="text-sm text-stone-500 font-mono flex items-center gap-2 mt-1">
              <span>{studentData.hallTicket}</span> &bull; 
              {isEditing ? (
                <span className="px-2 py-0.5 bg-stone-100 rounded text-xs font-medium text-stone-600">{editStudent.branch || 'CSE ICP'}</span>
              ) : (
                <span>{studentData.branch || 'CSE ICP'}</span>
              )}
            </p>
          </div>
        </div>

          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end mt-2 sm:mt-0">
          {!readOnly && (
          <div className="flex items-center gap-1 sm:mr-2" onClick={e => e.stopPropagation()}>
            {isEditing ? (
              <>
                <button onClick={handleSave} disabled={isSaving} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Save">
                  <Save className="w-5 h-5" />
                </button>
                <button onClick={() => setIsEditing(false)} className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors text-sm font-medium">
                  Cancel
                </button>
              </>
            ) : confirmDelete ? (
              <>
                <button 
                  onClick={handleDelete} 
                  disabled={isDeleting} 
                  className="px-3 py-1.5 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button 
                  onClick={() => setConfirmDelete(false)} 
                  className="px-3 py-1.5 bg-stone-200 text-stone-700 text-sm font-medium rounded-lg hover:bg-stone-300 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setIsEditing(true); setExpanded(true); }} className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Student">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setConfirmDelete(true)} className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Student">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          )}

          {!isEditing && (
            <>
              {/* Mobile: show compact eligibility badge */}
              <div className="flex sm:hidden items-center gap-2 text-xs">
                {resultsWithOther.crit1 && resultsWithOther.crit2 && resultsWithOther.crit3 && resultsWithOther.crit4 ? (
                  <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    ELIGIBLE
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200">
                    NOT ELIGIBLE
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${resultsWithOther.totalBacklogs === 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                  {resultsWithOther.totalBacklogs} backlogs
                </span>
              </div>
              {/* Desktop: full badge row */}
              <div className="hidden sm:flex flex-wrap items-center gap-2 text-xs md:text-sm justify-end">
              {/* Overall Eligibility Badge */}
              {resultsWithOther.crit1 && resultsWithOther.crit2 && resultsWithOther.crit3 && resultsWithOther.crit4 ? (
                <span className="whitespace-nowrap px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 shadow-sm flex items-center justify-center min-w-[100px]">
                  ELIGIBLE
                </span>
              ) : (
                <span className="whitespace-nowrap px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200 shadow-sm flex items-center justify-center min-w-[100px]">
                  NOT ELIGIBLE
                </span>
              )}

              {/* Status Indicators */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 ml-0 sm:ml-2 sm:border-l border-stone-200 sm:pl-3 w-full sm:w-auto mt-2 sm:mt-0">
                <span title={`Total Credits: ${resultsWithOther.totalCredits} / 80`} className={`px-2 py-0.5 rounded text-xs font-medium border ${resultsWithOther.crit1 ? 'bg-stone-50 text-stone-600 border-stone-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                  Cr: {resultsWithOther.totalCredits}
                </span>
                <span title={`Core Credits: ${resultsWithOther.coreCredits} / 40`} className={`px-2 py-0.5 rounded text-xs font-medium border ${resultsWithOther.crit2 ? 'bg-stone-50 text-stone-600 border-stone-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                  Core: {resultsWithOther.coreCredits}
                </span>
                <span title={`Math Credits: ${resultsWithOther.mathCredits} / 10`} className={`px-2 py-0.5 rounded text-xs font-medium border ${resultsWithOther.crit3 ? 'bg-stone-50 text-stone-600 border-stone-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                  Math: {resultsWithOther.mathCredits}
                </span>
                <span title={`Mandatory Subjects Passed`} className={`px-2 py-0.5 rounded text-xs font-medium border ${resultsWithOther.crit4 ? 'bg-stone-50 text-stone-600 border-stone-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                  Mand: {resultsWithOther.crit4 ? 'Pass' : 'Fail'}
                </span>
                <span title={`Total Backlogs`} className={`px-2 py-0.5 rounded text-xs font-medium border ${resultsWithOther.totalBacklogs === 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                  Backlogs: {resultsWithOther.totalBacklogs}
                </span>
              </div>
            </div>
            </>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-stone-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-stone-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-6 space-y-6">
          {/* Summary Stats - like ReviewScreen */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
              <div className="text-xs text-stone-500 mb-0.5">Total Credits</div>
              <div className="text-xl font-semibold">{resultsWithOther.totalCredits}</div>
              <div className="text-xs text-stone-400">Target: 80</div>
            </div>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
              <div className="text-xs text-stone-500 mb-0.5">Core Credits</div>
              <div className="text-xl font-semibold">{resultsWithOther.coreCredits}</div>
              <div className="text-xs text-stone-400">Target: 40</div>
            </div>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
              <div className="text-xs text-stone-500 mb-0.5">Math Credits</div>
              <div className="text-xl font-semibold">{resultsWithOther.mathCredits}</div>
              <div className="text-xs text-stone-400">Target: 10</div>
            </div>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
              <div className="text-xs text-stone-500 mb-0.5">Backlogs</div>
              <div className="text-xl font-semibold">{resultsWithOther.totalBacklogs}</div>
              <div className="text-xs text-stone-400">Mandatory: {resultsWithOther.mandatoryBacklogs}</div>
            </div>
          </div>

          {/* Failed subjects */}
          {resultsWithOther.backlogSubjects.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Failed Subjects</h4>
              <div className="flex flex-wrap gap-2">
                {resultsWithOther.backlogSubjects.map((sub: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs border border-rose-100">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Per-semester breakdown */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Semester-wise Results</h4>
              
              <div className="relative">
                <button 
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filter Options
                  {(filters.core || filters.mandatory) && (
                    <span className="flex items-center justify-center bg-[var(--color-primary)] text-white text-[10px] w-4 h-4 rounded-full ml-1 leading-none">
                      {(filters.core ? 1 : 0) + (filters.mandatory ? 1 : 0)}
                    </span>
                  )}
                </button>

                {showFilterMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowFilterMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-stone-100 p-2 z-20">
                      <div className="px-3 py-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                        Show Subjects
                      </div>
                      <label className="flex items-center gap-3 px-3 py-2.5 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-stone-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                          checked={filters.core}
                          onChange={(e) => setFilters(prev => ({ ...prev, core: e.target.checked }))}
                        />
                        <span className="text-sm font-medium text-stone-700">Core</span>
                      </label>
                      <label className="flex items-center gap-3 px-3 py-2.5 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-stone-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                          checked={filters.mandatory}
                          onChange={(e) => setFilters(prev => ({ ...prev, mandatory: e.target.checked }))}
                        />
                        <span className="text-sm font-medium text-stone-700">Mandatory</span>
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              {semesters.map(sem => {
                const semResults = results[sem.id];
                if (!semResults) return null;

                const filteredSubjects = sem.subjects.filter(sub => {
                  if (!filters.core && !filters.mandatory) return true;
                  if (filters.core && sub.isCore) return true;
                  if (filters.mandatory && sub.isMandatory) return true;
                  return false;
                });

                if (filteredSubjects.length === 0) return null;

                const allPassed = filteredSubjects.every(sub => semResults[sub.name]?.passed);

                return (
                  <div key={sem.id} className="bg-stone-50 rounded-xl border border-stone-100 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-stone-100">
                      <span className="text-sm font-medium">{sem.title}</span>
                      {allPassed ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> All Passed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-rose-600">
                          <XCircle className="w-3.5 h-3.5" /> Has Backlogs
                        </span>
                      )}
                    </div>
                    <div className="px-4 py-2 divide-y divide-stone-100/80">
                      {filteredSubjects.map((sub, idx) => {
                        const passed = semResults[sub.name]?.passed;
                        return (
                          <div key={idx} className="flex flex-col sm:grid sm:grid-cols-[1fr_80px_40px] sm:items-center gap-1 sm:gap-4 py-2 text-sm">
                            <div className="flex items-center gap-2 overflow-hidden flex-wrap">
                              <span className={`truncate ${passed ? 'text-stone-700' : 'text-rose-700 font-medium'}`}>
                                {sub.name}
                              </span>
                              {sub.isCore && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium shrink-0">CORE</span>}
                              {sub.isMandatory && <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-medium shrink-0">MAND</span>}
                            </div>
                            
                            <div className="flex items-center justify-between sm:contents">
                              <div className="text-xs text-stone-500 sm:text-center font-medium">
                                {sub.credits} <span className="text-[10px] opacity-70">cr</span>
                              </div>
                              
                              <div className="flex justify-end">
                              {!readOnly && isEditing ? (
                                <select 
                                  className="border border-stone-300 rounded px-1 py-0.5 text-xs bg-white text-stone-700 cursor-pointer"
                                  value={passed ? 'pass' : 'fail'}
                                  onChange={e => toggleSubjectPass(sem.id, sub.name, e.target.value === 'pass')}
                                >
                                  <option value="pass">P</option>
                                  <option value="fail">F</option>
                                </select>
                              ) : passed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-500" />
                              )}
                            </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
