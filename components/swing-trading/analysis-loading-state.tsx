'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  TrendingUp, 
  ChartBar, 
  Brain, 
  Search, 
  Sparkles,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AnalysisLoadingState() {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const t = useTranslations('swingTrading.loading');
  
  const analysisStages = [
    {
      icon: Search,
      text: t('scanningMarket'),
      color: "text-blue-500"
    },
    {
      icon: ChartBar,
      text: t('analyzingPatterns'),
      color: "text-green-500"
    },
    {
      icon: TrendingUp,
      text: t('evaluatingMomentum'),
      color: "text-teal-500"
    },
    {
      icon: Activity,
      text: t('checkingVolume'),
      color: "text-green-600"
    },
    {
      icon: Target,
      text: t('identifyingEntry'),
      color: "text-blue-600"
    },
    {
      icon: Brain,
      text: t('processingAI'),
      color: "text-teal-600"
    },
    {
      icon: Sparkles,
      text: t('finalizingRecommendations'),
      color: "text-green-500"
    }
  ];

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < analysisStages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 1;
        }
        return prev;
      });
    }, 140);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const CurrentIcon = analysisStages[currentStage].icon;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Main animated icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <CurrentIcon 
              className={cn(
                "h-16 w-16 opacity-25",
                analysisStages[currentStage].color
              )} 
            />
          </div>
          <CurrentIcon 
            className={cn(
              "h-16 w-16 animate-bounce relative",
              analysisStages[currentStage].color
            )} 
          />
        </div>
      </div>

      {/* Current stage text */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium animate-pulse">
          {analysisStages[currentStage].text}
        </p>
        <p className="text-sm text-muted-foreground">
          {t('analyzingConditions')}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage indicators */}
      <div className="flex justify-center items-center gap-2">
        {analysisStages.map((stage, index) => {
          const StageIcon = stage.icon;
          const isActive = index === currentStage;
          const isPassed = index < currentStage;
          
          return (
            <div
              key={index}
              className={cn(
                "transition-all duration-500",
                isActive && "scale-125",
                isPassed && "opacity-50"
              )}
            >
              <StageIcon 
                className={cn(
                  "h-6 w-6 transition-all duration-500",
                  isActive && stage.color,
                  !isActive && !isPassed && "text-muted-foreground",
                  isPassed && "text-muted-foreground/50"
                )} 
              />
            </div>
          );
        })}
      </div>

      {/* Animated background dots */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500/20 rounded-full animate-ping" />
        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-teal-500/20 rounded-full animate-ping animation-delay-200" />
        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-green-500/20 rounded-full animate-ping animation-delay-400" />
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-teal-600/20 rounded-full animate-ping animation-delay-600" />
      </div>

      {/* Fun fact or tip */}
      <div className="text-center text-sm text-muted-foreground italic animate-fade-in">
        <Zap className="inline-block h-4 w-4 mr-1" />
        {t('tip')}
      </div>
    </div>
  );
}