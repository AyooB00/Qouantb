import OpenAI from 'openai';
import { SearchCriteria } from '@/lib/types/trading';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parsePromptToCriteria(prompt: string): Promise<SearchCriteria> {
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

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
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
    console.error('Error parsing prompt:', error);
    // Return default criteria if parsing fails
    return {
      priceRange: { min: 10, max: 500 },
      riskTolerance: 'medium',
      holdingPeriod: 'medium'
    };
  }
}

// Example prompts for users
export const examplePrompts = [
  "Find tech stocks under $100 with medium risk for swing trading",
  "Show me healthcare opportunities between $50-$500 with conservative approach",
  "I want high-growth stocks with aggressive risk for 1-2 week trades",
  "Find momentum plays in energy sector under $200",
  "Looking for large-cap dividend stocks for medium-term swings",
  "Show me biotech stocks with high volatility for short-term trading",
  "Find undervalued financial stocks between $20-$150",
  "I have $10,000 to invest, show balanced opportunities across sectors",
  "Penny stocks under $5 with high volume for day trading",
  "Blue chip stocks for conservative swing trades",
  "Tech and communication stocks under $300 for position trading",
  "Find stocks between $10-$50 in materials and industrials sectors"
];