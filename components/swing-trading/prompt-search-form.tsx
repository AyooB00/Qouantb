'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getTranslatedPrompts } from '@/lib/example-prompts';

interface PromptSearchFormProps {
  onSearch: (prompt: string) => void;
  isLoading: boolean;
}

export default function PromptSearchForm({ onSearch, isLoading }: PromptSearchFormProps) {
  const [prompt, setPrompt] = useState('');
  const t = useTranslations();
  const examplePrompts = getTranslatedPrompts(t);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSearch(prompt.trim());
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {examplePrompts.map((example, index) => (
          <button
            key={index}
            onClick={() => handleExampleClick(example)}
            className="text-left p-3 rounded-lg bg-secondary/50 hover:bg-secondary text-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
            disabled={isLoading}
          >
            {example}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Describe the stocks you're looking for..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[120px] text-lg p-4"
          autoFocus
        />
        
        <Button 
          type="submit" 
          disabled={isLoading || !prompt.trim()} 
          className={`w-full transition-all duration-300 ${
            isLoading ? 'animate-pulse bg-gradient-to-r from-blue-500 via-teal-500 to-green-500' : ''
          }`}
          size="lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span className="animate-pulse">Analyzing market conditions...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center group">
              <Search className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              <span>Search Stocks</span>
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}