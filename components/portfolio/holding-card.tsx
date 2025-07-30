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

interface HoldingCardProps {
  holding: PortfolioItem
}

export function HoldingCard({ holding }: HoldingCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { removeItem } = usePortfolioStore()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

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
                  <Badge variant="outline">{holding.quantity} shares</Badge>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-lg font-semibold">{formatCurrency(totalValue)}</p>
                    <p className={cn(
                      "text-sm flex items-center gap-1",
                      profitLoss >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {profitLoss >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {formatCurrency(Math.abs(profitLoss))} ({formatPercent(profitLossPercent)})
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
                    <p className="text-xs text-muted-foreground">Current Price</p>
                    <p className="text-sm font-medium">
                      {holding.currentPrice ? formatCurrency(holding.currentPrice) : 'Loading...'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Cost</p>
                    <p className="text-sm font-medium">{formatCurrency(holding.avgCost)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Cost</p>
                    <p className="text-sm font-medium">
                      {formatCurrency(holding.quantity * holding.avgCost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Added</p>
                    <p className="text-sm font-medium">
                      {new Date(holding.addedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* AI Analysis */}
                {holding.lastAnalysis && (
                  <div className="space-y-3">
                    {/* Forecast */}
                    <div className="bg-muted/50 rounded-lg p-3">
                      <h4 className="text-sm font-medium mb-2">AI Forecast</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">7-Day Target</p>
                          <p className="text-sm font-medium">
                            {formatCurrency(holding.lastAnalysis.forecast.sevenDay)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">30-Day Target</p>
                          <p className="text-sm font-medium">
                            {formatCurrency(holding.lastAnalysis.forecast.thirtyDay)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Confidence</span>
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
                        <h4 className="text-sm font-medium mb-2">AI Tips</h4>
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
                      <span className="text-xs text-muted-foreground">Market Sentiment:</span>
                      <Badge variant={
                        holding.lastAnalysis.sentiment === 'bullish' ? 'default' :
                        holding.lastAnalysis.sentiment === 'bearish' ? 'destructive' :
                        'secondary'
                      }>
                        {holding.lastAnalysis.sentiment}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
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
            <AlertDialogTitle>Remove {holding.symbol} from portfolio?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {holding.quantity} shares of {holding.companyName} from your portfolio. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                removeItem(holding.id)
                setShowDeleteDialog(false)
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}