'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/lib/types/trading';
import PromptSearchForm from '@/components/swing-trading/prompt-search-form';
import ResultsGrid from '@/components/swing-trading/results-grid';
import { ResultsGridSkeleton } from '@/components/swing-trading/loading-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function SwingTradingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Find Trading Opportunities</h1>
          <p className="text-muted-foreground text-lg">
            Use AI to discover swing trading opportunities
          </p>
        </div>

        <PromptSearchForm onSearch={handleSearch} isLoading={isLoading} />

        {error && (
          <Alert variant="destructive" className="mt-8 max-w-4xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="mt-12">
            <ResultsGridSkeleton />
          </div>
        )}

        {results && !isLoading && (
          <div className="mt-12 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">
                {results.opportunities.length} Opportunities Found
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Analyzed {results.totalAnalyzed} stocks
              </p>
            </div>
            
            <ResultsGrid results={results} />
          </div>
        )}

        <div className="mt-16 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>Trading involves risk. This tool is for educational purposes only.</p>
        </div>
      </div>
    </div>
  );
}