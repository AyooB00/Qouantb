'use client';

import { useState, useMemo } from 'react';
import { AnalysisResult } from '@/lib/types/trading';
import OpportunityCard from './opportunity-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, SortAsc, SortDesc } from 'lucide-react';

interface ResultsGridProps {
  results: AnalysisResult;
}

type SortField = 'confidence' | 'riskReward' | 'entryPercentage';
type SortOrder = 'asc' | 'desc';

export default function ResultsGrid({ results }: ResultsGridProps) {
  const [sortField, setSortField] = useState<SortField>('confidence');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const sortedOpportunities = useMemo(() => {
    const sorted = [...results.opportunities].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'confidence':
          comparison = a.confidence - b.confidence;
          break;
        case 'riskReward':
          comparison = a.riskRewardRatio - b.riskRewardRatio;
          break;
        case 'entryPercentage':
          comparison = Math.abs(a.entryPercentage) - Math.abs(b.entryPercentage);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }, [results.opportunities, sortField, sortOrder]);

  const handleExport = () => {
    const csvContent = [
      ['Symbol', 'Company', 'Current Price', 'Entry Price', 'Stop Loss', 'Target 1', 'Target 2', 'Target 3', 'Confidence', 'Risk/Reward', 'Reasoning'],
      ...results.opportunities.map(opp => [
        opp.symbol,
        opp.companyName,
        opp.currentPrice.toFixed(2),
        opp.entryPrice.toFixed(2),
        opp.stopLoss.toFixed(2),
        opp.takeProfit.target1.toFixed(2),
        opp.takeProfit.target2.toFixed(2),
        opp.takeProfit.target3?.toFixed(2) || '',
        opp.confidence,
        opp.riskRewardRatio.toFixed(2),
        opp.reasoning.replace(/,/g, ';')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swing-trading-opportunities-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  if (results.opportunities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          No trading opportunities found matching your criteria.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your search parameters or expanding your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confidence">Confidence</SelectItem>
              <SelectItem value="riskReward">Risk/Reward Ratio</SelectItem>
              <SelectItem value="entryPercentage">Entry Distance</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>
        
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedOpportunities.map((opportunity, index) => (
          <div 
            key={opportunity.symbol} 
            className={`animate-stagger animate-stagger-${Math.min(index + 1, 6)}`}
          >
            <OpportunityCard opportunity={opportunity} />
          </div>
        ))}
      </div>
    </div>
  );
}