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
          className="w-full justify-start"
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 pb-4">
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No conversations yet
            </p>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent transition-colors",
                  currentConversationId === conversation.id && "bg-accent"
                )}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium truncate">
                    {conversation.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
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

  // Mobile sidebar
  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="px-4 py-4 border-b">
            <SheetTitle>Conversations</SheetTitle>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 lg:border-r">
        <div className="px-4 py-4 border-b">
          <h2 className="font-semibold">Conversations</h2>
        </div>
        {sidebarContent}
      </div>
    </>
  )
}