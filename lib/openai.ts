import OpenAI from 'openai';
import { StockData, TradingOpportunity, SearchCriteria } from '@/lib/types/trading';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeStocksWithAI(
  stocks: StockData[],
  criteria: SearchCriteria
): Promise<TradingOpportunity[]> {
  try {
    const prompt = createAnalysisPrompt(stocks, criteria);
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert swing trading analyst. Analyze stocks for swing trading opportunities based on technical indicators and market conditions. 
          Provide specific entry points, stop losses, and take profit targets. 
          Be conservative with recommendations and only suggest high-confidence opportunities.
          Always calculate risk/reward ratios and ensure they are favorable (minimum 2:1).`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(content);
    return result.opportunities || [];
  } catch (error) {
    console.error('Error analyzing stocks with AI:', error);
    throw error;
  }
}

function createAnalysisPrompt(stocks: StockData[], criteria: SearchCriteria): string {
  const riskProfile = {
    low: 'Conservative approach with tight stop losses (2-3%) and modest targets (5-8%)',
    medium: 'Balanced approach with moderate stop losses (3-5%) and targets (8-15%)',
    high: 'Aggressive approach with wider stop losses (5-7%) and ambitious targets (15-25%)'
  };

  const holdingPeriodDays = {
    short: '2-5 days',
    medium: '1-3 weeks',
    long: '1-2 months'
  };

  return `
Analyze the following ${stocks.length} stocks for swing trading opportunities:

User Criteria:
- Price Range: $${criteria.priceRange.min} - $${criteria.priceRange.max}
- Risk Tolerance: ${criteria.riskTolerance} (${riskProfile[criteria.riskTolerance]})
- Holding Period: ${criteria.holdingPeriod} (${holdingPeriodDays[criteria.holdingPeriod]})
${criteria.sectors?.length ? `- Preferred Sectors: ${criteria.sectors.join(', ')}` : ''}

Stock Data:
${stocks.map(stock => `
Symbol: ${stock.symbol}
Company: ${stock.companyName}
Current Price: $${stock.currentPrice}
Change: ${stock.changePercent}%
Sector: ${stock.sector || 'Unknown'}
Technical Indicators:
- RSI: ${stock.technicalIndicators?.rsi || 'N/A'}
- MACD: ${stock.technicalIndicators?.macd ? `MACD: ${stock.technicalIndicators.macd.macd}, Signal: ${stock.technicalIndicators.macd.signal}` : 'N/A'}
`).join('\n')}

Please analyze these stocks and return a JSON object with the following structure:
{
  "opportunities": [
    {
      "symbol": "AAPL",
      "companyName": "Apple Inc.",
      "currentPrice": 150.00,
      "entryPrice": 148.50,
      "entryPercentage": -1.0,
      "stopLoss": 144.00,
      "stopLossPercentage": -3.0,
      "takeProfit": {
        "target1": 155.00,
        "target2": 160.00,
        "target3": 165.00
      },
      "takeProfitPercentages": {
        "target1": 4.4,
        "target2": 7.7,
        "target3": 11.1
      },
      "confidence": 75,
      "reasoning": "Strong technical setup with RSI oversold bounce...",
      "technicalAnalysis": "RSI showing bullish divergence, MACD about to cross...",
      "riskRewardRatio": 2.5
    }
  ]
}

Only include stocks with:
1. Clear technical setups for swing trading
2. Favorable risk/reward ratios (minimum 2:1)
3. Confidence level above 60%
4. Entry points that make sense given the current price

For each opportunity, ensure:
- Entry price is realistic (within 2% of current price for immediate entries)
- Stop loss respects the user's risk tolerance
- Take profit targets are achievable within the holding period
- Risk/reward ratio is calculated as (Target1 - Entry) / (Entry - StopLoss)
`;
}

export async function validateTradingOpportunity(opportunity: TradingOpportunity): Promise<boolean> {
  // Validate that the opportunity makes sense
  const entryDiff = Math.abs((opportunity.entryPrice - opportunity.currentPrice) / opportunity.currentPrice * 100);
  
  // Entry should be within 3% of current price
  if (entryDiff > 3) return false;
  
  // Risk/reward should be at least 2:1
  if (opportunity.riskRewardRatio < 2) return false;
  
  // Confidence should be at least 60%
  if (opportunity.confidence < 60) return false;
  
  // Stop loss should be reasonable (not more than 10%)
  if (opportunity.stopLossPercentage < -10) return false;
  
  return true;
}