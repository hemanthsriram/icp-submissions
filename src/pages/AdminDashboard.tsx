import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Users, CheckCircle2, AlertCircle, XCircle, Settings, Link as LinkIcon, BookOpen, FileText } from 'lucide-react';
import SyllabusView from '../components/SyllabusView';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sheetsConnected, setSheetsConnected] = useState(false);
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'submissions' | 'syllabus'>('submissions');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${password}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
        setLastUpdated(new Date());
      } else if (res.status === 401) {
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
        headers: { Authorization: `Bearer ${password}` }
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
    if (isAuthenticated) {
      fetchDashboardData();
      checkSheetsStatus();

      const eventSource = new EventSource(`/api/admin/stream?token=${encodeURIComponent(password)}`);
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'UPDATE') {
          fetchDashboardData();
        }
      };

      return () => eventSource.close();
    }
  }, [isAuthenticated, password]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true); // Will be verified on first fetch
  };

  const handleDownload = () => {
    window.location.href = `/api/admin/download?token=${encodeURIComponent(password)}`; // Simplistic auth for download
  };

  const handleSyncSheets = async () => {
    try {
      await fetch('/api/admin/sheets/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${password}` }
      });
      alert('Sync triggered successfully.');
    } catch (error) {
      console.error('Failed to sync sheets:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-sm w-full">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Admin Login</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-xl transition-colors">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${sheetsConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
              <LinkIcon className="w-4 h-4" />
              {sheetsConnected ? 'Sheets Connected' : 'Sheets Not Connected'}
            </div>
            <button onClick={() => setShowSheetsModal(true)} className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={handleDownload} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              <Download className="w-4 h-4" />
              Download Excel
            </button>
          </div>
        </header>

        <div className="flex items-center gap-2 mb-8 bg-white p-1 rounded-xl border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'submissions'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Submissions
          </button>
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'syllabus'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Syllabus
          </button>
        </div>

        {activeTab === 'submissions' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users className="w-5 h-5" /></div>
                  <h3 className="text-sm font-medium text-slate-500">Total Submissions</h3>
                </div>
                <div className="text-3xl font-bold text-slate-900">{students.length}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-medium">Sl.No</th>
                      <th className="px-6 py-4 font-medium">Hall Ticket</th>
                      <th className="px-6 py-4 font-medium">Name</th>
                      <th className="px-6 py-4 font-medium text-center">Credits</th>
                      <th className="px-6 py-4 font-medium text-center">Core</th>
                      <th className="px-6 py-4 font-medium text-center">Math</th>
                      <th className="px-6 py-4 font-medium text-center">Backlogs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((student, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-500">{student['Sl.No']}</td>
                        <td className="px-6 py-4 font-medium text-slate-900 uppercase">{student['Hall Ticket']}</td>
                        <td className="px-6 py-4 text-slate-700">{student['Student Name']}</td>
                        <td className="px-6 py-4 text-center font-medium">{student['Total Credits']}</td>
                        <td className="px-6 py-4 text-center">{student['Core Credits (with OTHER)']}</td>
                        <td className="px-6 py-4 text-center">{student['Math Credits']}</td>
                        <td className="px-6 py-4 text-center text-rose-600 font-medium">{student['Total Backlogs']}</td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                          No submissions yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <SyllabusView />
        )}
      </div>

      {showSheetsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Google Sheets Sync</h3>
            <p className="text-sm text-slate-500 mb-6">
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
                    Authorization: `Bearer ${password}` 
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Google Sheet ID</label>
                  <input name="sheetId" type="text" defaultValue="1RWI6kVygmaC_XrS3oXe4AbADIwytpvl36Nm1xr2WUV0" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="1BxiMVs0XRYFgwnV..." required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Account JSON</label>
                  <textarea name="credentials" rows={4} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="{...}" required></textarea>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowSheetsModal(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Connect</button>
              </div>
            </form>
            
            {sheetsConnected && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <button onClick={handleSyncSheets} className="w-full px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
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
