import React from 'react';
import { StudentData } from '../utils/evaluation';
import { User, Hash, BookOpen } from 'lucide-react';

interface Props {
  data: StudentData;
  onChange: (data: StudentData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function StudentForm({ data, onChange, onSubmit }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <h2 className="text-2xl font-semibold mb-6">Student Details</h2>
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              required
              type="text" 
              value={data.name}
              onChange={e => onChange({...data, name: e.target.value})}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Enter student name"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Hall Ticket Number</label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              required
              type="text" 
              value={data.hallTicket}
              onChange={e => onChange({...data, hallTicket: e.target.value.toUpperCase()})}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all uppercase"
              placeholder="e.g. 21A91A0501"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Branch</label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select 
              value={data.branch}
              onChange={e => onChange({...data, branch: e.target.value})}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none bg-white"
            >
              <option value="CSE">Computer Science & Engineering (CSE)</option>
              <option value="IT">Information Technology (IT)</option>
              <option value="ECE">Electronics & Communication (ECE)</option>
            </select>
          </div>
        </div>

        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
          Continue
        </button>
      </form>
    </div>
  );
}
