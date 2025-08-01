'use client'

import { ExternalLink, Newspaper, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ComponentRenderProps, NewsSummaryData } from '@/lib/types/finchat'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { BaseSmartCard } from '../base-smart-card'
import { useTranslations } from 'next-intl'

export default function NewsSummaryCard({ data, onAction, className }: ComponentRenderProps<NewsSummaryData>) {
  const t = useTranslations('finChat.smartCards.newsSummary')
  const common = useTranslations('finChat.smartCards.common')
  
  if (!data || !data.articles || data.articles.length === 0) return null

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-3 w-3" />
      case 'negative':
        return <TrendingDown className="h-3 w-3" />
      default:
        return <Minus className="h-3 w-3" />
    }
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 dark:bg-green-950/30'
      case 'negative':
        return 'text-red-600 bg-red-50 dark:bg-red-950/30'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/30'
    }
  }

  const getOverallSentimentBadge = () => {
    const sentimentMap = {
      'positive': { label: t('sentiment') + ' - ' + common('bullish'), color: 'text-green-600 bg-green-50 dark:bg-green-950/30' },
      'negative': { label: t('sentiment') + ' - ' + common('bearish'), color: 'text-red-600 bg-red-50 dark:bg-red-950/30' },
      'mixed': { label: t('sentiment') + ' - ' + common('mixed'), color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
      'neutral': { label: t('sentiment') + ' - ' + common('neutral'), color: 'text-gray-600 bg-gray-50 dark:bg-gray-900/30' }
    }
    
    const { label, color } = sentimentMap[data.overallSentiment] || sentimentMap.neutral
    
    return (
      <Badge className={cn("text-xs", color)}>
        {label}
      </Badge>
    )
  }

  return (
    <BaseSmartCard
      title={t('title')}
      icon={Newspaper}
      badge={{
        label: data.overallSentiment || 'neutral',
        className: getSentimentColor(data.overallSentiment)
      }}
      className={className}
      onAction={onAction}
    >
      {data.keyTopics && data.keyTopics.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          <span className="text-xs text-muted-foreground mr-1">{t('keyTopics')}:</span>
          {data.keyTopics.map((topic, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {topic}
            </Badge>
          ))}
        </div>
      )}
      
      <div className="space-y-3">
        {data.articles.map((article, index) => (
          <div 
            key={index} 
            className="p-3 rounded-lg border hover:bg-muted/50 transition-colors space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm line-clamp-2 flex-1">
                {article.headline}
              </h4>
              {article.sentiment && (
                <Badge className={cn("text-xs shrink-0", getSentimentColor(article.sentiment))}>
                  {getSentimentIcon(article.sentiment)}
                </Badge>
              )}
            </div>
            
            {article.summary && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {article.summary}
              </p>
            )}
            
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{article.source}</span>
                <span>•</span>
                <span>{t('publishedAgo', { time: formatDistanceToNow(new Date(article.publishedAt)) })}</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                asChild
              >
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {t('readMore')} <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </div>
            
            {article.relevanceScore && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Relevance:</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-600 transition-all"
                    style={{ width: `${article.relevanceScore * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{(article.relevanceScore * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>
        ))}
        
        {onAction && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onAction({ label: t('readMore'), action: 'more-news', data: data as any })}
          >
            {t('readMore')}
          </Button>
        )}
      </div>
    </BaseSmartCard>
  )
}