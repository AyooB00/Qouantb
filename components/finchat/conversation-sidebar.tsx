'use client'

import { Plus, MessageSquare, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useChatStore } from '@/lib/stores/chat-store'
import { cn } from '@/lib/utils'

interface ConversationSidebarProps {
  isOpen: boolean
  onClose: () => void
  onNewChat: () => void
}

export function ConversationSidebar({ isOpen, onClose, onNewChat }: ConversationSidebarProps) {
  const { 
    conversations, 
    currentConversationId, 
    loadConversation, 
    deleteConversation,
    clearAllData 
  } = useChatStore()

  const handleSelectConversation = (id: string) => {
    loadConversation(id)
    onClose()
  }

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteConversation(id)
  }

  const handleNewChat = () => {
    onNewChat()
    onClose()
  }

  const sidebarContent = (
    <>
      <div className="p-4 space-y-2">
        <Button 
          onClick={handleNewChat} 
          className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No conversations yet
            </p>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 mx-2 cursor-pointer transition-all duration-200",
                  currentConversationId === conversation.id 
                    ? "bg-primary/10 text-primary hover:bg-primary/15" 
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <MessageSquare className={cn(
                  "h-4 w-4 flex-shrink-0",
                  currentConversationId === conversation.id 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )} />
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {conversation.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {new Date(conversation.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDeleteConversation(e, conversation.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {conversations.length > 0 && (
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={clearAllData}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Conversations
          </Button>
        </div>
      )}
    </>
  )

  // For desktop, return fixed sidebar
  const desktopSidebar = (
    <div className="w-64 h-full flex flex-col border-r bg-background flex-shrink-0">
      <div className="px-4 py-3 border-b bg-muted/5 flex-shrink-0">
        <h2 className="font-semibold">Chat History</h2>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        {sidebarContent}
      </div>
    </div>
  )

  // Return both desktop sidebar and mobile sheet
  return (
    <>
      {/* Desktop sidebar - always visible on lg+ */}
      <div className="hidden lg:flex">
        {desktopSidebar}
      </div>

      {/* Mobile sidebar - sheet based */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="px-4 py-4 border-b">
            <SheetTitle>Conversations</SheetTitle>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  )
}