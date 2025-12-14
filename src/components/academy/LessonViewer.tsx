import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';
import type { Lesson } from '@/types/academy';
import TestComponent from './TestComponent';
import * as academyService from '@/services/academyService';
import { formatText } from '@/utils/textFormatter.tsx';
import { safeLocalStorageSet, safeLocalStorageParse } from '@/utils/localStorage';

interface LessonViewerProps {
  lesson: Lesson;
  courseId: string;
  onComplete: () => void;
}

const LessonViewer = ({ lesson, courseId, onComplete }: LessonViewerProps) => {
  const { toast } = useToast();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(lesson.completed);
  const [showExamplesModal, setShowExamplesModal] = useState(false);
  const contentLoading = !lesson.content;
  
  const slides = lesson.content?.slides || [];
  const isLastSlide = currentSlide === slides.length - 1;
  const hasExamples = lesson.content?.examples && lesson.content.examples.length > 0;

  const handleComplete = useCallback(() => {
    try {
      academyService.updateLessonProgress(courseId, lesson.id, true);
      setLessonCompleted(true);
      
      // Сохраняем просмотренный урок
      const viewedLessons = safeLocalStorageParse<string[]>(`course_${courseId}_viewedLessons`, []);
      if (!viewedLessons.includes(lesson.id)) {
        viewedLessons.push(lesson.id);
        safeLocalStorageSet(`course_${courseId}_viewedLessons`, JSON.stringify(viewedLessons));
        toast({
          title: 'Урок просмотрен',
          description: 'Прогресс сохранен',
        });
      }
      
      onComplete();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить прогресс урока',
        variant: 'destructive',
      });
    }
  }, [courseId, lesson.id, onComplete, toast]);
  
  const handleSlideChange = (newSlide: number) => {
    setCurrentSlide(newSlide);
    // Сохраняем прогресс при переходе на последний слайд
    if (newSlide === slides.length - 1) {
      const viewedLessons = safeLocalStorageParse<string[]>(`course_${courseId}_viewedLessons`, []);
      if (!viewedLessons.includes(lesson.id)) {
        viewedLessons.push(lesson.id);
        safeLocalStorageSet(`course_${courseId}_viewedLessons`, JSON.stringify(viewedLessons));
        toast({
          title: 'Урок просмотрен',
          description: 'Прогресс сохранен',
        });
      }
    }
  };

  const handleTestComplete = (passed: boolean) => {
    if (passed) {
      handleComplete();
    }
  };

  if (lesson.type === 'test' && lesson.content?.test) {
    return (
      <TestComponent
        test={lesson.content.test}
        courseId={courseId}
        onComplete={handleTestComplete}
      />
    );
  }

  const progress = slides.length > 0 ? ((currentSlide + 1) / slides.length) * 100 : 0;
  
  if (contentLoading || (slides.length === 0 && !lesson.content?.infographics?.length && !lesson.content?.examples?.length && !lesson.content?.templates?.length)) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-spin">
            <Icon name="Loader2" size={32} className="text-primary" />
          </div>
          <p className="text-muted-foreground">Контент урока загружается...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {slides.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{lesson.title}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Слайд {currentSlide + 1} из {slides.length}
                </div>
              </div>
              <Progress value={progress} className="mt-4" />
            </CardHeader>
            <CardContent className="min-h-[400px] relative">
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold mb-4">{slides[currentSlide]?.title}</h2>
                <div className="text-muted-foreground">
                  {formatText(slides[currentSlide]?.content || '')}
                </div>
              </div>
              {isLastSlide && hasExamples && (
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 group"
                    onClick={() => setShowExamplesModal(true)}
                  >
                    <Icon name="Lightbulb" size={18} className="mr-2 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Примеры</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => handleSlideChange(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
            >
              <Icon name="ChevronLeft" className="mr-2" size={16} />
              Назад
            </Button>
            {currentSlide < slides.length - 1 ? (
              <Button onClick={() => handleSlideChange(currentSlide + 1)}>
                Далее
                <Icon name="ChevronRight" className="ml-2" size={16} />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={lessonCompleted}>
                {lessonCompleted ? (
                  <>
                    <Icon name="CheckCircle2" className="mr-2" size={16} />
                    Завершено
                  </>
                ) : (
                  <>
                    <Icon name="Check" className="mr-2" size={16} />
                    Завершить урок
                  </>
                )}
              </Button>
            )}
          </div>
        </>
      )}

      {lesson.content?.infographics && lesson.content.infographics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Инфографика</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lesson.content.infographics.map((infographic) => (
                <div key={infographic.id} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">{infographic.title}</h4>
                  <div className="text-sm text-muted-foreground">
                    Тип: {infographic.type}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}


      {lesson.content?.templates && lesson.content.templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Шаблоны и инструменты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lesson.content.templates.map((template) => {
                const handleTemplateClick = () => {
                  if (!template.url || typeof template.url !== 'string') {
                    toast({
                      title: 'Ошибка',
                      description: 'URL шаблона не указан',
                      variant: 'destructive',
                    });
                    return;
                  }
                  
                  try {
                    // Обработка относительных и абсолютных URL
                    let url: URL;
                    if (template.url.startsWith('http://') || template.url.startsWith('https://')) {
                      url = new URL(template.url);
                    } else if (template.url.startsWith('/')) {
                      url = new URL(template.url, window.location.origin);
                    } else {
                      // Относительный URL без протокола
                      url = new URL(`https://${template.url}`);
                    }
                    window.open(url.toString(), '_blank', 'noopener,noreferrer');
                  } catch (error) {
                    toast({
                      title: 'Ошибка',
                      description: 'Некорректный URL шаблона',
                      variant: 'destructive',
                    });
                  }
                };
                
                return (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleTemplateClick}
                  >
                    <Icon name="Download" className="mr-2" size={16} />
                    {template.title}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Модальное окно с примерами */}
      <Dialog open={showExamplesModal} onOpenChange={setShowExamplesModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                <Icon name="Lightbulb" size={24} className="text-white" />
              </div>
              <span>Практические примеры</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-6">
            {lesson.content?.examples
              ?.filter((ex) => ex.description)
              .map((ex, i) => (
                <div 
                  key={i} 
                  className="group relative p-5 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-md">
                      {i + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground flex-1 pt-1">{ex.description}</p>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="Sparkles" size={16} className="text-yellow-500" />
                  </div>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonViewer;

