import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { semesters as cseSemesters } from '../data/subjects';
import { aimlSemesters } from '../data/subjects-aiml';
import { ResultsMap, StudentData } from '../utils/evaluation';
import { FileSpreadsheet, Search } from 'lucide-react';
import { StudentForm } from '../components/StudentForm';
import { AllPassSelection } from '../components/AllPassSelection';
import { SemesterForm } from '../components/SemesterForm';
import { ReviewScreen } from '../components/ReviewScreen';

type Step = 'student' | 'all-pass' | 'semester' | 'review';

interface StudentFlowProps {
  stream: string;
}

export default function StudentFlow({ stream }: StudentFlowProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('student');
  const [currentSemIndex, setCurrentSemIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Select the correct semester list based on the stream
  const semesters = stream === 'AIML ICP' ? aimlSemesters : cseSemesters;
  const streamRoute = stream === 'AIML ICP' ? '/aimlicp' : '/cseicp';

  const [studentData, setStudentData] = useState<StudentData>({
    name: '',
    hallTicket: '',
    branch: stream
  });

  const [allPassSemesters, setAllPassSemesters] = useState<string[]>([]);
  const [results, setResults] = useState<ResultsMap>({});

  // When the stream prop changes (e.g. from routing), reset the form state
  useEffect(() => {
    setStudentData(prev => ({ ...prev, branch: stream }));
    setStep('student');
    setCurrentSemIndex(0);
    setAllPassSemesters([]);
    setResults({});
  }, [stream]);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('all-pass');
  };

  const handleAllPassSubmit = () => {
    const newResults = { ...results };
    allPassSemesters.forEach(semId => {
      const sem = semesters.find(s => s.id === semId);
      if (sem) {
        newResults[semId] = {};
        sem.subjects.forEach(sub => {
          newResults[semId][sub.name] = { passed: true };
        });
      }
    });
    setResults(newResults);
    
    const nextSemIndex = semesters.findIndex(s => !allPassSemesters.includes(s.id));
    if (nextSemIndex !== -1) {
      setCurrentSemIndex(nextSemIndex);
      setStep('semester');
    } else {
      setStep('review');
    }
  };

  const handleSemesterSubmit = (semId: string, semResults: any) => {
    setResults(prev => ({ ...prev, [semId]: semResults }));
    
    let nextIndex = currentSemIndex + 1;
    while (nextIndex < semesters.length && allPassSemesters.includes(semesters[nextIndex].id)) {
      nextIndex++;
    }

    if (nextIndex < semesters.length) {
      setCurrentSemIndex(nextIndex);
    } else {
      setStep('review');
    }
  };

  const getPreviousSemIndex = (currentIndex: number) => {
    let prevIndex = currentIndex - 1;
    while (prevIndex >= 0 && allPassSemesters.includes(semesters[prevIndex].id)) {
      prevIndex--;
    }
    return prevIndex;
  };

  const handleBackFromSemester = () => {
    const prevIndex = getPreviousSemIndex(currentSemIndex);
    if (prevIndex >= 0) {
      setCurrentSemIndex(prevIndex);
    } else {
      setStep('all-pass');
    }
  };

  const handleBackFromReview = () => {
    const prevIndex = getPreviousSemIndex(semesters.length);
    if (prevIndex >= 0) {
      setCurrentSemIndex(prevIndex);
      setStep('semester');
    } else {
      setStep('all-pass');
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentData, results })
      });
      
      if (response.ok) {
        const data = await response.json();
        navigate(`${streamRoute}/success`, { state: { studentData, results: data.resultsWithOther } });
      } else {
        alert('Failed to submit data. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'student':
        return (
          <StudentForm 
            data={studentData} 
            onChange={setStudentData} 
            onSubmit={handleStudentSubmit} 
          />
        );
      case 'all-pass':
        return (
          <AllPassSelection 
            selected={allPassSemesters} 
            onChange={setAllPassSemesters} 
            onSubmit={handleAllPassSubmit} 
            onBack={() => setStep('student')}
            semesters={semesters}
          />
        );
      case 'semester':
        const sem = semesters[currentSemIndex];
        return (
          <SemesterForm 
            semester={sem} 
            initialResults={results[sem.id] || {}}
            onSubmit={(res) => handleSemesterSubmit(sem.id, res)} 
            onBack={handleBackFromSemester}
          />
        );
      case 'review':
        return (
          <ReviewScreen 
            studentData={studentData} 
            results={results} 
            onBack={handleBackFromReview}
            onSubmit={handleFinalSubmit}
            isSubmitting={isSubmitting}
            semesters={semesters}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] font-sans">
      <header className="bg-white border-b border-stone-200/50 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-primary)]" />
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-[var(--color-primary)]">ICP</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/search" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 px-3 py-1.5 rounded-lg transition-colors">
            <Search className="w-4 h-4" />
            Search
          </Link>
          <div className="text-xs sm:text-sm font-medium text-[var(--color-text)] opacity-70">
            {stream}
          </div>
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto p-4 sm:p-6 mt-4 sm:mt-8">
        {renderStep()}
      </main>
    </div>
  );
}
