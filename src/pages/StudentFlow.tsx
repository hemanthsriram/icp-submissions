import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { semesters } from '../data/subjects';
import { ResultsMap, StudentData } from '../utils/evaluation';
import { FileSpreadsheet } from 'lucide-react';
import { StudentForm } from '../components/StudentForm';
import { AllPassSelection } from '../components/AllPassSelection';
import { SemesterForm } from '../components/SemesterForm';
import { ReviewScreen } from '../components/ReviewScreen';

type Step = 'student' | 'all-pass' | 'semester' | 'review';

export default function StudentFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('student');
  const [currentSemIndex, setCurrentSemIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [studentData, setStudentData] = useState<StudentData>({
    name: '',
    hallTicket: '',
    branch: 'CSE'
  });

  const [allPassSemesters, setAllPassSemesters] = useState<string[]>([]);
  const [results, setResults] = useState<ResultsMap>({});

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
        navigate('/success', { state: { studentData, results: data.resultsWithOther } });
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
          />
        );
      case 'semester':
        const sem = semesters[currentSemIndex];
        return (
          <SemesterForm 
            semester={sem} 
            initialResults={results[sem.id] || {}}
            onSubmit={(res) => handleSemesterSubmit(sem.id, res)} 
          />
        );
      case 'review':
        return (
          <ReviewScreen 
            studentData={studentData} 
            results={results} 
            onRestart={() => {
              setStep('student');
              setResults({});
              setAllPassSemesters([]);
              setCurrentSemIndex(0);
            }}
            onSubmit={handleFinalSubmit}
            isSubmitting={isSubmitting}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
          <h1 className="text-xl font-semibold tracking-tight">Eligibility Evaluator</h1>
        </div>
        <div className="text-sm font-medium text-slate-500">
          JNTUK R23/R20/R19
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto p-6 mt-8">
        {renderStep()}
      </main>
    </div>
  );
}
