'use client'

import { useEffect, useState } from 'react'
import { Send, Bot, Sparkles, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChatStore } from '@/lib/stores/chat-store'
import { ChatInterface } from '@/components/finchat/chat-interface'
import { SuggestedPrompts } from '@/components/finchat/suggested-prompts'
import { featuredPrompts } from '@/lib/finchat/financial-prompts'

export default function FinChatPage() {
  const { messages, currentConversationId, createConversation } = useChatStore()
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    // Hide welcome screen if there are messages
    if (messages.length > 0) {
      setShowWelcome(false)
    }
  }, [messages])

  const handlePromptSelect = (prompt: string) => {
    // Create a new conversation if none exists
    if (!currentConversationId) {
      createConversation(prompt.slice(0, 50))
    }
    setShowWelcome(false)
  }

  const handleNewChat = () => {
    createConversation()
    setShowWelcome(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {showWelcome ? (
        // Welcome Screen
        <div className="container max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Bot className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">FinChat</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your AI-powered financial assistant. Get real-time market insights, stock analysis, 
              and personalized investment guidance.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Market Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Real-time market trends, sector performance, and economic indicators
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Smart Insights</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered analysis with data from multiple financial sources
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 mb-4">
                <AlertCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Risk Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Evaluate investment risks and get personalized recommendations
              </p>
            </div>
          </div>

          {/* Suggested Prompts */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold mb-4 text-center">Try asking about:</h2>
            <SuggestedPrompts 
              prompts={featuredPrompts}
              onSelectPrompt={handlePromptSelect}
            />
            
            <div className="text-center mt-8">
              <Button onClick={handleNewChat} size="lg">
                <Send className="mr-2 h-4 w-4" />
                Start New Chat
              </Button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              FinChat provides financial information for educational purposes only. 
              Always consult with a qualified financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      ) : (
        // Chat Interface
        <ChatInterface onBackToWelcome={() => setShowWelcome(true)} />
      )}
    </div>
  )
}