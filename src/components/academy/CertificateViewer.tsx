import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';
import API_ENDPOINTS from '@/config/api';
import { retryFetch } from '@/utils/retryFetch';
import type { Certificate } from '@/types/academy';

interface CertificateViewerProps {
  certificate: Certificate;
  onShare?: () => void;
}

const CertificateViewer = ({ certificate, onShare }: CertificateViewerProps) => {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleDownload = async () => {
    if (downloading) return;

    setDownloading(true);
    abortControllerRef.current = new AbortController();

    try {
      if (!API_ENDPOINTS.blocks) {
        throw new Error('API endpoint not configured');
      }

      const apiUrl = `${API_ENDPOINTS.blocks}?type=academy&action=generate_certificate_pdf`;
      
      const response = await retryFetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificate_id: certificate.id,
        }),
        signal: abortControllerRef.current.signal,
      }, {
        maxRetries: 2,
        retryDelay: 1000,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_${certificate.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      // Fallback: проверяем валидность URL перед открытием
      if (certificate.certificateUrl && typeof certificate.certificateUrl === 'string') {
        try {
          const url = new URL(certificate.certificateUrl);
          window.open(url.toString(), '_blank', 'noopener,noreferrer');
        } catch (urlError) {
          toast({
            title: 'Ошибка',
            description: 'Не удалось скачать сертификат. URL недействителен.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось скачать сертификат',
          variant: 'destructive',
        });
      }
    } finally {
      setDownloading(false);
      abortControllerRef.current = null;
    }
  };

  const handleShare = () => {
    if (navigator.share && certificate.shareUrl && typeof certificate.shareUrl === 'string') {
      navigator.share({
        title: 'Мой сертификат из Академии бизнеса',
        text: `Я завершил обучение в Академии бизнеса!`,
        url: certificate.shareUrl,
      }).catch(() => {
        if (onShare) {
          onShare();
        }
      });
    } else if (onShare) {
      onShare();
    }
  };

  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Award" size={24} className="text-primary" />
          Сертификат об окончании
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border-2 border-dashed border-primary/30">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Icon name="Award" size={48} className="text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Академия бизнеса</h3>
          <p className="text-muted-foreground mb-4">
            Настоящим подтверждается, что
          </p>
          <h4 className="text-xl font-semibold mb-6">{certificate.userName}</h4>
          <p className="text-muted-foreground mb-4">
            успешно завершил(а) обучение по следующим курсам:
          </p>
          <div className="space-y-2 mb-6">
            {certificate.courses.map((course, i) => (
              <div key={i} className="text-sm font-medium">• {course}</div>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Дата завершения: {new Date(certificate.completedAt).toLocaleDateString('ru-RU')}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            ID сертификата: {certificate.id}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleDownload} className="flex-1" disabled={downloading}>
            <Icon name={downloading ? "Loader2" : "Download"} className={`mr-2 ${downloading ? 'animate-spin' : ''}`} size={16} />
            {downloading ? 'Загрузка...' : 'Скачать PDF'}
          </Button>
          <Button variant="outline" onClick={handleShare} className="flex-1">
            <Icon name="Share2" className="mr-2" size={16} />
            Поделиться
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificateViewer;

