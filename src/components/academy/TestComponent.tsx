import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';
import type { Test, TestAttempt } from '@/types/academy';
import * as academyService from '@/services/academyService';

interface TestComponentProps {
  test: Test;
  courseId: string;
  onComplete: (passed: boolean) => void;
  onRetake?: () => void;
}

const TestComponent = ({ test, courseId, onComplete, onRetake }: TestComponentProps) => {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [canRetake, setCanRetake] = useState(true);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAllResults, setShowAllResults] = useState(false);

  useEffect(() => {
    // Валидация теста
    if (!test || !Array.isArray(test.questions) || test.questions.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Тест не загружен или не содержит вопросов',
        variant: 'destructive',
      });
      return;
    }

    const savedAttempts = academyService.getTestAttempts(courseId);
    setAttempts(savedAttempts);
    const canRetakeValue = academyService.canRetakeTest(courseId);
    setCanRetake(canRetakeValue);
    const failedCount = savedAttempts.filter((a) => !a.passed).length;
    setRemainingAttempts(Math.max(0, 3 - failedCount));

    // Cleanup функция
    return () => {
      // Очистка при размонтировании (если нужно)
    };
  }, [courseId, test, toast]);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    const answeredQuestions = test.questions.filter((q) => {
      const answer = answers[q.id];
      if (q.type === 'text') {
        return typeof answer === 'string' && answer.trim().length > 0;
      }
      if (q.type === 'multiple') {
        return Array.isArray(answer) && answer.length > 0;
      }
      return answer !== undefined && answer !== null && answer !== '';
    });

    if (answeredQuestions.length !== test.questions.length) {
      toast({
        title: 'Внимание',
        description: 'Ответьте на все вопросы перед отправкой',
        variant: 'destructive',
      });
      return;
    }

    // Проверяем ответы
    let errors = 0;
    const newResults: Record<string, boolean> = {};

    test.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      let isCorrect = false;

      if (question.type === 'text') {
        if (typeof userAnswer === 'string' && typeof question.correctAnswer === 'string') {
          const userNormalized = userAnswer.trim().toLowerCase().replace(/\s+/g, ' ');
          const correctNormalized = question.correctAnswer.trim().toLowerCase().replace(/\s+/g, ' ');
          isCorrect = userNormalized === correctNormalized;
        }
      } else if (Array.isArray(question.correctAnswer)) {
        isCorrect = Array.isArray(userAnswer) &&
                   question.correctAnswer.length === userAnswer.length &&
                   question.correctAnswer.every((ans) => userAnswer.includes(ans));
      } else {
        isCorrect = userAnswer === question.correctAnswer;
      }

      newResults[question.id] = isCorrect;
      if (!isCorrect) errors++;
    });

    setResults(newResults);
    setSubmitted(true);
    setShowResults(true);

    const passed = errors === 0;
    const score = ((test.questions.length - errors) / test.questions.length) * 100;

    const attempt: TestAttempt = {
      id: `attempt_${Date.now()}`,
      testId: test.id,
      answers,
      score,
      passed,
      completedAt: new Date().toISOString(),
    };

    academyService.saveTestAttempt(courseId, attempt);

    const updatedAttempts = [...attempts, attempt];
    setAttempts(updatedAttempts);

    const failedCount = updatedAttempts.filter((a) => !a.passed).length;
    const newRemainingAttempts = Math.max(0, 3 - failedCount);
    setRemainingAttempts(newRemainingAttempts);
    
    // Если тест не пройден, показываем все результаты
    if (!passed) {
      setShowAllResults(true);
    }

    if (passed) {
      toast({
        title: 'Поздравляем!',
        description: 'Вы успешно прошли тест!',
      });
      onComplete(true);
    } else {
      if (newRemainingAttempts <= 0) {
        toast({
          title: 'Тест не пройден',
          description: 'У вас закончились попытки. Необходимо перезапустить курс.',
          variant: 'destructive',
        });
        setCanRetake(false);
      } else {
        toast({
          title: 'Тест не пройден',
          description: `Ошибок: ${errors}. Осталось попыток: ${newRemainingAttempts}`,
          variant: 'destructive',
        });
      }
    }
  };

  const handleNext = () => {
    const userAnswer = answers[currentQuestion.id];
    if (!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
      toast({
        title: 'Внимание',
        description: 'Пожалуйста, ответьте на вопрос перед переходом',
        variant: 'destructive',
      });
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRetake = () => {
    if (!canRetake) {
      toast({
        title: 'Попытки закончились',
        description: 'Необходимо перезапустить курс',
        variant: 'destructive',
      });
      return;
    }

    setAnswers({});
    setSubmitted(false);
    setShowResults(false);
    setShowAllResults(false);
    setCurrentQuestionIndex(0);
    if (onRetake) {
      onRetake();
    }
  };

  // Если показываем все результаты после несданного теста
  if (showAllResults && submitted) {
    const wrongAnswers = test.questions.filter((q) => !results[q.id]);
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-red-600">Тест не пройден</CardTitle>
                <CardDescription>
                  Ошибок: {wrongAnswers.length} из {test.questions.length}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Попыток осталось</div>
                <div className="text-2xl font-bold text-primary">{remainingAttempts}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <Icon name="AlertCircle" className="text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Вопросы с неправильными ответами:</strong>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {wrongAnswers.map((question) => {
                const userAnswer = answers[question.id];
                const questionIndex = test.questions.findIndex(q => q.id === question.id);
                return (
                  <Card
                    key={question.id}
                    className="border-red-500 bg-red-50/50"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold">{questionIndex + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-4">{question.text}</h4>
                          
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-red-700 mb-2">Ваш ответ:</p>
                            <div className="p-3 bg-red-100 rounded-lg border border-red-300">
                              {Array.isArray(userAnswer) ? userAnswer.join(', ') : (userAnswer || 'Не ответили')}
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-green-700 mb-2">Правильный ответ:</p>
                            <div className="p-3 bg-green-100 rounded-lg border border-green-300">
                              {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}
                            </div>
                          </div>
                          
                          {question.explanation && (
                            <Alert className="mt-4 border-blue-200 bg-blue-50">
                              <Icon name="Info" className="text-blue-600" />
                              <AlertDescription className="text-blue-800">
                                <strong>Объяснение:</strong> {question.explanation}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <div className="flex gap-4 pt-4 border-t">
              {remainingAttempts > 0 && canRetake ? (
                <Button onClick={handleRetake} variant="outline" className="flex-1" size="lg">
                  <Icon name="RotateCw" className="mr-2" size={18} />
                  Пересдать тест
                </Button>
              ) : (
                <Alert className="flex-1 border-red-200 bg-red-50">
                  <Icon name="AlertCircle" className="text-red-600" />
                  <AlertDescription className="text-red-800">
                    У вас закончились попытки. Необходимо перезапустить курс.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!test || !Array.isArray(test.questions) || test.questions.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <Icon name="HelpCircle" size={48} className="mx-auto mb-4 opacity-50" />
        <p>Тест пока недоступен или некорректно настроен.</p>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  if (!currentQuestion) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <Icon name="HelpCircle" size={48} className="mx-auto mb-4 opacity-50" />
        <p>Вопрос не найден.</p>
      </div>
    );
  }

  const userAnswer = answers[currentQuestion.id];
  const isCorrect = showResults ? results[currentQuestion.id] : undefined;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Итоговый тест</CardTitle>
              <CardDescription>
                Вопрос {currentQuestionIndex + 1} из {test.questions.length}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Попыток осталось</div>
              <div className="text-2xl font-bold text-primary">{remainingAttempts}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card
            className={`${
              showResults
                ? isCorrect
                  ? 'border-green-500 bg-green-50/50'
                  : 'border-red-500 bg-red-50/50'
                : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary">{currentQuestionIndex + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-4">{currentQuestion.text}</h4>

                  {currentQuestion.type === 'single' && Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0 && (
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, optIndex) => {
                        const isSelected = userAnswer === option;
                        return (
                          <div
                            key={optIndex}
                            className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-all ${
                              isSelected ? 'bg-primary/10 border-2 border-primary' : 'hover:bg-muted/50 border-2 border-transparent'
                            }`}
                            onClick={() => !submitted && handleAnswerChange(currentQuestion.id, option)}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center ${
                              isSelected ? 'bg-primary text-white' : 'border-2 border-muted-foreground'
                            }`}>
                              {isSelected && <Icon name="Check" size={14} />}
                            </div>
                            <Label className="flex-1 cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {currentQuestion.type === 'multiple' && Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0 && (
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, optIndex) => {
                        const selected = Array.isArray(userAnswer) && userAnswer.includes(option);
                        return (
                          <div
                            key={optIndex}
                            className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-all ${
                              selected ? 'bg-primary/10 border-2 border-primary' : 'hover:bg-muted/50 border-2 border-transparent'
                            }`}
                            onClick={() => {
                              if (submitted) return;
                              const current = (userAnswer as string[]) || [];
                              if (selected) {
                                handleAnswerChange(currentQuestion.id, current.filter((a) => a !== option));
                              } else {
                                handleAnswerChange(currentQuestion.id, [...current, option]);
                              }
                            }}
                          >
                            <Checkbox
                              id={`${currentQuestion.id}_${optIndex}`}
                              checked={selected}
                              disabled={submitted}
                            />
                            <Label htmlFor={`${currentQuestion.id}_${optIndex}`} className="flex-1 cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {currentQuestion.type === 'text' && (
                    <Input
                      value={userAnswer as string || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder="Введите ваш ответ"
                      disabled={submitted}
                    />
                  )}

                  {showResults && !isCorrect && currentQuestion.explanation && (
                    <Alert className="mt-4 border-red-200 bg-red-50">
                      <Icon name="AlertCircle" className="text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>Правильный ответ:</strong> {Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer.join(', ') : currentQuestion.correctAnswer}
                        <br />
                        <strong>Объяснение:</strong> {currentQuestion.explanation}
                      </AlertDescription>
                    </Alert>
                  )}

                  {showResults && isCorrect && currentQuestion.explanation && (
                    <Alert className="mt-4 border-green-200 bg-green-50">
                      <Icon name="CheckCircle2" className="text-green-600" />
                      <AlertDescription className="text-green-800">
                        Правильно! {currentQuestion.explanation}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-4 border-t">
            {!submitted ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isFirstQuestion}
                  className="flex-1"
                >
                  <Icon name="ChevronLeft" className="mr-2" size={18} />
                  Назад
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1"
                  disabled={!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)}
                >
                  {isLastQuestion ? (
                    <>
                      <Icon name="Send" className="mr-2" size={18} />
                      Отправить ответы
                    </>
                  ) : (
                    <>
                      Далее
                      <Icon name="ChevronRight" className="ml-2" size={18} />
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                {remainingAttempts > 0 && canRetake ? (
                  <Button onClick={handleRetake} variant="outline" className="flex-1" size="lg">
                    <Icon name="RotateCw" className="mr-2" size={18} />
                    Пересдать тест
                  </Button>
                ) : (
                  <Alert className="flex-1 border-red-200 bg-red-50">
                    <Icon name="AlertCircle" className="text-red-600" />
                    <AlertDescription className="text-red-800">
                      У вас закончились попытки. Необходимо перезапустить курс.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestComponent;
