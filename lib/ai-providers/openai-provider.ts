import OpenAI from 'openai';
import { BaseAIProvider } from './types';
import { SearchCriteria, StockData, TradingOpportunity } from '@/lib/types/trading';

export class OpenAIProvider extends BaseAIProvider {
  name = 'OpenAI';
  private client: OpenAI;

  constructor(apiKey: string, model?: string) {
    super(apiKey, model);
    this.client = new OpenAI({ apiKey });
  }

  async parsePrompt(prompt: string): Promise<SearchCriteria> {
    try {
      const systemPrompt = `You are a financial query parser. Extract trading criteria from natural language prompts.
      
      Extract the following information:
      - Price range (min and max in USD)
      - Risk tolerance (low/medium/high)
      - Holding period (short/medium/long)
      - Market cap range (in millions, optional)
      - Sectors (optional, from: Technology, Healthcare, Finance, Consumer Discretionary, Consumer Staples, Energy, Materials, Industrials, Utilities, Real Estate, Communication Services)
      - Volume requirements (optional)
      
      Rules:
      - "under $X" means max price is X, min is 1
      - "conservative" = low risk, "moderate" = medium risk, "aggressive" = high risk
      - "day trading" or "short-term" = short holding period
      - "swing trading" or "1-3 weeks" = medium holding period
      - "position trading" or "1-2 months" = long holding period
      - "penny stocks" = price under $5
      - "blue chip" or "large cap" = market cap over 10000 million
      - "small cap" = market cap under 2000 million
      
      Return a JSON object with this exact structure:
      {
        "priceRange": { "min": number, "max": number },
        "riskTolerance": "low" | "medium" | "high",
        "holdingPeriod": "short" | "medium" | "long",
        "marketCapRange": { "min": number, "max": number } | null,
        "sectors": string[] | null,
        "volumeRequirement": number | null
      }
      
      Use these defaults if not specified:
      - priceRange: { min: 10, max: 500 }
      - riskTolerance: "medium"
      - holdingPeriod: "medium"
      - marketCapRange: null (no filter)
      - sectors: null (all sectors)
      - volumeRequirement: null (no minimum)`;

      const response = await this.client.chat.completions.create({
        model: this.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const parsed = JSON.parse(content);
      
      // Convert to SearchCriteria format
      const criteria: SearchCriteria = {
        priceRange: parsed.priceRange || { min: 10, max: 500 },
        riskTolerance: parsed.riskTolerance || 'medium',
        holdingPeriod: parsed.holdingPeriod || 'medium',
      };

      if (parsed.marketCapRange) {
        criteria.marketCapRange = {
          min: parsed.marketCapRange.min * 1000000, // Convert to actual values
          max: parsed.marketCapRange.max * 1000000
        };
      }

      if (parsed.sectors && parsed.sectors.length > 0) {
        criteria.sectors = parsed.sectors;
      }

      if (parsed.volumeRequirement) {
        criteria.volumeRequirement = parsed.volumeRequirement;
      }

      return criteria;
    } catch (error) {
      console.error('Error parsing prompt with OpenAI:', error);
      return this.getDefaultCriteria();
    }
  }

  async analyzeStocks(stocks: StockData[], criteria: SearchCriteria): Promise<TradingOpportunity[]> {
    try {
      const prompt = this.createAnalysisPrompt(stocks, criteria);
      
      const response = await this.client.chat.completions.create({
        model: this.model || 'gpt-4o-mini',
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
      const opportunities = result.opportunities || [];
      
      // Validate opportunities
      return opportunities.filter((opp: TradingOpportunity) => this.validateTradingOpportunity(opp));
    } catch (error) {
      console.error('Error analyzing stocks with OpenAI:', error);
      throw error;
    }
  }

  private createAnalysisPrompt(stocks: StockData[], criteria: SearchCriteria): string {
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
}