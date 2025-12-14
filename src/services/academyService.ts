// Сервис для работы с Академией бизнеса

import type { OnboardingData, Course, Lesson, Test, TestAttempt, Certificate } from '@/types/academy';
import API_ENDPOINTS from '@/config/api';
import {
  syncOnboarding,
  syncCourse,
  syncProgress,
  syncTestAttempt,
  syncCertificate,
  fetchUserAcademyData,
} from './academySync';
import { safeLocalStorageSet, safeLocalStorageParse, safeLocalStorageGet } from '@/utils/localStorage';

// Получить userId из localStorage
const getUserId = (): number | null => {
  const userIdStr = safeLocalStorageGet('userId');
  if (userIdStr) {
    const userId = Number(userIdStr);
    if (!isNaN(userId)) {
      return userId;
    }
  }
  return null;
};

// Кеш для уроков
const lessonsCache = new Map<string, { data: Lesson[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

// Кеш для курсов
const coursesCache: { data: Course[] | null; timestamp: number } = { data: null, timestamp: 0 };

// Получить данные онбординга только с сервера
export const getOnboardingData = async (userId: number): Promise<OnboardingData | null> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.blocks}?type=academy&action=get_onboarding`, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': String(userId),
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data || null;
  } catch {
    return null;
  }
};

// Сохранить данные онбординга (только сервер)
export const saveOnboardingData = async (data: OnboardingData, userId: number): Promise<void> => {
  await syncOnboarding(data, userId);
};

// Генерация уникального ID
const generateUniqueId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (error) {
      // Fallback для старых браузеров
    }
  }
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const perf = typeof performance !== 'undefined' && performance.now 
    ? performance.now().toString(36).replace('.', '') 
    : Math.random().toString(36).substring(2, 9);
  return `course_${timestamp}_${random}_${perf}`;
};

// Генерация курсов через ИИ API
export const generateCourses = async (onboardingData: OnboardingData, _userId?: number): Promise<Course[]> => {
  try {
    // Используем новый AI сервис
    const { generateCoursesWithAI } = await import('@/services/aiService');
    
    const aiResponse = await generateCoursesWithAI(onboardingData as Record<string, unknown>);
    
    if (!aiResponse) {
      throw new Error('AI не вернул ответ');
    }
    
    // Парсим JSON ответ от AI
    let data: unknown;
    try {
      data = JSON.parse(aiResponse);
    } catch {
      // Если не JSON, пытаемся извлечь JSON из текста
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Не удалось распарсить ответ AI');
      }
    }
    
    if (!Array.isArray(data)) {
      // Если AI вернул объект с полем courses
      const coursesData = (data as { courses?: unknown }).courses;
      if (Array.isArray(coursesData)) {
        data = coursesData;
      } else {
        throw new Error('Invalid response format: expected array of courses');
      }
    }

    // Обработка вопросов из ИИ (с пометкой * для правильных ответов)
    const processQuestionsFromAI = (questions: unknown[]): unknown[] => {
      if (!Array.isArray(questions)) {
        return [];
      }

      return questions.map((q) => {
        if (!q || typeof q !== 'object') {
          return q;
        }

        const questionObj = q as Record<string, unknown>;
        if (questionObj.options && Array.isArray(questionObj.options)) {
          // Извлекаем правильные ответы из options (помечены *)
          const processedOptions = questionObj.options
            .filter((opt: unknown) => typeof opt === 'string')
            .map((opt: string) => opt.replace(/\*$/, '').trim());
          
          const correctOptions = questionObj.options
            .filter((opt: unknown) => typeof opt === 'string' && (opt as string).trim().endsWith('*'))
            .map((opt: string) => opt.replace(/\*$/, '').trim());
          
          return {
            ...questionObj,
            options: processedOptions,
            correctAnswer: questionObj.type === 'single' ? (correctOptions[0] || '') : correctOptions,
          };
        }
        
        return questionObj;
      });
    };

    const courses: Course[] = (data as unknown[]).map((course: unknown) => {
      if (!course || typeof course !== 'object') {
        throw new Error('Invalid course format');
      }
      const courseObj = course as Record<string, unknown>;
      // Обрабатываем тест, если есть
      let processedTest = courseObj.test;
      if (processedTest && typeof processedTest === 'object' && 'questions' in processedTest) {
        const testObj = processedTest as { questions?: unknown[] };
        processedTest = {
          ...testObj,
          questions: processQuestionsFromAI(testObj.questions || []),
        };
      }

      // Обрабатываем уроки, если они приходят в ответе
      let processedLessons: unknown[] = [];
      if (courseObj.lessons && Array.isArray(courseObj.lessons)) {
        processedLessons = courseObj.lessons.map((lesson: unknown, index: number) => {
          if (!lesson || typeof lesson !== 'object') {
            return null;
          }
          const lessonObj = lesson as Record<string, unknown>;
          return {
            id: (lessonObj.id as string) || `lesson_${generateUniqueId()}_${index}`,
            title: (lessonObj.title as string) || `Урок ${index + 1}`,
            type: (lessonObj.type as string) || 'theory',
            duration: (lessonObj.duration as string) || '15-20 минут',
            completed: false,
            inProgress: false,
            locked: index > 0,
            content: {
              slides: (lessonObj.slides as unknown[]) || [],
              infographics: (lessonObj.infographics as unknown[]) || [],
              examples: (lessonObj.examples as unknown[]) || [],
              templates: (lessonObj.templates as unknown[]) || [],
            },
            practicalTask: ((lessonObj.practical_task || lessonObj.practicalTask) as string) || '',
          };
        }).filter((lesson): lesson is NonNullable<typeof lesson> => lesson !== null);
      }

      const courseData = courseObj.course as Record<string, unknown> | undefined;
      return {
        id: (courseObj.id as string) || generateUniqueId(),
        title: (courseObj.title as string) || (courseData?.title as string) || 'Без названия',
        description: (courseObj.description as string) || (courseData?.description as string) || '',
        icon: (courseObj.icon as string) || 'BookOpen',
        lessons: typeof courseObj.lessons === 'number' 
          ? (courseObj.lessons as number)
          : (processedLessons.length > 0 
              ? processedLessons.length 
              : ((Array.isArray(courseObj.lessons) ? courseObj.lessons.length : 0) || 
                 (Array.isArray(courseData?.lessons) ? (courseData?.lessons as unknown[]).length : 0))),
        duration: (courseObj.duration as string) || '0 часов',
        progress: 0,
        completed: false,
        inProgress: false,
        generatedAt: (courseObj.generated_at as string) || (courseObj.generatedAt as string) || new Date().toISOString(),
        personalizedFor: onboardingData,
        test: (processedTest as Course['test']) || (courseData?.test as Course['test']),
        // Сохраняем уроки для последующей загрузки
        _lessons: processedLessons.length > 0 ? processedLessons : undefined,
      };
    });

    // Сохраняем уроки для каждого курса
    courses.forEach((course) => {
      const courseWithLessons = course as Course & { _lessons?: Lesson[] };
      if (courseWithLessons._lessons && Array.isArray(courseWithLessons._lessons) && courseWithLessons._lessons.length > 0) {
        saveCourseLessons(course.id, courseWithLessons._lessons);
        delete courseWithLessons._lessons;
      }
    });

    safeLocalStorageSet('academyCourses', JSON.stringify(courses));
    
    // Синхронизация курсов с БД
    const userId = getUserId();
    if (userId) {
      courses.forEach(course => {
        syncCourse(course, userId).catch(() => {
          // Игнорируем ошибки синхронизации
        });
      });
    }
    
    return courses;
  } catch (error) {
    throw new Error(`Ошибка генерации курсов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  }
};

// Получить курсы
export const getCourses = (): Course[] => {
  const now = Date.now();
  if (coursesCache.data && (now - coursesCache.timestamp) < CACHE_TTL) {
    return coursesCache.data;
  }
  
  const courses = safeLocalStorageParse<Course[]>('academyCourses', []);
  coursesCache.data = courses;
  coursesCache.timestamp = now;
  return courses;
};

// Сохранить курсы
export const saveCourses = (courses: Course[]): void => {
  safeLocalStorageSet('academyCourses', JSON.stringify(courses));
  coursesCache.data = courses;
  coursesCache.timestamp = Date.now();
  
  // Синхронизация с БД
  const userId = getUserId();
  if (userId) {
    courses.forEach(course => {
      syncCourse(course, userId).catch(() => {
        // Игнорируем ошибки синхронизации
      });
    });
  }
};

// Получить уроки курса
export const getCourseLessons = (courseId: string): Lesson[] => {
  const cached = lessonsCache.get(courseId);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  
  const lessons = safeLocalStorageParse<Lesson[]>(`academyLessons_${courseId}`, []);
  lessonsCache.set(courseId, { data: lessons, timestamp: now });
  return lessons;
};

// Сохранить уроки курса
export const saveCourseLessons = (courseId: string, lessons: Lesson[]): void => {
  safeLocalStorageSet(`academyLessons_${courseId}`, JSON.stringify(lessons));
  lessonsCache.set(courseId, { data: lessons, timestamp: Date.now() });
};

// Инвалидация кеша
export const invalidateCache = (courseId?: string): void => {
  if (courseId) {
    lessonsCache.delete(courseId);
  } else {
    lessonsCache.clear();
    coursesCache.data = null;
    coursesCache.timestamp = 0;
  }
};

// Инициализация синхронизации между вкладками
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && (e.key.startsWith('academy') || e.key.startsWith('academyLessons_') || e.key.startsWith('academyTest_'))) {
      invalidateCache();
    }
  });
}

// Получить прогресс курса
export const getCourseProgress = (courseId: string): number => {
  const lessons = getCourseLessons(courseId);
  if (lessons.length === 0) return 0;
  const completed = lessons.filter((l) => l.completed).length;
  const progress = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;
  return Math.min(100, Math.max(0, progress));
};

// Обновить прогресс урока
export const updateLessonProgress = (courseId: string, lessonId: string, completed: boolean): void => {
  const lessons = getCourseLessons(courseId);
  const updated = lessons.map((l) =>
    l.id === lessonId ? { ...l, completed, inProgress: !completed } : l
  );
  saveCourseLessons(courseId, updated);
  
  // Инвалидируем кеш для обновления прогресса
  invalidateCache(courseId);
  
  // Обновляем прогресс курса
  const courses = getCourses();
  const updatedCourses = courses.map((c) =>
    c.id === courseId ? { ...c, progress: getCourseProgress(courseId) } : c
  );
  saveCourses(updatedCourses);
  
  // Синхронизация прогресса с БД
  const userId = getUserId();
  if (userId) {
    syncProgress(courseId, lessonId, completed, userId).catch(() => {
      // Игнорируем ошибки синхронизации
    });
  }
};

// Получить тест курса
export const getCourseTest = (courseId: string): Test | null => {
  return safeLocalStorageParse<Test | null>(`academyTest_${courseId}`, null);
};

// Сохранить тест
export const saveCourseTest = (courseId: string, test: Test): void => {
  safeLocalStorageSet(`academyTest_${courseId}`, JSON.stringify(test));
};

// Сохранить попытку теста
export const saveTestAttempt = (courseId: string, attempt: TestAttempt): void => {
  const attempts = getTestAttempts(courseId);
  attempts.push(attempt);
  safeLocalStorageSet(`academyTestAttempts_${courseId}`, JSON.stringify(attempts));
  
  // Синхронизация с БД
  const userId = getUserId();
  if (userId) {
    syncTestAttempt(attempt, courseId, userId).catch(() => {
      // Игнорируем ошибки синхронизации
    });
  }
};

// Получить попытки теста
export const getTestAttempts = (courseId: string): TestAttempt[] => {
  return safeLocalStorageParse<TestAttempt[]>(`academyTestAttempts_${courseId}`, []);
};

// Проверить, можно ли пересдать тест
export const canRetakeTest = (courseId: string): boolean => {
  const attempts = getTestAttempts(courseId);
  const failedAttempts = attempts.filter((a) => !a.passed);
  return failedAttempts.length < 3;
};

// Получить данные пользователя с сервера
export const getUserAcademyData = async (userId: number) => {
  return await fetchUserAcademyData(userId);
};

// Двусторонняя синхронизация данных
export const syncUserData = async (userId: number) => {
  return await fetchUserAcademyData(userId);
};

// Принудительная синхронизация очереди
export const forceSync = async () => {
  // Queue processing removed - using direct sync instead
  return true;
};

// Сохранить сертификат (с синхронизацией)
export const saveCertificate = (courseId: string, certificate: Certificate): void => {
  safeLocalStorageSet(`academyCertificate_${courseId}`, JSON.stringify(certificate));
  // Синхронизация с БД
  const userId = getUserId();
  if (userId) {
    syncCertificate(certificate, userId).catch(() => {
      // Игнорируем ошибки синхронизации
    });
  }
};

