import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentData } from '../utils/evaluation';
import { User, Hash } from 'lucide-react';

interface Props {
  data: StudentData;
  onChange: (data: StudentData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const STREAMS = [
  { value: 'CSE ICP', route: '/cseicp', label: 'CSE ICP' },
  { value: 'AIML ICP', route: '/aimlicp', label: 'AIML ICP' },
];

export function StudentForm({ data, onChange, onSubmit }: Props) {
  const navigate = useNavigate();

  const handleStreamChange = (streamValue: string) => {
    const target = STREAMS.find(s => s.value === streamValue);
    if (target && streamValue !== data.branch) {
      navigate(target.route);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-semibold mb-6">Student Details</h2>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Stream selector — radio buttons */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-3">Branch / Stream</label>
          <div className="flex gap-3">
            {STREAMS.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => handleStreamChange(s.value)}
                className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer ${
                  data.branch === s.value
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input 
              required
              type="text" 
              value={data.name}
              onChange={e => onChange({...data, name: e.target.value})}
              className="input pl-10"
              placeholder="Enter student name"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Hall Ticket Number</label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input 
              required
              type="text" 
              value={data.hallTicket}
              onChange={e => onChange({...data, hallTicket: e.target.value.toUpperCase()})}
              className="input pl-10 uppercase"
              placeholder="e.g. 21A91A0501"
            />
          </div>
        </div>

        <button type="submit" className="w-full btn-primary">
          Continue
        </button>
      </form>
    </div>
  );
}
