'use client'

import { MessageSquare, TrendingUp, DollarSign, BarChart } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SuggestedPromptsProps {
  prompts: string[]
  onSelectPrompt: (prompt: string) => void
  className?: string
}

const promptIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'market': TrendingUp,
  'stock': BarChart,
  'portfolio': DollarSign,
  'default': MessageSquare
}

function getPromptIcon(prompt: string) {
  const lowercasePrompt = prompt.toLowerCase()
  // Check for both English and Arabic keywords
  if (lowercasePrompt.includes('market') || lowercasePrompt.includes('سوق')) return promptIcons.market
  if (lowercasePrompt.includes('stock') || lowercasePrompt.includes('analyze') || lowercasePrompt.includes('سهم') || lowercasePrompt.includes('تحليل')) return promptIcons.stock
  if (lowercasePrompt.includes('portfolio') || lowercasePrompt.includes('diversif') || lowercasePrompt.includes('محفظ') || lowercasePrompt.includes('تنوي')) return promptIcons.portfolio
  return promptIcons.default
}

export function SuggestedPrompts({ prompts, onSelectPrompt, className }: SuggestedPromptsProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {prompts.map((prompt, index) => {
        const Icon = getPromptIcon(prompt)
        return (
          <Card
            key={index}
            className="p-4 cursor-pointer bg-card/50 backdrop-blur border-border/50 hover:bg-card/80 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => onSelectPrompt(prompt)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <div className="p-2 rounded-full bg-gradient-to-br from-teal-500/10 to-blue-500/10 group-hover:from-teal-500/20 group-hover:to-blue-500/20 transition-all duration-300">
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:scale-110" />
                </div>
              </div>
              <p className="text-sm leading-relaxed flex-1 group-hover:text-foreground transition-colors">{prompt}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}