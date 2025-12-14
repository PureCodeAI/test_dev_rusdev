// Синхронизация данных Академии с базой данных (без localStorage и офлайн-очередей)

import type { OnboardingData, Course, Lesson, TestAttempt, Certificate } from '@/types/academy';
import API_ENDPOINTS from '@/config/api';
import { logger } from '@/utils/logger';

const ensureBlocksEndpoint = (): string => {
  const endpoint = API_ENDPOINTS?.blocks;
  if (typeof endpoint !== 'string' || !endpoint.trim()) {
    throw new Error('API endpoint not properly configured');
  }
  try {
    // Validate URL
    new URL(endpoint);
  } catch {
    throw new Error('API endpoint is not a valid URL');
  }
  return endpoint;
};

const buildBlocksUrl = (
  action: string,
  params?: Record<string, string | number | boolean>
): string => {
  const base = ensureBlocksEndpoint();
  const query = new URLSearchParams({ type: 'academy', action });
  if (params) {
    Object.entries(params).forEach(([k, v]) => query.append(k, String(v)));
  }
  return `${base}?${query}`;
};

// Синхронизация онбординга
const syncOnboardingToDB = async (onboardingData: OnboardingData, userId: number): Promise<boolean> => {
  try {
    const response = await fetch(buildBlocksUrl('save_onboarding'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        onboarding_data: onboardingData,
      }),
    });
    
    return response.ok;
  } catch (error) {
    logger.error('Error syncing onboarding', error instanceof Error ? error : new Error(String(error)), { userId });
    return false;
  }
};

// Синхронизация курса
const syncCourseToDB = async (course: Course, userId: number): Promise<boolean> => {
  try {
    const response = await fetch(buildBlocksUrl('save_course'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        course: course,
      }),
    });
    
    return response.ok;
  } catch (error) {
    logger.error('Error syncing course', error instanceof Error ? error : new Error(String(error)), { userId, courseId: course.id });
    return false;
  }
};

// Синхронизация прогресса
const syncProgressToDB = async (
  data: { courseId: string; lessonId: string; completed: boolean },
  userId: number
): Promise<boolean> => {
  try {
    const response = await fetch(buildBlocksUrl('save_progress'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        course_id: data.courseId,
        lesson_id: data.lessonId,
        completed: data.completed,
      }),
    });
    
    return response.ok;
  } catch (error) {
    logger.error('Error syncing progress', error instanceof Error ? error : new Error(String(error)), { userId, courseId: data.courseId, lessonId: data.lessonId });
    return false;
  }
};

// Синхронизация попытки теста
const syncTestAttemptToDB = async (
  payload: { attempt: TestAttempt; courseId: string },
  userId: number
): Promise<boolean> => {
  try {
    const response = await fetch(buildBlocksUrl('save_test_attempt'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        course_id: payload.courseId,
        attempt: payload.attempt,
      }),
    });
    
    return response.ok;
  } catch (error) {
    logger.error('Error syncing test attempt', error instanceof Error ? error : new Error(String(error)), { userId, courseId: payload.courseId });
    return false;
  }
};

// Синхронизация сертификата
const syncCertificateToDB = async (certificate: Certificate, userId: number): Promise<boolean> => {
  try {
    const response = await fetch(buildBlocksUrl('save_certificate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        certificate: certificate,
      }),
    });
    
    return response.ok;
  } catch (error) {
    logger.error('Error syncing certificate', error instanceof Error ? error : new Error(String(error)), { userId });
    return false;
  }
};

// Получение данных пользователя с сервера
export const fetchUserAcademyData = async (
  userId: number
): Promise<{
  onboarding: OnboardingData | null;
  courses: Course[];
  lessons: Record<string, Lesson[]>;
  progress: Record<string, { completedLessons: string[]; totalLessons: number }>;
  testAttempts: Record<string, TestAttempt[]>;
  certificate: Certificate | null;
} | null> => {
  try {
    const response = await fetch(buildBlocksUrl('get_user_data', { user_id: String(userId) }));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response structure');
    }
    return {
      onboarding: data.onboarding ?? null,
      courses: Array.isArray(data.courses) ? data.courses : [],
      lessons: data.lessons && typeof data.lessons === 'object' ? data.lessons : {},
      progress: data.progress && typeof data.progress === 'object' ? data.progress : {},
      testAttempts: data.testAttempts && typeof data.testAttempts === 'object' ? data.testAttempts : {},
      certificate: data.certificate ?? null,
    };
  } catch (error) {
    logger.error('Error fetching user data', error instanceof Error ? error : new Error(String(error)), { userId });
    return null;
  }
};

// Экспортируем функции для использования в academyService (всегда требуют userId)
export const syncOnboarding = async (onboardingData: OnboardingData, userId: number): Promise<boolean> => {
  return syncOnboardingToDB(onboardingData, userId);
};

export const syncCourse = async (course: Course, userId: number): Promise<boolean> => {
  return syncCourseToDB(course, userId);
};

export const syncProgress = async (courseId: string, lessonId: string, completed: boolean, userId: number): Promise<boolean> => {
  return syncProgressToDB({ courseId, lessonId, completed }, userId);
};

export const syncTestAttempt = async (attempt: TestAttempt, courseId: string, userId: number): Promise<boolean> => {
  return syncTestAttemptToDB({ attempt, courseId }, userId);
};

export const syncCertificate = async (certificate: Certificate, userId: number): Promise<boolean> => {
  return syncCertificateToDB(certificate, userId);
};

