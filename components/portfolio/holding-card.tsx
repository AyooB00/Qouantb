'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Edit2, Trash2, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { PortfolioItem, usePortfolioStore } from '@/lib/stores/portfolio-store'
import { cn } from '@/lib/utils'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTranslations, useLocale } from 'next-intl'
import { formatCurrency, formatPercentage, formatDate } from '@/lib/utils/formatters'

interface HoldingCardProps {
  holding: PortfolioItem
}

export function HoldingCard({ holding }: HoldingCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { removeItem } = usePortfolioStore()
  const t = useTranslations('portfolio.holding')
  const tCommon = useTranslations('common')
  const locale = useLocale()

  const profitLoss = holding.profitLoss || 0
  const profitLossPercent = holding.profitLossPercent || 0
  const totalValue = holding.totalValue || (holding.quantity * holding.avgCost)

  return (
    <>
      <Card className="overflow-hidden">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{holding.symbol}</h3>
                    <p className="text-sm text-muted-foreground">{holding.companyName}</p>
                  </div>
                  <Badge variant="outline">{holding.quantity} {t('shares')}</Badge>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-lg font-semibold">{formatCurrency(totalValue, locale)}</p>
                    <p className={cn(
                      "text-sm flex items-center gap-1",
                      profitLoss >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {profitLoss >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {formatCurrency(Math.abs(profitLoss), locale)} ({formatPercentage(profitLossPercent, locale)})
                    </p>
                  </div>
                  
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="border-t">
              <div className="grid gap-4 pt-4">
                {/* Price Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('currentPrice')}</p>
                    <p className="text-sm font-medium">
                      {holding.currentPrice ? formatCurrency(holding.currentPrice, locale) : t('loading')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('avgCost')}</p>
                    <p className="text-sm font-medium">{formatCurrency(holding.avgCost, locale)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('totalCost')}</p>
                    <p className="text-sm font-medium">
                      {formatCurrency(holding.quantity * holding.avgCost, locale)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('added')}</p>
                    <p className="text-sm font-medium">
                      {formatDate(holding.addedDate, locale, { dateStyle: 'medium' })}
                    </p>
                  </div>
                </div>

                {/* AI Analysis */}
                {holding.lastAnalysis && (
                  <div className="space-y-3">
                    {/* Forecast */}
                    <div className="bg-muted/50 rounded-lg p-3">
                      <h4 className="text-sm font-medium mb-2">{t('aiForecast')}</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">{t('sevenDayTarget')}</p>
                          <p className="text-sm font-medium">
                            {formatCurrency(holding.lastAnalysis.forecast.sevenDay, locale)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t('thirtyDayTarget')}</p>
                          <p className="text-sm font-medium">
                            {formatCurrency(holding.lastAnalysis.forecast.thirtyDay, locale)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{t('confidence')}</span>
                          <span className="text-xs font-medium">
                            {holding.lastAnalysis.forecast.confidence}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-primary h-1.5 rounded-full transition-all"
                            style={{ width: `${holding.lastAnalysis.forecast.confidence}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tips */}
                    {holding.lastAnalysis.tips.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">{t('aiTips')}</h4>
                        <ul className="space-y-1">
                          {holding.lastAnalysis.tips.slice(0, 3).map((tip, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Sentiment Badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{t('marketSentiment')}:</span>
                      <Badge variant={
                        holding.lastAnalysis.sentiment === 'bullish' ? 'default' :
                        holding.lastAnalysis.sentiment === 'bearish' ? 'destructive' :
                        'secondary'
                      }>
                        {tCommon(holding.lastAnalysis.sentiment)}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit2 className="h-4 w-4 mr-2" />
                    {t('edit')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('remove')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('removeConfirmTitle', { symbol: holding.symbol })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('removeConfirmMessage', { quantity: holding.quantity, companyName: holding.companyName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                removeItem(holding.id)
                setShowDeleteDialog(false)
              }}
            >
              {t('remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}