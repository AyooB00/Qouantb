'use client'

import { MessageSquare, TrendingUp, DollarSign, BarChart } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SuggestedPromptsProps {
  prompts: string[]
  onSelectPrompt: (prompt: string) => void
  className?: string
}

const promptIcons: Record<string, any> = {
  'market': TrendingUp,
  'stock': BarChart,
  'portfolio': DollarSign,
  'default': MessageSquare
}

function getPromptIcon(prompt: string) {
  const lowercasePrompt = prompt.toLowerCase()
  if (lowercasePrompt.includes('market')) return promptIcons.market
  if (lowercasePrompt.includes('stock') || lowercasePrompt.includes('analyze')) return promptIcons.stock
  if (lowercasePrompt.includes('portfolio') || lowercasePrompt.includes('diversif')) return promptIcons.portfolio
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
            className="p-4 cursor-pointer hover:bg-accent transition-colors group"
            onClick={() => onSelectPrompt(prompt)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm leading-relaxed flex-1">{prompt}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}