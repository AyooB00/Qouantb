'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Loader2, TrendingUp, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StockSelectorCards from '@/components/stock-analysis/stock-selector-cards';
import AgentSelectorCompact from '@/components/stock-analysis/agent-selector-compact';
import AgentAnalysisCompact from '@/components/stock-analysis/agent-analysis-compact';
import { StockAnalysisLoadingState } from '@/components/stock-analysis/stock-analysis-loading-state';
import { AgentId, StockAnalysisResponse } from '@/lib/types/agents';
import { getAllAgents } from '@/lib/agents/investment-agents';

export default function StockAnalysisPage() {
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [selectedAgents, setSelectedAgents] = useState<AgentId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<StockAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('stockAnalysis');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const handleAnalyze = async () => {
    if (!selectedStock || selectedAgents.length === 0) {
      setError(t('error'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/analyze-stock-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: selectedStock,
          agentIds: selectedAgents,
          locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze stock');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getConsensusRecommendation = () => {
    if (!analysisResult || analysisResult.analyses.length === 0) return null;
    
    const recommendations = analysisResult.analyses.map(a => a.recommendation);
    const buyCount = recommendations.filter(r => r.includes('buy')).length;
    const sellCount = recommendations.filter(r => r.includes('sell')).length;
    const holdCount = recommendations.filter(r => r === 'hold').length;
    
    if (buyCount > sellCount + holdCount) return tCommon('bullish');
    if (sellCount > buyCount + holdCount) return tCommon('bearish');
    return tCommon('mixed');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

        <div className="space-y-8">
          {/* Stock and Agent Selection Side by Side */}
          <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
            {/* Stock Selection */}
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('selectStock')}
                </CardTitle>
                <CardDescription>
                  {t('selectStockDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <StockSelectorCards 
                  onSelect={setSelectedStock} 
                  selectedSymbol={selectedStock}
                  disabled={isLoading}
                />
              </CardContent>
            </Card>

            {/* Agent Selection */}
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {t('selectAnalysts')}
                </CardTitle>
                <CardDescription>
                  {t('selectAnalystsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <AgentSelectorCompact 
                  onSelectionChange={setSelectedAgents}
                  disabled={isLoading}
                />
              </CardContent>
            </Card>
          </div>

          {/* Analyze Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleAnalyze}
              disabled={!selectedStock || selectedAgents.length === 0 || isLoading}
              size="lg"
              className="px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('analyzing')}
                </>
              ) : (
                t('analyzeButton')
              )}
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <StockAnalysisLoadingState 
              symbol={selectedStock}
              analysts={selectedAgents.map(id => {
                const agent = getAllAgents().find(a => a.id === id);
                return agent?.name || id;
              })}
            />
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-6">
              {/* Stock Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">
                        {analysisResult.symbol} - {analysisResult.companyName}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {t('currentPrice')}: ${analysisResult.currentPrice.toFixed(2)}
                        {analysisResult.stockData.changePercent && (
                          <span className={
                            analysisResult.stockData.changePercent > 0 
                              ? "text-green-600 ml-2" 
                              : "text-red-600 ml-2"
                          }>
                            ({analysisResult.stockData.changePercent > 0 ? '+' : ''}
                            {analysisResult.stockData.changePercent.toFixed(2)}%)
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {t('consensus')}: {getConsensusRecommendation()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {analysisResult.stockData.peRatio && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t('peRatio')}</p>
                        <p className="text-lg font-semibold">{analysisResult.stockData.peRatio.toFixed(2)}</p>
                      </div>
                    )}
                    {analysisResult.stockData.marketCap && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t('marketCap')}</p>
                        <p className="text-lg font-semibold">
                          ${(analysisResult.stockData.marketCap / 1e9).toFixed(2)}B
                        </p>
                      </div>
                    )}
                    {analysisResult.stockData.beta && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t('beta')}</p>
                        <p className="text-lg font-semibold">{analysisResult.stockData.beta.toFixed(2)}</p>
                      </div>
                    )}
                    {analysisResult.stockData.dividendYield && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t('dividendYield')}</p>
                        <p className="text-lg font-semibold">{analysisResult.stockData.dividendYield.toFixed(2)}%</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Agent Analyses */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">{t('investmentAnalyses')}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                  {analysisResult.analyses.map((analysis) => (
                    <AgentAnalysisCompact
                      key={analysis.agentId}
                      analysis={analysis}
                      currentPrice={analysisResult.currentPrice}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      <div className="mt-16 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
        <p>
          {t('disclaimer')}
        </p>
      </div>
    </div>
  );
}