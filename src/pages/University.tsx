import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Course, Lesson, DailyPlan, Certificate } from '@/types/academy';
import Onboarding from './Onboarding';
import LessonViewer from '@/components/academy/LessonViewer';
import CertificateViewer from '@/components/academy/CertificateViewer';
import AIConsultant from '@/components/academy/AIConsultant';
import * as academyService from '@/services/academyService';
import { safeLocalStorageGet, safeLocalStorageSet, safeLocalStorageParse } from '@/utils/localStorage';
import DashboardLayout from '@/components/DashboardLayout';
import { Footer } from '@/components/landing/Footer';
import { logger } from '@/utils/logger';
import { useAuth } from '@/context/AuthContext';

const University = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [dailyPlan] = useState<DailyPlan | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [generating, setGenerating] = useState(false);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const generateInProgressRef = useRef(false);
  const selectedCourseInitializedRef = useRef(false);

  const generateParam = useMemo(() => searchParams.get('generate'), [searchParams]);

  const handleGenerateCourses = useCallback(async () => {
    if (generateInProgressRef.current) {
      return;
    }

    try {
      setGenerating(true);
      generateInProgressRef.current = true;
      
      const userId = user?.id;
      if (!userId) {
        toast({
          title: 'Ошибка',
          description: 'Необходима авторизация',
          variant: 'destructive',
        });
        generateInProgressRef.current = false;
        setGenerating(false);
        return;
      }
      
      const onboardingData = await academyService.getOnboardingData(userId);
      if (!onboardingData) {
        toast({
          title: 'Ошибка',
          description: 'Данные онбординга не найдены',
          variant: 'destructive',
        });
        generateInProgressRef.current = false;
        setGenerating(false);
        return;
      }
      
      const generated = await academyService.generateCourses(onboardingData, userId);
      setCourses(generated);
      
      if (generated.length > 0 && !selectedCourse) {
        setSelectedCourse(generated[0].id);
        selectedCourseInitializedRef.current = true;
      }
      
      toast({
        title: 'Успешно',
        description: 'Курсы успешно сгенерированы',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: `Не удалось сгенерировать курсы: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
      generateInProgressRef.current = false;
    }
  }, [toast, selectedCourse, user?.id]);

  // Проверка онбординга при загрузке
  useEffect(() => {
    const onboarding = safeLocalStorageGet('academyOnboarding');
    const userId = safeLocalStorageGet('userId');
    const shouldGenerate = generateParam === 'true';
    
    // Сброс при смене пользователя
    const currentUserId = userId;
    const lastUserId = safeLocalStorageGet('lastAcademyUserId');
    if (currentUserId !== lastUserId) {
      selectedCourseInitializedRef.current = false;
      if (currentUserId) {
        safeLocalStorageSet('lastAcademyUserId', currentUserId);
      }
    }
    
    if (!onboarding && !shouldGenerate) {
      setOnboardingCompleted(false);
      selectedCourseInitializedRef.current = false;
      return;
    }

    setOnboardingCompleted(true);
    
    // Загружаем курсы
    const savedCourses = academyService.getCourses();
    const hasSavedCourses = savedCourses.length > 0;
    
    if (hasSavedCourses) {
      setCourses(savedCourses);
      // Выбираем курс только если его еще не выбрали и не инициализировали
      if (!selectedCourse && !selectedCourseInitializedRef.current) {
        setSelectedCourse(savedCourses[0].id);
        selectedCourseInitializedRef.current = true;
      }
    } else if (shouldGenerate && onboarding && !generateInProgressRef.current) {
      handleGenerateCourses().catch((error) => {
        logger.error('Error generating courses', error instanceof Error ? error : new Error(String(error)), { courseId: selectedCourse || null });
      });
    }
  }, [generateParam, handleGenerateCourses, selectedCourse]);

  const loadCourseLessons = useCallback(async (courseId: string) => {
    setLessonsLoading(true);
    try {
      const lessons = academyService.getCourseLessons(courseId);
      setCourseLessons(lessons);
      
      // Безопасная загрузка сертификата
      const certificate = safeLocalStorageParse<Certificate | null>(
        `academyCertificate_${courseId}`,
        null
      );
      
      // Валидация сертификата
      if (certificate && certificate.id && certificate.userName && certificate.courses) {
        setCertificate(certificate);
      } else {
        setCertificate(null);
      }
    } catch (error) {
      logger.error('Error loading course lessons', error instanceof Error ? error : new Error(String(error)), { courseId });
      toast({
        title: 'Ошибка загрузки уроков',
        description: 'Не удалось загрузить уроки курса',
        variant: 'destructive',
      });
      setCourseLessons([]);
      setCertificate(null);
    } finally {
      setLessonsLoading(false);
    }
  }, [toast]);

  // Загрузка уроков при выборе курса с cleanup
  useEffect(() => {
    if (!selectedCourse) return;
    
    let isActive = true;
    
    const loadData = async () => {
      await loadCourseLessons(selectedCourse);
      if (!isActive) {
        // Отменяем обновление состояния, если компонент размонтирован
        return;
      }
    };
    
    loadData();
    
    return () => {
      isActive = false;
    };
  }, [selectedCourse, loadCourseLessons]);


  // Если онбординг не пройден, показываем его
  if (!onboardingCompleted) {
    return (
      <DashboardLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <Onboarding />
        </div>
        <Footer />
      </DashboardLayout>
    );
  }

  // Если курсы еще генерируются
  if (generating) {
    return (
      <DashboardLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-spin">
                <Icon name="Loader2" size={32} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Генерация курсов</h3>
              <p className="text-sm text-muted-foreground">
                ИИ создает персонализированную программу обучения для вас...
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </DashboardLayout>
    );
  }

  // Если нет курсов
  if (courses.length === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-12 text-center">
              <Icon name="BookOpen" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Курсы не найдены</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Пройдите онбординг для генерации персонализированных курсов
              </p>
              <Button onClick={() => navigate('/university?onboarding=true')}>
                Пройти онбординг
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </DashboardLayout>
    );
  }

  // Получаем выбранный курс
  const selectedCourseData = courses.find((c) => c.id === selectedCourse) || courses[0];
  const courseProgress = selectedCourseData ? academyService.getCourseProgress(selectedCourseData.id) : 0;
  const completedLessons = courseLessons.filter((l) => l.completed).length;
  const totalLessons = courseLessons.length > 0 ? courseLessons.length : (selectedCourseData?.lessons || 0);

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-200px)] flex bg-muted/30">
        <aside className="w-80 bg-white border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate('/dashboard')}>
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            На главную
          </Button>
          <h2 className="text-2xl font-bold mb-1">Академия бизнеса</h2>
          <p className="text-sm text-muted-foreground">Обучение для предпринимателей</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course.id)}
                className={`w-full p-4 text-left rounded-lg transition-all ${
                  selectedCourse === course.id
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'hover:bg-muted/50 border-2 border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    course.completed
                      ? 'bg-green-100'
                      : course.inProgress
                      ? 'bg-blue-100'
                      : 'bg-gray-100'
                  }`}>
                    <Icon
                      name={course.icon}
                      size={20}
                      className={
                        course.completed
                          ? 'text-green-600'
                          : course.inProgress
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm truncate">{course.title}</h4>
                      {course.completed && (
                        <Icon name="CheckCircle2" size={16} className="text-green-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{course.lessons} уроков • {course.duration}</p>
                    {course.progress > 0 && (
                      <div>
                        <Progress value={course.progress} className="h-1.5" />
                        <p className="text-xs text-muted-foreground mt-1">{course.progress}%</p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 bg-white border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">{selectedCourseData?.title || 'Выберите курс'}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Icon name="BookOpen" size={16} />
                  {totalLessons} уроков
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Clock" size={16} />
                  {selectedCourseData?.duration || 'N/A'}
                </span>
                {selectedCourseData?.completed ? (
                  <Badge className="bg-green-100 text-green-700">Завершен</Badge>
                ) : selectedCourseData?.inProgress ? (
                  <Badge className="bg-blue-100 text-blue-700">В процессе</Badge>
                ) : (
                  <Badge variant="secondary">Не начат</Badge>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Прогресс курса</div>
              <div className="flex items-center gap-3">
                <Progress value={courseProgress} className="w-32" />
                <span className="text-lg font-bold">{courseProgress}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-y-auto p-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>О курсе</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {selectedCourseData?.description || 'Описание курса загружается...'}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (!selectedCourseData) return;
                      const nextLesson = courseLessons.find((l) => !l.completed && !l.locked);
                      if (nextLesson) {
                        setSelectedLesson(nextLesson);
                      } else if (courseLessons.length === 0) {
                        toast({
                          title: 'Уроки не загружены',
                          description: 'Уроки будут доступны после начала обучения',
                        });
                      } else {
                        toast({
                          title: 'Все уроки завершены',
                          description: 'Перейдите к тесту для завершения курса',
                        });
                      }
                    }}
                  >
                    <Icon name="Play" className="mr-2" size={16} />
                    Продолжить обучение
                  </Button>
                  <Button variant="outline">
                    <Icon name="Download" className="mr-2" size={16} />
                    Скачать материалы
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Уроки курса</CardTitle>
                <CardDescription>
                  {totalLessons} уроков • Прогресс: {completedLessons}/{totalLessons}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lessonsLoading ? (
                    <div className="text-center p-8 text-muted-foreground">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-spin">
                        <Icon name="Loader2" size={32} className="text-primary" />
                      </div>
                      <p>Загрузка уроков...</p>
                    </div>
                  ) : courseLessons.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                      <Icon name="BookOpen" size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Уроки будут доступны после начала обучения</p>
                    </div>
                  ) : (
                    courseLessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                        lesson.locked
                          ? 'border-border bg-muted/30 cursor-not-allowed'
                          : lesson.inProgress
                          ? 'border-blue-500 bg-blue-50/50 hover:bg-blue-50'
                          : lesson.completed
                          ? 'border-green-500 bg-green-50/50 hover:bg-green-50'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      disabled={lesson.locked}
                      onClick={() => !lesson.locked && setSelectedLesson(lesson)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          lesson.locked
                            ? 'bg-gray-200'
                            : lesson.inProgress
                            ? 'bg-blue-100'
                            : lesson.completed
                            ? 'bg-green-100'
                            : 'bg-gray-100'
                        }`}>
                          <Icon
                            name={lesson.locked ? 'Lock' : lesson.completed ? 'CheckCircle2' : lesson.inProgress ? 'Play' : 'Circle'}
                            size={20}
                            className={
                              lesson.locked
                                ? 'text-gray-400'
                                : lesson.inProgress
                                ? 'text-blue-600'
                                : lesson.completed
                                ? 'text-green-600'
                                : 'text-gray-400'
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{lesson.title}</h4>
                          <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                        </div>
                        {lesson.inProgress && (
                          <Badge className="bg-blue-100 text-blue-700">Текущий</Badge>
                        )}
                      </div>
                    </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Award" />
                  Сертификат
                </CardTitle>
                <CardDescription>Получите сертификат после прохождения всех уроков</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 border-2 border-dashed border-border rounded-lg text-center bg-muted/30">
                  {certificate ? (
                    <>
                      <Icon name="Award" size={48} className="mx-auto mb-4 text-primary" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Поздравляем! Вы получили сертификат об окончании курса
                      </p>
                      <Button onClick={() => setCertificateDialogOpen(true)}>
                        <Icon name="Award" className="mr-2" size={16} />
                        Посмотреть сертификат
                      </Button>
                    </>
                  ) : (
                    <>
                      <Icon name="Award" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground mb-4">
                        {selectedCourseData && courseProgress === 100
                          ? 'Пройдите финальный тест для получения сертификата'
                          : 'Завершите все уроки и пройдите тест для получения сертификата'}
                      </p>
                      <Button disabled={!selectedCourseData || courseProgress < 100}>
                        <Icon name="Lock" className="mr-2" size={16} />
                        {selectedCourseData && courseProgress === 100
                          ? 'Сертификат будет доступен после теста'
                          : 'Сертификат заблокирован'}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="w-80 border-l border-border bg-white p-6 overflow-y-auto">
            <Card className="mb-6 border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">Дневной план</CardTitle>
                <CardDescription>День 2: Изучение бухгалтерии</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dailyPlan?.tasks?.map((task, i) => (
                    <div key={task.id || i} className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        className="mt-1"
                        readOnly
                      />
                      <span className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.text}
                      </span>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">Дневной план будет доступен после начала обучения</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="Sparkles" />
                  AI-консультант
                </CardTitle>
                <CardDescription>Помощник по обучению</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => setAiChatOpen(!aiChatOpen)}>
                  <Icon name="MessageSquare" className="mr-2" size={16} />
                  Открыть чат
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      {/* Диалог просмотра урока */}
      {selectedLesson && selectedCourseData && (
        <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedLesson.title}</DialogTitle>
            </DialogHeader>
            <LessonViewer
              lesson={selectedLesson}
              courseId={selectedCourseData.id}
              onComplete={() => {
                setSelectedLesson(null);
                loadCourseLessons(selectedCourseData.id);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Диалог сертификата */}
      {certificate && (
        <Dialog open={certificateDialogOpen} onOpenChange={setCertificateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Сертификат об окончании</DialogTitle>
            </DialogHeader>
            <CertificateViewer certificate={certificate} />
          </DialogContent>
        </Dialog>
      )}

      {/* AI-консультант */}
      {aiChatOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border-2 border-border flex flex-col z-50">
          <div className="p-4 border-b border-border flex items-center justify-between bg-primary text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Icon name="Sparkles" size={20} />
              <h3 className="font-semibold">AI-консультант</h3>
            </div>
            <button onClick={() => setAiChatOpen(false)}>
              <Icon name="X" size={20} />
            </button>
          </div>
          <AIConsultant courseId={selectedCourseData?.id} lessonId={selectedLesson?.id} />
        </div>
      )}
      </div>
      <Footer />
    </DashboardLayout>
  );
};

export default University;
