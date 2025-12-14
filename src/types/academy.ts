// Типы для Академии бизнеса

export interface OnboardingData {
  businessType?: string;
  businessStage?: 'idea' | 'startup' | 'growing' | 'mature';
  industry?: string;
  targetAudience?: string;
  monthlyRevenue?: number;
  employeesCount?: number;
  businessGoals?: string[];
  challenges?: string[];
  financialLiteracy?: number; // 1-10
  entrepreneurshipExperience?: number; // years
  preferredFormat?: 'text' | 'video' | 'interactive' | 'slides';
  weeklyHours?: number;
  learningHours?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: number;
  duration: string;
  progress: number;
  completed: boolean;
  inProgress: boolean;
  generatedAt: string;
  personalizedFor?: OnboardingData;
  test?: Test;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  type: 'theory' | 'practice' | 'simulation' | 'template' | 'test';
  content: LessonContent;
  duration: string;
  order: number;
  locked: boolean;
  completed: boolean;
  inProgress: boolean;
}

export interface LessonContent {
  slides?: Slide[];
  infographics?: Infographic[];
  examples?: Example[];
  templates?: Template[];
  test?: Test;
}

export interface Slide {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Infographic {
  id: string;
  title: string;
  type: 'chart' | 'diagram' | 'flowchart';
  data: Record<string, unknown> | unknown[];
}

export interface Example {
  id: string;
  title: string;
  description: string;
  industry: string;
  steps: string[];
}

export interface Template {
  id: string;
  title: string;
  type: 'excel' | 'pdf' | 'doc';
  url: string;
}

export interface Test {
  id: string;
  questions: Question[];
  passingScore: number; // 100% = 0 errors
  attemptsLeft: number; // 3 attempts
  passed: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'text';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

export interface TestAttempt {
  id: string;
  testId: string;
  answers: Record<string, string | string[]>;
  score: number;
  passed: boolean;
  completedAt: string;
}

export interface Certificate {
  id: string;
  userId: number;
  userName: string;
  courses: string[];
  completedAt: string;
  certificateUrl?: string;
  shareUrl?: string;
}

export interface DailyPlan {
  id: string;
  day: number;
  title: string;
  tasks: DailyTask[];
}

export interface DailyTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export interface AIConsultantResponse {
  response: string;
  tokens_used?: number;
  model_used?: string;
}

export interface PostLearningRecommendations {
  businessIdeas: string[];
  threeMonthPlan: string[];
  sixMonthPlan: string[];
  twelveMonthPlan: string[];
  optimizationTips: string[];
  potentialPartners: string[];
  automationTools: string[];
}

