'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnalysisResult } from '@/lib/types/trading';
import PromptSearchForm from '@/components/swing-trading/prompt-search-form';
import ResultsGrid from '@/components/swing-trading/results-grid';
import { AnalysisLoadingState } from '@/components/swing-trading/analysis-loading-state';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function SwingTradingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('swingTrading');

  const handleSearch = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/analyze-stocks-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze stocks');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <PromptSearchForm onSearch={handleSearch} isLoading={isLoading} />
      
      {!isLoading && !results && (
        <Alert className="mt-4 max-w-4xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('analysisInfo')}
          </AlertDescription>
        </Alert>
      )}

        {error && (
          <Alert variant="destructive" className="mt-8 max-w-4xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="mt-12">
            <AnalysisLoadingState />
          </div>
        )}

        {results && !isLoading && (
          <div className="mt-12 space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">
                {t('foundOpportunities', { count: results.opportunities.length })}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {t('analyzedStocks', { count: results.totalAnalyzed })}
              </p>
            </div>
            
            <ResultsGrid results={results} />
          </div>
        )}

    </div>
  );
}