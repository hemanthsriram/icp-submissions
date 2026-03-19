import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Users, CheckCircle2, AlertCircle, XCircle, Settings, Link as LinkIcon, BookOpen, FileText } from 'lucide-react';
import SyllabusView from '../components/SyllabusView';
import StudentDetailCard from '../components/StudentDetailCard';
import { supabase } from '../lib/supabase';
import { semesters as cseSemesters } from '../data/subjects';
import { aimlSemesters } from '../data/subjects-aiml';

export default function AdminDashboard() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sheetsConnected, setSheetsConnected] = useState(false);
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeStream, setActiveStream] = useState<'CSE ICP' | 'AIML ICP'>('CSE ICP');
  const [activeTab, setActiveTab] = useState<'submissions' | 'syllabus'>('submissions');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/dashboard?stream=${encodeURIComponent(activeStream)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
        setSubmissions(data.submissions || []);
        setLastUpdated(new Date());
      } else if (res.status === 401 || res.status === 403) {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSheetsStatus = async () => {
    try {
      const res = await fetch('/api/admin/sheets/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSheetsConnected(data.connected);
      }
    } catch (error) {
      console.error('Failed to check sheets status:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchDashboardData();
      checkSheetsStatus();

      const eventSource = new EventSource(`/api/admin/stream?token=${encodeURIComponent(token)}`);
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'UPDATE') {
          fetchDashboardData();
        }
      };

      return () => eventSource.close();
    }
  }, [isAuthenticated, token, activeStream]);

  const loginMap: Record<string, string> = {
    'Hemanth': 'hemanth@admin.cse',
    'Viswa': 'viswa@admin.aiml'
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const email = loginMap[username] || username;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.session) {
      alert("Invalid credentials. Please verify your Username and Password.");
      setLoading(false);
      return;
    }

    setToken(data.session.access_token);
    setIsAuthenticated(true);
    setLoading(false);
  };

  const handleDownload = () => {
    window.location.href = `/api/admin/download?stream=${encodeURIComponent(activeStream)}&token=${encodeURIComponent(token)}`;
  };

  const handleSyncSheets = async () => {
    try {
      await fetch('/api/admin/sheets/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Sync triggered successfully.');
    } catch (error) {
      console.error('Failed to sync sheets:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="card max-w-sm w-full">
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6 text-center">Admin Login</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="Enter username"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>
          <button type="submit" className="w-full btn-primary">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-primary)]">Admin Dashboard</h1>
            <p className="text-xs sm:text-sm text-stone-500">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium ${sheetsConnected ? 'bg-[var(--color-cta)]/10 text-[var(--color-cta)] border border-[var(--color-cta)]/20' : 'bg-stone-100 text-stone-600 border border-stone-200'}`}>
              <LinkIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{sheetsConnected ? 'Sheets Connected' : 'Sheets Not Connected'}</span>
              <span className="sm:hidden">{sheetsConnected ? 'Connected' : 'Offline'}</span>
            </div>
            <button onClick={() => setShowSheetsModal(true)} className="p-2 text-stone-500 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer">
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={handleDownload} className="btn-primary text-sm">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download Excel</span>
            </button>
          </div>
        </header>

        {/* Stream Toggle - Top Level */}
        <div className="flex items-center gap-2 mb-4 bg-white p-1.5 rounded-xl border border-stone-200 w-full sm:w-fit shadow-sm">
          <button
            onClick={() => { setActiveStream('CSE ICP'); setActiveTab('submissions'); }}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeStream === 'CSE ICP'
                ? 'bg-[var(--color-primary)] text-white shadow-md'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            CSE ICP
          </button>
          <button
            onClick={() => { setActiveStream('AIML ICP'); setActiveTab('submissions'); }}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeStream === 'AIML ICP'
                ? 'bg-[var(--color-primary)] text-white shadow-md'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            AIML ICP
          </button>
        </div>

        {/* Sub-tabs: Submissions / Syllabus */}
        <div className="flex items-center gap-2 mb-6 sm:mb-8 bg-white p-1 rounded-xl border border-stone-200 w-full sm:w-fit shadow-sm">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'submissions'
                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                : 'text-stone-600 hover:bg-stone-50 hover:text-[var(--color-primary)]'
            }`}
          >
            <FileText className="w-4 h-4" />
            Submissions
          </button>
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'syllabus'
                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                : 'text-stone-600 hover:bg-stone-50 hover:text-[var(--color-primary)]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Syllabus
          </button>
        </div>

        {activeTab === 'submissions' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
              <div className="card !p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg"><Users className="w-5 h-5" /></div>
                  <h3 className="text-sm font-medium text-stone-500">{activeStream} Submissions</h3>
                </div>
                <div className="text-3xl font-bold text-[var(--color-text)]">{submissions.length}</div>
              </div>
            </div>


            <div className="space-y-4">
              {[...submissions]
                .sort((a, b) => (a.studentData?.hallTicket || '').toUpperCase().localeCompare((b.studentData?.hallTicket || '').toUpperCase()))
                .map((sub, idx) => (
                <StudentDetailCard 
                  key={sub.studentData.hallTicket || idx} 
                  submission={sub} 
                  index={idx} 
                  adminToken={token} 
                  onUpdate={fetchDashboardData}
                  stream={activeStream}
                  semesters={activeStream === 'AIML ICP' ? aimlSemesters : cseSemesters}
                />
              ))}
              {submissions.length === 0 && (
                <div className="card text-center py-12 text-stone-500">
                  No {activeStream} submissions yet.
                </div>
              )}
            </div>
          </>
        ) : (
          <SyllabusView semesters={activeStream === 'AIML ICP' ? aimlSemesters : cseSemesters} />
        )}
      </div>

      {showSheetsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md !p-6 sm:!p-8 mx-4 sm:mx-0">
            <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4">Google Sheets Sync</h3>
            <p className="text-sm text-stone-500 mb-6">
              Connect a Google Sheet to mirror the eligibility data in real-time.
            </p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                const res = await fetch('/api/admin/sheets/connect', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                  },
                  body: JSON.stringify({
                    sheetId: formData.get('sheetId'),
                    credentialsJson: formData.get('credentials')
                  })
                });
                if (res.ok) {
                  setSheetsConnected(true);
                  setShowSheetsModal(false);
                } else {
                  alert('Failed to connect. Check credentials and Sheet ID.');
                }
              } catch (err) {
                console.error(err);
              }
            }}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Google Sheet ID</label>
                  <input name="sheetId" type="text" defaultValue="1RWI6kVygmaC_XrS3oXe4AbADIwytpvl36Nm1xr2WUV0" className="input" placeholder="1BxiMVs0XRYFgwnV..." required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Service Account JSON</label>
                  <textarea name="credentials" rows={4} className="input font-mono block" placeholder="{...}" required></textarea>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowSheetsModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Connect</button>
              </div>
            </form>
            
            {sheetsConnected && (
              <div className="mt-6 pt-6 border-t border-stone-100">
                <button onClick={handleSyncSheets} className="w-full btn-secondary text-[var(--color-primary)] border-none bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10">
                  <RefreshCw className="w-4 h-4" />
                  Force Full Sync
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
