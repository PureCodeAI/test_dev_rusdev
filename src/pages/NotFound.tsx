import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

const NotFound = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  useEffect(() => {
    // Автоматическое воспроизведение видео при загрузке
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Левая часть - текст и кнопки */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-5xl font-bold text-slate-900 mb-6">
                Страница не найдена
              </h1>
              
              <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                Этот экран появляется, когда нужной вам страницы больше нет или она доступна по другой ссылке.
              </p>
              
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Проверьте адрес страницы, он может быть некорректным
              </p>

              <div className="mb-8">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-8 py-6 text-lg rounded-lg transition-colors"
                >
                  На главную
                </Button>
              </div>

              {/* Описание ошибки */}
              <div className="mt-8">
                <button
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <span className="font-medium">Описание ошибки</span>
                  <Icon 
                    name={showErrorDetails ? "ChevronUp" : "ChevronDown"} 
                    size={16} 
                  />
                </button>
                
                {showErrorDetails && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-700 font-mono">404 Not Found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Правая часть - видео */}
            <div className="flex-1 w-full lg:w-auto flex items-center justify-center">
              <div className="relative w-full max-w-lg mx-auto bg-transparent rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-auto object-contain"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="/404-video.mp4" type="video/mp4" />
                  Ваш браузер не поддерживает видео.
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
