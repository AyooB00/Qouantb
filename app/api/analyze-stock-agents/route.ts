import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { FinnhubClient } from '@/lib/finnhub';
import { StockAnalysisRequest, StockAnalysisResponse, AgentAnalysis, ExtendedStockData } from '@/lib/types/agents';
import { getAgent } from '@/lib/agents/investment-agents';
import { createAgentAnalysisPrompt } from '@/lib/agents/agent-prompts';
import { handleAPIError, validateAPIKeys, validateRequired, APIError } from '@/lib/api/error-handler';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body: StockAnalysisRequest & { locale?: string } = await request.json();
    const { symbol, agentIds, locale = 'en' } = body;

    // Validate inputs
    validateRequired(body as unknown as Record<string, unknown>, ['symbol', 'agentIds']);
    if (agentIds.length === 0) {
      throw new APIError('At least one agent must be selected', 400, 'NO_AGENTS_SELECTED');
    }

    // Validate API keys
    validateAPIKeys(['FINNHUB_API_KEY', 'OPENAI_API_KEY']);

    const finnhub = new FinnhubClient(process.env.FINNHUB_API_KEY!);

    // Fetch extended stock data
    console.log(`Fetching extended data for ${symbol}...`);
    let stockData: ExtendedStockData;
    
    try {
      stockData = await finnhub.getExtendedStockData(symbol);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      throw new APIError(
        `Failed to fetch data for ${symbol}. Please check if the symbol is valid.`,
        404,
        'STOCK_NOT_FOUND'
      );
    }

    console.log(`Analyzing ${symbol} with ${agentIds.length} agents...`);

    // Run analysis for each selected agent in parallel
    const analysisPromises = agentIds.map(async (agentId) => {
      const agent = getAgent(agentId);
      if (!agent) {
        console.warn(`Agent ${agentId} not found`);
        return null;
      }

      try {
        const prompt = createAgentAnalysisPrompt(agent, stockData);
        
        const response = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are ${agent.fullName}. Respond in character with your investment philosophy and style. ${locale === 'ar' ? 'You MUST provide all your analysis, recommendations, and explanations in Arabic (العربية). However, keep stock symbols (like AAPL, MSFT) and currency symbols ($) in English.' : 'Respond in English.'}`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7, // Slightly higher for more personality
          response_format: { type: 'json_object' }
        });

        const content = response.choices[0].message.content;
        if (!content) {
          throw new Error('No response from AI');
        }

        const analysis = JSON.parse(content) as Omit<AgentAnalysis, 'agentId' | 'agentName' | 'symbol'>;
        
        return {
          ...analysis,
          agentId: agent.id,
          agentName: agent.name,
          symbol
        } as AgentAnalysis;

      } catch (error) {
        console.error(`Error analyzing with agent ${agent.name}:`, error);
        return null;
      }
    });

    const analyses = await Promise.all(analysisPromises);
    const validAnalyses = analyses.filter((a): a is AgentAnalysis => a !== null);

    if (validAnalyses.length === 0) {
      throw new APIError(
        'Failed to generate any analyses',
        500,
        'ANALYSIS_FAILED'
      );
    }

    const response: StockAnalysisResponse = {
      symbol,
      companyName: stockData.companyName,
      currentPrice: stockData.currentPrice,
      stockData,
      analyses: validAnalyses,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    return handleAPIError(error);
  }
}