'use client';

import { TradingOpportunity } from '@/lib/types/trading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations, useLocale } from 'next-intl';
import { formatCurrency, formatPercentage } from '@/lib/utils/formatters';

interface OpportunityCardProps {
  opportunity: TradingOpportunity;
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const t = useTranslations('swingTrading.card');
  const locale = useLocale();

  const getConfidenceBadgeVariant = (confidence: number): "default" | "secondary" | "destructive" | "outline" => {
    if (confidence >= 80) return 'default';
    if (confidence >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{opportunity.symbol}</CardTitle>
            <CardDescription className="text-sm">{opportunity.companyName}</CardDescription>
          </div>
          <Badge variant={getConfidenceBadgeVariant(opportunity.confidence)} className="text-xs">
            {opportunity.confidence}%
          </Badge>
        </div>
        
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-2xl font-bold">{formatCurrency(opportunity.currentPrice, locale)}</span>
          <span className="text-sm text-muted-foreground">
            {t('entryPoint')}: {formatCurrency(opportunity.entryPrice, locale)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">{t('stopLoss')}</p>
            <p className="font-semibold text-red-600">{formatCurrency(opportunity.stopLoss, locale)}</p>
            <p className="text-xs text-muted-foreground">{formatPercentage(opportunity.stopLossPercentage, locale)}</p>
          </div>
          
          <div>
            <p className="text-muted-foreground">{t('target1')}</p>
            <p className="font-semibold text-green-600">{formatCurrency(opportunity.takeProfit.target1, locale)}</p>
            <p className="text-xs text-muted-foreground">{formatPercentage(opportunity.takeProfitPercentages.target1, locale)}</p>
          </div>
          
          <div>
            <p className="text-muted-foreground">{t('riskReward')}</p>
            <p className="font-semibold">{opportunity.riskRewardRatio.toFixed(1)}:1</p>
          </div>
        </div>
        
        <div className="pt-3 border-t">
          <p className="text-sm text-muted-foreground line-clamp-2">{opportunity.reasoning}</p>
        </div>
      </CardContent>
    </Card>
  );
}