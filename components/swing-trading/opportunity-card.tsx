'use client';

import { TradingOpportunity } from '@/lib/types/trading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OpportunityCardProps {
  opportunity: TradingOpportunity;
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {

  const getConfidenceBadgeVariant = (confidence: number): "default" | "secondary" | "destructive" | "outline" => {
    if (confidence >= 80) return 'default';
    if (confidence >= 60) return 'secondary';
    return 'destructive';
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatPercentage = (percentage: number) => {
    const formatted = percentage.toFixed(2);
    return percentage > 0 ? `+${formatted}%` : `${formatted}%`;
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
          <span className="text-2xl font-bold">{formatPrice(opportunity.currentPrice)}</span>
          <span className="text-sm text-muted-foreground">
            Entry: {formatPrice(opportunity.entryPrice)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Stop Loss</p>
            <p className="font-semibold text-red-600">{formatPrice(opportunity.stopLoss)}</p>
            <p className="text-xs text-muted-foreground">{formatPercentage(opportunity.stopLossPercentage)}</p>
          </div>
          
          <div>
            <p className="text-muted-foreground">Target 1</p>
            <p className="font-semibold text-green-600">{formatPrice(opportunity.takeProfit.target1)}</p>
            <p className="text-xs text-muted-foreground">{formatPercentage(opportunity.takeProfitPercentages.target1)}</p>
          </div>
          
          <div>
            <p className="text-muted-foreground">Risk/Reward</p>
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