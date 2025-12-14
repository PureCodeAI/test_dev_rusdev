import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/components/ui/use-toast';

export const ErrorReport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [fullLineText, setFullLineText] = useState('');
  const [comment, setComment] = useState('');
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const { toast } = useToast();

  // Получить полную строку с выделенным текстом
  const getFullLineWithSelection = (selection: Selection): { fullText: string; selectedText: string } => {
    if (!selection.rangeCount) {
      return { fullText: '', selectedText: '' };
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    
    // Получаем родительский элемент
    let container = range.commonAncestorContainer;
    
    // Если это текстовый узел, берем его родителя
    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentElement || container;
    }
    
    // Ищем ближайший блочный элемент (p, div, li, span и т.д.)
    if (container instanceof Element) {
      // Ищем ближайший элемент, который содержит текст (p, div, span, li, h1-h6, и т.д.)
      let textContainer: Element | null = null;
      let current: Element | null = container as Element;
      
      while (current) {
        // Проверяем, является ли элемент текстовым контейнером
        const tagName = current.tagName.toLowerCase();
        if (['p', 'div', 'span', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'td', 'th', 'label', 'a', 'button'].includes(tagName)) {
          textContainer = current;
          break;
        }
        current = current.parentElement;
      }
      
      if (textContainer) {
        // Получаем весь текст контейнера
        const fullText = textContainer.textContent || '';
        return {
          fullText: fullText.trim(),
          selectedText: selectedText
        };
      }
      
      // Если не нашли подходящий контейнер, используем весь текст элемента
      const fullText = container.textContent || '';
      return {
        fullText: fullText.trim() || selectedText,
        selectedText: selectedText
      };
    }
    
    return {
      fullText: selectedText,
      selectedText: selectedText
    };
  };

  // Форматирование текста с выделением
  const formatTextWithHighlight = (fullText: string, selectedText: string) => {
    if (!selectedText || !fullText) {
      return fullText;
    }

    // Находим все вхождения выделенного текста (регистронезависимо)
    const regex = new RegExp(`(${selectedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = fullText.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === selectedText.toLowerCase()) {
        return (
          <span key={index} className="bg-red-200 font-semibold text-red-900 px-1 rounded">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter или Cmd+Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
          e.preventDefault();
          
          const { fullText, selectedText: selText } = getFullLineWithSelection(selection);
          setSelectedText(selText);
          setFullLineText(fullText || selText);
          setIsOpen(true);
        } else {
          // Если текст не выделен, показываем подсказку
          setShowInfoDialog(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSend = async () => {
    if (!selectedText.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Выделите текст для отправки сообщения об ошибке',
        variant: 'destructive',
      });
      return;
    }

    try {
      await fetch('/api/error-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedText,
          fullLine: fullLineText,
          comment,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      });

      toast({
        title: 'Спасибо!',
        description: 'Сообщение об ошибке отправлено',
      });

      setIsOpen(false);
      setSelectedText('');
      setFullLineText('');
      setComment('');
      
      // Снимаем выделение
      window.getSelection()?.removeAllRanges();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {/* Боковое модальное окно отправки ошибки */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Ошибка в тексте</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label>Выделенный текст</Label>
              <div className="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700 leading-relaxed">
                  «{formatTextWithHighlight(fullLineText, selectedText)}»
                </p>
              </div>
            </div>
            <div>
              <Label htmlFor="comment">Ваш комментарий</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Опишите ошибку или предложение..."
                className="mt-2 min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSend}>
                <Icon name="Send" className="mr-2" size={16} />
                Отправить
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Информационное боковое окно */}
      <Sheet open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Icon name="Info" size={24} className="text-slate-600" />
              </div>
            </div>
            <SheetTitle className="text-center">Обратите внимание</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <p className="text-center text-slate-600 mb-6">
              Чтобы отправить сообщение об ошибке, выделите фрагмент текста и нажмите комбинацию клавиш Ctrl+Enter или ⌘+Enter
            </p>
            <div className="flex justify-center">
              <Button onClick={() => setShowInfoDialog(false)}>
                Хорошо
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
