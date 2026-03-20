export interface Subject {
  name: string;
  credits: number;
  isCore?: boolean;
  isMath?: boolean;
  isOther?: boolean;
  isMandatory?: boolean;
}

export interface Semester {
  id: string;
  title: string;
  subjects: Subject[];
}

export const aimlSemesters: Semester[] = [
  {
    id: 'sem1',
    title: 'Semester 1 (1-1)',
    subjects: [
      { name: 'Engineering Physics', credits: 3 },
      { name: 'Linear Algebra & Calculus', credits: 3, isMath: true, isMandatory: true },
      { name: 'Basic Electrical & Electronics Engineering', credits: 3 },
      { name: 'Engineering Graphics', credits: 3 },
      { name: 'Introduction to Programming', credits: 3, isCore: true, isMandatory: true },
      { name: 'IT Workshop', credits: 1, isOther: true },
      { name: 'Engineering Physics Lab', credits: 1 },
      { name: 'Electrical & Electronics Engineering Workshop', credits: 1.5 },
      { name: 'Computer Programming Lab', credits: 1.5, isCore: true, isMandatory: true },
      { name: 'NSS/NCC/Scouts & Guides/Community Service', credits: 0.5 }
    ]
  },
  {
    id: 'sem2',
    title: 'Semester 2 (1-2)',
    subjects: [
      { name: 'Communicative English', credits: 2 },
      { name: 'Chemistry', credits: 3 },
      { name: 'Differential Equations & Vector Calculus', credits: 3, isMath: true, isMandatory: true },
      { name: 'Basic Civil & Mechanical Engineering', credits: 3 },
      { name: 'Data Structures', credits: 3, isCore: true, isMandatory: true },
      { name: 'Communicative English Lab', credits: 1 },
      { name: 'Chemistry Lab', credits: 1 },
      { name: 'Engineering Workshop', credits: 1.5 },
      { name: 'Data Structures Lab', credits: 1.5, isCore: true },
      { name: 'Health and wellness, Yoga and Sports', credits: 0.5 }
    ]
  },
  {
    id: 'sem3',
    title: 'Semester 3 (2-1)',
    subjects: [
      { name: 'Discrete Mathematics & Graph Theory', credits: 3, isMath: true, isMandatory: true },
      { name: 'Universal Human Values – Understanding Harmony', credits: 3 },
      { name: 'Artificial Intelligence', credits: 3, isOther: true },
      { name: 'Advanced Data Structures', credits: 3, isCore: true },
      { name: 'Object Oriented Programming Through Java', credits: 3, isCore: true, isMandatory: true },
      { name: 'Advanced Data Structures Lab', credits: 1.5, isCore: true },
      { name: 'Object Oriented Programming Through Java Lab', credits: 1.5, isCore: true, isMandatory: true },
      { name: 'Python Programming', credits: 2, isCore: true, isMandatory: true },
      { name: 'Environmental Science', credits: 0 }
    ]
  },
  {
    id: 'sem4',
    title: 'Semester 4 (2-2)',
    subjects: [
      { name: 'Optimization Techniques', credits: 2 },
      { name: 'Probability & Statistics', credits: 3, isMath: true, isMandatory: true },
      { name: 'Machine Learning', credits: 3, isCore: true },
      { name: 'Database Management Systems', credits: 3, isCore: true, isMandatory: true },
      { name: 'Computer Organization & Architecture', credits: 3, isCore: true, isMandatory: true },
      { name: 'Machine Learning Lab', credits: 1.5, isCore: true },
      { name: 'Database Management Systems Lab', credits: 1.5, isCore: true, isMandatory: true },
      { name: 'Full Stack Development-1', credits: 2, isCore: true },
      { name: 'Design Thinking & Innovation', credits: 2 }
    ]
  },
  {
    id: 'sem5',
    title: 'Semester 5 (3-1)',
    subjects: [
      { name: 'Information Retrieval Systems', credits: 3, isCore: true },
      { name: 'Computer Networks', credits: 3, isCore: true },
      { name: 'Operating Systems', credits: 3, isCore: true, isMandatory: true },
      { name: 'Automata Theory & Compiler Design', credits: 3, isCore: true },
      { name: 'Open Elective-I', credits: 3 },
      { name: 'Information Retrieval Lab', credits: 1.5, isCore: true },
      { name: 'Computer Networks Lab', credits: 1.5, isCore: true },
      { name: 'Full Stack Development-2', credits: 2, isCore: true },
      { name: 'User Interface Design using Flutter', credits: 1, isCore: true },
      { name: 'Community Service Project Internship', credits: 2 }
    ]
  }
];
