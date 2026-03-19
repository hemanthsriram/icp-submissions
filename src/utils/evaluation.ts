import { semesters as cseSemesters, Semester } from '../data/subjects';

export interface StudentData {
  name: string;
  hallTicket: string;
  branch: string;
}

export interface SubjectResult {
  passed: boolean;
}

export interface ResultsMap {
  [semesterId: string]: {
    [subjectName: string]: SubjectResult;
  };
}

export function evaluateEligibility(results: ResultsMap, includeOther: boolean, semesterList: Semester[] = cseSemesters) {
  let totalCredits = 0;
  let coreCredits = 0;
  let mathCredits = 0;
  let mandatoryBacklogs = 0;
  let totalBacklogs = 0;
  let backlogSubjects: string[] = [];
  let mandatoryPassed = true;

  semesterList.forEach(sem => {
    sem.subjects.forEach(sub => {
      const isPassed = results[sem.id]?.[sub.name]?.passed ?? false;
      
      if (isPassed) {
        totalCredits += sub.credits;
        if (sub.isCore) coreCredits += sub.credits;
        if (sub.isMath) mathCredits += sub.credits;
        if (sub.isOther && includeOther) coreCredits += sub.credits;
      } else {
        totalBacklogs += 1;
        backlogSubjects.push(sub.name);
        if (sub.isMandatory) {
          mandatoryPassed = false;
          mandatoryBacklogs += 1;
        }
      }
    });
  });

  const crit1 = totalCredits >= 80;
  const crit2 = coreCredits >= 40;
  const crit3 = mathCredits >= 10;
  const crit4 = mandatoryPassed;

  return {
    totalCredits,
    coreCredits,
    mathCredits,
    mandatoryPassed,
    mandatoryBacklogs,
    totalBacklogs,
    backlogSubjects,
    crit1,
    crit2,
    crit3,
    crit4
  };
}

