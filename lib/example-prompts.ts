// Client-safe file - no server-side dependencies
// This file is now deprecated in favor of translation files
// Use translations from messages/[locale].json instead

export const examplePrompts = [
  "Find tech stocks under $100 for swing trading",
  "Show me stocks between $20-$50 with medium risk",
  "I want high-growth stocks under $200",
  "Find momentum stocks in technology sector",
  "Looking for undervalued stocks under $75",
  "Show me volatile stocks for day trading",
  "Find dividend stocks for conservative trades",
  "Stocks under $50 with strong technicals"
];

// Helper function to get translated prompts
export function getTranslatedPrompts(t: (key: string) => string): string[] {
  try {
    return [
      t('swingTrading.examplePrompts.prompt1'),
      t('swingTrading.examplePrompts.prompt2'),
      t('swingTrading.examplePrompts.prompt3'),
      t('swingTrading.examplePrompts.prompt4'),
      t('swingTrading.examplePrompts.prompt5'),
      t('swingTrading.examplePrompts.prompt6'),
      t('swingTrading.examplePrompts.prompt7'),
      t('swingTrading.examplePrompts.prompt8'),
    ];
  } catch (error) {
    return examplePrompts;
  }
}