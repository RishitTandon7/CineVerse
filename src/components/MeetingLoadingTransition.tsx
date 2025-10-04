import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Star, Video } from 'lucide-react';

interface MeetingLoadingTransitionProps {
  onComplete: () => void;
}

export default function MeetingLoadingTransition({ onComplete }: MeetingLoadingTransitionProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);

  const messages = [
    { text: "Getting the party started", icon: Sparkles },
    { text: "Warming up the screen", icon: Zap },
    { text: "Preparing your premium experience", icon: Star },
    { text: "Almost there", icon: Video }
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 1200);

    return () => clearInterval(messageInterval);
  }, []);

  const CurrentIcon = messages[currentMessage].icon;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-cyan-500 via-blue-600 to-pink-500 animate-gradient-xy flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-float"
            style={{
              width: `${Math.random() * 100 + 20}px`,
              height: `${Math.random() * 100 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 15}s`,
              opacity: Math.random() * 0.3 + 0.1
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl">
        <div className="mb-12 relative">
          <div className="w-32 h-32 mx-auto relative animate-pulse-scale">
            <div className="absolute inset-0 bg-white/20 rounded-3xl rotate-45 animate-spin-slow"></div>
            <div className="absolute inset-0 bg-white/30 rounded-3xl -rotate-45 animate-spin-slower"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <CurrentIcon className="h-16 w-16 text-white animate-bounce-gentle" />
            </div>
          </div>
        </div>

        <h1 className="text-6xl font-black text-white mb-6 animate-bounce-in tracking-tight drop-shadow-2xl">
          {messages[currentMessage].text}
        </h1>

        <div className="relative w-full max-w-md mx-auto h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
          </div>
        </div>

        <p className="text-white/90 text-2xl font-bold mt-6 animate-fade-in">
          {Math.round(progress)}%
        </p>

        <div className="mt-12 flex justify-center gap-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                currentMessage === i ? 'bg-white w-8' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white/20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              fontSize: `${Math.random() * 30 + 20}px`
            }}
          >
            ✨
          </div>
        ))}
      </div>
    </div>
  );
}
