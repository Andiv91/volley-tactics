export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  _count?: {
    questions: number;
  };
}

export interface Option {
  id: string;
  questionId?: string;
  text: string;
  isCorrect?: boolean;
  feedbackMessage: string;
  scoreValue?: number;
}

export type QuestionDifficulty = 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
export type QuestionPhase = 'TEORICO' | 'DECISION_VIDEO' | 'POST_PARTIDO';

export interface Question {
  id: string;
  categoryId: string;
  category?: Category;
  title: string;
  context?: string;
  difficulty: QuestionDifficulty;
  phase: QuestionPhase;
  imageUrl?: string | null;
  videoUrl?: string | null;
  options: Option[];
  createdAt?: string;
}

export type PerformanceLevel = 'PRINCIPIANTE' | 'COMPETENTE' | 'PROFESIONAL';

export interface TestSummary {
  id: string;
  title: string;
  description?: string;
  phase: string;
  durationMinutes: number;
  passingScore: number;
  competentThreshold?: number;
  professionalThreshold?: number;
  isActive: boolean;
  questionCount: number;
  submissionCount: number;
  categories: string[];
  createdAt: string;
}

export interface TestDetail {
  id: string;
  title: string;
  description?: string;
  phase: string;
  durationMinutes: number;
  passingScore: number;
  competentThreshold?: number;
  professionalThreshold?: number;
  isActive: boolean;
  questions: Question[];
}

export interface SubmissionAnswer {
  id?: string;
  questionId: string;
  questionTitle?: string;
  questionContext?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  categoryName: string;
  selectedOptionId: string;
  selectedOptionText?: string;
  isCorrect: boolean;
  feedbackGiven: string;
  allOptions?: Option[];
  question?: Question;
  selectedOption?: Option;
}

export interface Submission {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  testId: string;
  testTitle?: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  performanceLevel?: PerformanceLevel;
  timeSpentSeconds: number;
  createdAt: string;
  answers?: SubmissionAnswer[];
  detailedAnswers?: SubmissionAnswer[];
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  test?: {
    id: string;
    title: string;
    phase: string;
    passingScore: number;
    competentThreshold?: number;
    professionalThreshold?: number;
  };
  _count?: {
    answers: number;
  };
}

export interface CircularPieSlice {
  name: string;
  value: number; // count of correct answers
  total: number; // total questions in category
  percentage: number; // proficiency %
  color: string;
}

export interface DifficultyStat {
  difficulty: string;
  accuracy: number;
  totalAnswered: number;
}

export interface UserSummaryItem {
  id: string;
  name: string;
  email: string;
  testsCompleted: number;
  averagePercentage: number;
}

export interface AnalyticsData {
  kpis: {
    totalSubmissions: number;
    passedSubmissions: number;
    passRate: number;
    averageScore: number;
    totalAthletes: number;
    totalTests: number;
  };
  circularPieData: CircularPieSlice[];
  difficultyBreakdown: DifficultyStat[];
  userSummaries: UserSummaryItem[];
  selectedUserId: string | null;
}
