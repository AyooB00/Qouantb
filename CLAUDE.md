# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuoantB is an AI-powered investment platform that uses multiple AI agents to identify both short-term trading and long-term investment opportunities. Built with Next.js 15.4.5 (using Turbopack), TypeScript, and React 19, it analyzes hundreds of companies using methodologies from legendary investors like Warren Buffett, Cathie Wood, Peter Lynch, Ray Dalio, and Benjamin Graham.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run linter
npm run lint
```

## Environment Setup

Copy `.env.example` to `.env` and configure:

- **AI Providers**: `OPENAI_API_KEY` or `GEMINI_API_KEY` (at least one required)
- **Market Data**: `FINNHUB_API_KEY` for real-time stock quotes
- **Provider Selection**: `AI_PROVIDER` (openai/gemini) and `AI_FALLBACK_PROVIDER`

## Architecture Overview

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom color system (teal/green/blue palette)
- **State Management**: Zustand with persistence
- **Charts**: Recharts for data visualization
- **AI Integration**: OpenAI and Google Gemini providers with factory pattern

### Key Architectural Patterns

1. **AI Provider Factory Pattern** (`lib/ai-providers/`)
   - Abstracts AI provider implementation details
   - Supports automatic fallback between providers
   - Unified interface for OpenAI and Gemini

2. **Zustand Stores** (`lib/stores/`)
   - `portfolio-store.ts`: Portfolio management with persistence
   - `chat-store.ts`: Chat conversations and message management
   - Both use localStorage persistence

3. **API Routes Structure** (`app/api/`)
   - RESTful endpoints for stock analysis, portfolio operations, and chat
   - Consistent error handling and response formats
   - Mock data fallbacks when API keys unavailable

4. **Component Organization**
   - Feature-based grouping (e.g., `components/finchat/`, `components/portfolio/`)
   - Shared UI components in `components/ui/`
   - Landing page components in `components/landing/`

### Key Features Implementation

1. **AI Investment Agents** (`lib/agents/investment-agents.ts`)
   - 5 legendary investor personas: Warren Buffett, Cathie Wood, Peter Lynch, Ray Dalio, Benjamin Graham
   - Each agent has unique investment philosophy, focus areas, and key metrics
   - Different risk profiles (conservative, moderate, aggressive) and time horizons
   - Agents analyze financial statements, trades, and news to identify opportunities

2. **FinChat** (`app/finchat/`)
   - Streaming responses with proper error handling
   - Message persistence across sessions
   - Stock card and chart integration in chat
   - AI-powered financial advice and market insights

3. **Stock Analysis** (`app/stock-analysis/`)
   - Multiple AI "investment agents" analyze stocks in parallel
   - Each agent provides recommendations based on their methodology
   - Consensus view across all agents
   - Custom loading states with progress tracking

4. **Portfolio Management** (`app/portfolio/`)
   - Real-time portfolio tracking with P&L calculations
   - Risk analysis and diversification scoring
   - AI-powered insights generation
   - Enterprise features for investment funds

5. **Swing Trading** (`app/swing-trading/`)
   - Natural language search for trading opportunities
   - AI-powered pattern recognition
   - Entry/exit point recommendations
   - Short-term trading focus (days to weeks)

### UI/UX Patterns

1. **Color System**
   - Primary: Black/White
   - Secondary: Teal (green-blue mix) gradients
   - Defined in CSS variables in `app/globals.css`

2. **Loading States**
   - Custom animated loading components per feature
   - Progress indicators with stage visualization
   - Skeleton loaders for data fetching

3. **Layout System**
   - Sidebar navigation (hidden on landing page)
   - Responsive design with mobile considerations
   - Consistent spacing using Tailwind classes

### Important Implementation Details

1. **API Response Formats**
   - Stock quotes return `{ quote: {...}, profile: {...} }` format
   - Chat responses stream with `{ content: string, isComplete: boolean }`
   - Analysis endpoints return structured data with metadata

2. **Error Handling**
   - API routes return graceful fallbacks
   - Frontend components show user-friendly error states
   - Mock data available when external APIs fail

3. **Real-time Data**
   - Finnhub integration for stock quotes
   - 1-minute cache on stock data
   - WebSocket support planned but not implemented

4. **Type Safety**
   - Comprehensive TypeScript types in `lib/types/`
   - Zod validation for form inputs
   - Strict type checking throughout

### Landing Page Components (`components/landing/`)

1. **AIAgentsShowcase**: Interactive cards showing all 5 investment agents with their methodologies
2. **ArchitectureDiagram**: Visual flowchart of data sources → processing → AI analysis
3. **InvestmentFundsSection**: Enterprise features for institutional investors
4. **DocumentationSection**: Comprehensive guides and API documentation
5. **Enhanced HeroSection**: Dynamic headlines emphasizing AI agents and trading opportunities

### Enterprise Features

1. **For Investment Funds**
   - Bank-grade security with end-to-end encryption
   - Bulk portfolio analysis capabilities
   - API integration for automated workflows
   - White-label solutions available
   - Local LLMs for secure company data

2. **Data Processing Architecture**
   - Multiple data sources: Market APIs, Financial Statements, News, Technical Indicators
   - Context engineering layer for data normalization and enrichment
   - Multi-agent AI processing in parallel
   - Sub-100ms response times

### Common Pitfalls to Avoid

1. **Stock Data Format**: The API returns nested format, components expect flattened format
2. **useEffect Dependencies**: Always include async functions inside useEffect
3. **Color Classes**: Use custom CSS variables, not hardcoded Tailwind colors
4. **API Keys**: Check for existence before making external API calls
5. **Loading States**: Always show loading indicators for async operations
6. **Animation Classes**: Ensure all animation classes are defined in globals.css
7. **Agent IDs**: Use consistent agent IDs from `investment-agents.ts`