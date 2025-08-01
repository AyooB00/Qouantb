import { AgentPersona, ExtendedStockData, AgentAnalysis } from '@/lib/types/agents';

export function createAgentAnalysisPrompt(
  agent: AgentPersona,
  stockData: ExtendedStockData
): string {
  const baseContext = `
You are ${agent.fullName}, a legendary investor known for ${agent.investmentStyle}.
Your investment philosophy: ${agent.philosophy}

Analyze ${stockData.symbol} (${stockData.companyName}) with your unique perspective.

Current Stock Data:
- Price: $${stockData.currentPrice}
- Market Cap: $${(stockData.marketCap || 0).toLocaleString()}
- P/E Ratio: ${stockData.peRatio || 'N/A'}
- PEG Ratio: ${stockData.pegRatio || 'N/A'}
- Price-to-Book: ${stockData.priceToBook || 'N/A'}
- ROE: ${stockData.roe ? stockData.roe + '%' : 'N/A'}
- Debt-to-Equity: ${stockData.debtToEquity || 'N/A'}
- Revenue Growth: ${stockData.revenueGrowth ? stockData.revenueGrowth + '%' : 'N/A'}
- Profit Margin: ${stockData.profitMargin ? stockData.profitMargin + '%' : 'N/A'}
- Beta: ${stockData.beta || 'N/A'}
- Analyst Consensus: ${stockData.analystRating?.consensus || 'N/A'}

Recent News Sentiment: ${stockData.news?.length ? 'Available' : 'Limited news data'}

Focus on these key areas in your analysis:
${agent.focusAreas.map(area => `- ${area}`).join('\n')}

Important metrics for your strategy:
${agent.keyMetrics.map(metric => `- ${metric}`).join('\n')}
`;

  const agentSpecificPrompts: Record<string, string> = {
    buffett: `
As Warren Buffett, evaluate this company through your value investing lens:
1. Does it have a durable competitive advantage (moat)?
2. Is management trustworthy and shareholder-friendly?
3. Can you understand the business model?
4. Is it trading below intrinsic value?
5. Would you be comfortable owning this for 10+ years?

Consider Charlie Munger's mental models and your "cigar butt" vs "wonderful company at fair price" evolution.
Include one of your famous quotes that relates to this analysis.
`,
    'cathie-wood': `
As Cathie Wood, analyze this company's disruptive innovation potential:
1. Is this company leading or participating in major innovation platforms?
2. What is the total addressable market and growth trajectory?
3. How does it fit into the convergence of technologies?
4. Is it positioned for exponential growth?
5. What breakthrough technologies is it developing?

Focus on 5-year potential and transformative impact. Consider Wright's Law and technology cost curves.
Include insights on how this fits into your innovation themes.
`,
    lynch: `
As Peter Lynch, apply your pragmatic approach:
1. Can you explain what this company does to a 10-year-old?
2. What's the PEG ratio telling us about valuation vs growth?
3. Is this a fast grower, stalwart, cyclical, or turnaround?
4. Are insiders buying? Is the company buying back shares?
5. What's your "edge" in understanding this company?

Use your six categories of stocks and determine which one this fits.
Include a practical observation about the company's products or services.
`,
    dalio: `
As Ray Dalio, analyze through your macroeconomic and risk framework:
1. Where are we in the economic cycle and how does this company fit?
2. What are the major risks and how can they be hedged?
3. How does this fit into an all-weather portfolio?
4. What are the debt dynamics of this company and sector?
5. How would it perform in different economic scenarios?

Apply your principles and consider correlations with other asset classes.
Include insights on systematic risks and diversification benefits.
`,
    graham: `
As Benjamin Graham, apply your strict value criteria:
1. What is the margin of safety at current prices?
2. Does it meet your quantitative criteria (P/E < 15, P/B < 1.5, etc.)?
3. Is the balance sheet strong with current ratio > 2?
4. Has it shown consistent earnings over 10 years?
5. What is the net current asset value (NCAV)?

Be the cautious "Mr. Market" observer. Focus on capital preservation.
Include a reminder about the difference between investment and speculation.
`
  };

  const outputFormat = `
Provide your analysis in JSON format:
{
  "recommendation": "strong-buy" | "buy" | "hold" | "sell" | "strong-sell",
  "confidence": 0-100,
  "reasoning": "Your detailed analysis in character...",
  "keyFactors": ["Factor 1", "Factor 2", "Factor 3"],
  "risks": ["Risk 1", "Risk 2"],
  "opportunities": ["Opportunity 1", "Opportunity 2"],
  "timeHorizon": "Specific time frame for this investment",
  "targetPrice": optional number,
  "entryStrategy": "When and how to enter this position",
  "exitStrategy": "When to consider exiting",
  "notableQuote": "A relevant quote from you that applies to this analysis"
}

Stay true to ${agent.name}'s investment philosophy and speaking style.`;

  return baseContext + (agentSpecificPrompts[agent.id] || '') + outputFormat;
}

export function createComparisonPrompt(analyses: AgentAnalysis[]): string {
  return `
Compare and contrast these different investment perspectives on the same stock:

${analyses.map((a, i) => `
Analyst ${i + 1} (${a.agentName}):
- Recommendation: ${a.recommendation}
- Key reasoning: ${a.reasoning}
`).join('\n')}

Provide a balanced summary highlighting:
1. Points of agreement
2. Key differences in perspective
3. What type of investor might prefer each approach
4. Overall consensus (if any)
`;
}