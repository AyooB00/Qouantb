'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  TrendingUp, 
  BarChart3, 
  Brain, 
  Database, 
  Users,
  FileText,
  Calculator,
  Sparkles,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockAnalysisLoadingStateProps {
  symbol?: string;
  analysts?: string[];
}

export function StockAnalysisLoadingState({ symbol, analysts }: StockAnalysisLoadingStateProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const t = useTranslations('stockAnalysis.loading');

  const analysisStages = [
    {
      icon: Database,
      text: t('stages.fetchingData'),
      color: "text-blue-500"
    },
    {
      icon: Users,
      text: t('stages.connectingAnalysts'),
      color: "text-teal-500"
    },
    {
      icon: Calculator,
      text: t('stages.fundamentalAnalysis'),
      color: "text-green-500"
    },
    {
      icon: BarChart3,
      text: t('stages.technicalIndicators'),
      color: "text-green-600"
    },
    {
      icon: Brain,
      text: t('stages.processingInsights'),
      color: "text-blue-600"
    },
    {
      icon: TrendingUp,
      text: t('stages.generatingRecommendations'),
      color: "text-teal-600"
    },
    {
      icon: FileText,
      text: t('stages.compilingReport'),
      color: "text-green-500"
    }
  ];

  const tips = [
    t('tips.uniquePhilosophy'),
    t('tips.fundamentalAndTechnical'),
    t('tips.historicalData'),
    t('tips.multiplePerspectives'),
    t('tips.realTimeData')
  ];

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < analysisStages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 1;
        }
        return prev;
      });
    }, 175);

    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 4000);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, []);

  const CurrentIcon = analysisStages[currentStage].icon;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto space-y-8 bg-card rounded-lg p-8 shadow-2xl border">
        {/* Header */}
        {symbol && (
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {t('analyzingSymbol', { symbol })}
            </h2>
            {analysts && analysts.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {t('withInvestors', { count: analysts.length })}
              </p>
            )}
          </div>
        )}

        {/* Main animated icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <CurrentIcon 
                className={cn(
                  "h-20 w-20 opacity-25",
                  analysisStages[currentStage].color
                )} 
              />
            </div>
            <CurrentIcon 
              className={cn(
                "h-20 w-20 animate-bounce relative",
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
            {t('stageProgress', { current: currentStage + 1, total: analysisStages.length })}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>

        {/* Stage indicators */}
        <div className="flex justify-center items-center gap-3">
          {analysisStages.map((stage, index) => {
            const StageIcon = stage.icon;
            const isActive = index === currentStage;
            const isPassed = index < currentStage;
            
            return (
              <div
                key={index}
                className={cn(
                  "transition-all duration-500 relative",
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
                {isActive && (
                  <div className="absolute -inset-2 rounded-full border-2 border-current animate-pulse" 
                    style={{ borderColor: 'currentColor' }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-lg pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-500/10 rounded-full animate-ping" />
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-teal-500/10 rounded-full animate-ping animation-delay-200" />
          <div className="absolute bottom-1/4 left-1/2 w-3 h-3 bg-green-500/10 rounded-full animate-ping animation-delay-400" />
          <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-teal-600/10 rounded-full animate-ping animation-delay-600" />
        </div>

        {/* Tips */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 animate-pulse" />
            <p className="animate-fade-in" key={currentTip}>
              {tips[currentTip]}
            </p>
          </div>
        </div>

        {/* Loading spinner as footer */}
        <div className="flex justify-center">
          <Sparkles className="h-5 w-5 text-muted-foreground animate-spin" />
        </div>
      </div>
    </div>
  );
}