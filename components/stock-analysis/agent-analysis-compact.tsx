'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  Target,
  DollarSign,
  Quote,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AgentAnalysis } from '@/lib/types/agents';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AgentAnalysisCompactProps {
  analysis: AgentAnalysis;
  currentPrice: number;
}

export default function AgentAnalysisCompact({ analysis, currentPrice }: AgentAnalysisCompactProps) {
  const [isOpen, setIsOpen] = useState(true);

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strong-buy': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'buy': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      case 'hold': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'sell': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'strong-sell': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    if (recommendation.includes('buy')) return <TrendingUp className="h-4 w-4" />;
    if (recommendation.includes('sell')) return <TrendingDown className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const formatRecommendation = (rec: string) => {
    return rec.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const calculatePriceChange = (target: number) => {
    const change = ((target - currentPrice) / currentPrice) * 100;
    return change.toFixed(2);
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg">{analysis.agentName}</h3>
            <Badge 
              className={cn(
                "flex items-center gap-1",
                getRecommendationColor(analysis.recommendation)
              )}
              variant="secondary"
            >
              {getRecommendationIcon(analysis.recommendation)}
              {formatRecommendation(analysis.recommendation)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Confidence</p>
                <div className="flex items-center gap-2">
                  <Progress value={analysis.confidence} className="h-1.5 w-20" />
                  <span className="text-sm font-medium">{analysis.confidence}%</span>
                </div>
              </div>
              
              {analysis.targetPrice && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Target</p>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">${analysis.targetPrice.toFixed(2)}</span>
                    <span className={cn(
                      "text-xs",
                      analysis.targetPrice > currentPrice ? "text-green-600" : "text-red-600"
                    )}>
                      ({analysis.targetPrice > currentPrice ? '+' : ''}{calculatePriceChange(analysis.targetPrice)}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {analysis.reasoning}
          </p>
        </div>

        {analysis.notableQuote && (
          <div className="flex gap-2 p-2 bg-primary/5 rounded-md border-l-2 border-primary">
            <Quote className="h-3 w-3 text-primary mt-0.5 shrink-0" />
            <p className="text-xs italic line-clamp-2">{analysis.notableQuote}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Horizon:</span>
            <span className="font-medium">{analysis.timeHorizon}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Factors:</span>
            <span className="font-medium">{analysis.keyFactors.length}</span>
          </div>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between px-0 h-8">
              <span className="text-xs">View Details</span>
              {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                Key Factors
              </h4>
              <ul className="space-y-0.5">
                {analysis.keyFactors.map((factor, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                Risks
              </h4>
              <ul className="space-y-0.5">
                {analysis.risks.map((risk, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {(analysis.entryStrategy || analysis.exitStrategy) && (
              <div className="space-y-2 pt-2 border-t">
                {analysis.entryStrategy && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1">Entry Strategy</h4>
                    <p className="text-xs text-muted-foreground">{analysis.entryStrategy}</p>
                  </div>
                )}
                {analysis.exitStrategy && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1">Exit Strategy</h4>
                    <p className="text-xs text-muted-foreground">{analysis.exitStrategy}</p>
                  </div>
                )}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}