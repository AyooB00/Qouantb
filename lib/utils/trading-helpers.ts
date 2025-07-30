export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  const formatted = value.toFixed(2);
  return value > 0 ? `+${formatted}%` : `${formatted}%`;
}

export function calculateRiskReward(
  entryPrice: number,
  stopLoss: number,
  takeProfit: number
): number {
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(takeProfit - entryPrice);
  return reward / risk;
}

export function validatePriceRange(min: number, max: number): boolean {
  return min >= 0 && max > min && max <= 100000;
}

export function validateMarketCap(cap: number): boolean {
  return cap >= 0 && cap <= 10000000000000; // Up to 10 trillion
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown): { error: string; statusCode: number } {
  console.error('API Error:', error);
  
  if (error instanceof APIError) {
    return { error: error.message, statusCode: error.statusCode };
  }
  
  if (error instanceof Error) {
    return { error: error.message, statusCode: 500 };
  }
  
  return { error: 'An unexpected error occurred', statusCode: 500 };
}