import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { FinnhubClient } from '@/lib/finnhub';
import { StockAnalysisRequest, StockAnalysisResponse, AgentAnalysis, ExtendedStockData } from '@/lib/types/agents';
import { getAgent } from '@/lib/agents/investment-agents';
import { createAgentAnalysisPrompt } from '@/lib/agents/agent-prompts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body: StockAnalysisRequest = await request.json();
    const { symbol, agentIds } = body;

    // Validate inputs
    if (!symbol || !agentIds || agentIds.length === 0) {
      return NextResponse.json(
        { error: 'Symbol and at least one agent must be selected' },
        { status: 400 }
      );
    }

    // Validate API keys
    if (!process.env.FINNHUB_API_KEY || !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'API keys not configured' },
        { status: 500 }
      );
    }

    const finnhub = new FinnhubClient(process.env.FINNHUB_API_KEY);

    // Fetch extended stock data
    console.log(`Fetching extended data for ${symbol}...`);
    let stockData: ExtendedStockData;
    
    try {
      stockData = await finnhub.getExtendedStockData(symbol);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      return NextResponse.json(
        { error: `Failed to fetch data for ${symbol}. Please check if the symbol is valid.` },
        { status: 404 }
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
              content: `You are ${agent.fullName}. Respond in character with your investment philosophy and style.`
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
      return NextResponse.json(
        { error: 'Failed to generate any analyses' },
        { status: 500 }
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
    console.error('Error in analyze-stock-agents API:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}