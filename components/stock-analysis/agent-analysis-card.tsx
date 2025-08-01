'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  Target,
  DollarSign,
  Quote
} from 'lucide-react';
import { AgentAnalysis } from '@/lib/types/agents';
import { cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { formatCurrency, formatPercentageChange } from '@/lib/utils/formatters';

interface AgentAnalysisCardProps {
  analysis: AgentAnalysis;
  currentPrice: number;
}

export default function AgentAnalysisCard({ analysis, currentPrice }: AgentAnalysisCardProps) {
  const t = useTranslations('stockAnalysis.analysis');
  const locale = useLocale();
  
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strong-buy': return 'text-green-600 bg-green-100';
      case 'buy': return 'text-green-500 bg-green-50';
      case 'hold': return 'text-yellow-600 bg-yellow-100';
      case 'sell': return 'text-red-500 bg-red-50';
      case 'strong-sell': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{analysis.agentName}</CardTitle>
            <CardDescription>Investment Analysis</CardDescription>
          </div>
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
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('confidenceLevel')}</span>
            <span className="font-semibold">{analysis.confidence}%</span>
          </div>
          <Progress value={analysis.confidence} className="h-2" />
        </div>

        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="factors">Factors</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm leading-relaxed">{analysis.reasoning}</p>
            </div>

            {analysis.notableQuote && (
              <div className="flex gap-2 p-3 bg-primary/5 rounded-lg border-l-4 border-primary">
                <Quote className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm italic">{analysis.notableQuote}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="factors" className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Key Factors
              </h4>
              <ul className="space-y-1">
                {analysis.keyFactors.map((factor, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Risks
              </h4>
              <ul className="space-y-1">
                {analysis.risks.map((risk, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-1">
                <Target className="h-4 w-4 text-blue-500" />
                Opportunities
              </h4>
              <ul className="space-y-1">
                {analysis.opportunities.map((opp, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="strategy" className="space-y-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Time Horizon</span>
                </div>
                <span className="text-sm">{analysis.timeHorizon}</span>
              </div>

              {analysis.targetPrice && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('targetPrice')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold">{formatCurrency(analysis.targetPrice, locale)}</span>
                    <span className={cn(
                      "text-xs ml-2",
                      analysis.targetPrice > currentPrice ? "text-green-600" : "text-red-600"
                    )}>
                      ({formatPercentageChange(parseFloat(calculatePriceChange(analysis.targetPrice)), locale).text})
                    </span>
                  </div>
                </div>
              )}

              {analysis.entryStrategy && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Entry Strategy</h4>
                  <p className="text-sm text-muted-foreground">{analysis.entryStrategy}</p>
                </div>
              )}

              {analysis.exitStrategy && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Exit Strategy</h4>
                  <p className="text-sm text-muted-foreground">{analysis.exitStrategy}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}