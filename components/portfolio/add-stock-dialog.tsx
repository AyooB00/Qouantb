'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'
import StockSelector from '@/components/stock-analysis/stock-selector'
import { useToast } from '@/hooks/use-toast'

interface AddStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddStockDialog({ open, onOpenChange }: AddStockDialogProps) {
  const [selectedSymbol, setSelectedSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [avgCost, setAvgCost] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { addItem } = usePortfolioStore()
  const { toast } = useToast()

  const handleAdd = async () => {
    if (!selectedSymbol || !quantity || !avgCost) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields',
        variant: 'destructive'
      })
      return
    }

    const quantityNum = parseInt(quantity)
    const avgCostNum = parseFloat(avgCost)

    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast({
        title: 'Invalid quantity',
        description: 'Please enter a valid number of shares',
        variant: 'destructive'
      })
      return
    }

    if (isNaN(avgCostNum) || avgCostNum <= 0) {
      toast({
        title: 'Invalid price',
        description: 'Please enter a valid average cost',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      // Fetch company name from search API
      const response = await fetch(`/api/search-stocks?q=${selectedSymbol}`)
      if (!response.ok) throw new Error('Failed to fetch stock info')
      
      const data = await response.json()
      const stockInfo = data.results?.find((s: any) => s.symbol === selectedSymbol)
      
      addItem({
        symbol: selectedSymbol,
        companyName: stockInfo?.description || selectedSymbol,
        quantity: quantityNum,
        avgCost: avgCostNum
      })

      toast({
        title: 'Stock added',
        description: `Added ${quantityNum} shares of ${selectedSymbol} to your portfolio`
      })

      // Reset form
      setSelectedSymbol('')
      setQuantity('')
      setAvgCost('')
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add stock to portfolio',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Stock to Portfolio</DialogTitle>
          <DialogDescription>
            Add a new stock position to track in your portfolio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Stock Selection */}
          <div className="space-y-2">
            <Label>Stock Symbol</Label>
            <StockSelector
              onSelect={setSelectedSymbol}
              selectedSymbol={selectedSymbol}
              disabled={isLoading}
            />
            {selectedSymbol && (
              <p className="text-sm text-muted-foreground">
                Selected: <span className="font-medium">{selectedSymbol}</span>
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Number of Shares</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="e.g., 100"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              step="1"
            />
          </div>

          {/* Average Cost */}
          <div className="space-y-2">
            <Label htmlFor="avgCost">Average Cost per Share</Label>
            <Input
              id="avgCost"
              type="number"
              placeholder="e.g., 150.50"
              value={avgCost}
              onChange={(e) => setAvgCost(e.target.value)}
              min="0.01"
              step="0.01"
            />
          </div>

          {/* Total Value Display */}
          {quantity && avgCost && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">Total Investment</p>
              <p className="text-lg font-semibold">
                ${(parseFloat(quantity) * parseFloat(avgCost)).toFixed(2)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!selectedSymbol || !quantity || !avgCost || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add to Portfolio'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}