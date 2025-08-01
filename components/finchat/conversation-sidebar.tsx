'use client'

import { useState, useMemo } from 'react'
import { Plus, Trash2, MoreHorizontal, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useChatStore } from '@/lib/stores/chat-store'
import { cn } from '@/lib/utils'
import { useLocale } from '@/lib/locale-context'
import { useTranslations } from 'next-intl'

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
    updateConversationTitle,
    clearAllData 
  } = useChatStore()
  const locale = useLocale()
  const t = useTranslations('finChat')
  const commonT = useTranslations('common')
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    
    const query = searchQuery.toLowerCase()
    return conversations.filter(conv => {
      // Search in title
      if (conv.title.toLowerCase().includes(query)) return true
      
      // Search in messages content
      return conv.messages.some(msg => 
        msg.content.toLowerCase().includes(query)
      )
    })
  }, [conversations, searchQuery])

  const handleSelectConversation = (id: string) => {
    loadConversation(id)
    onClose()
  }

  const handleRename = (id: string) => {
    const conversation = conversations.find(c => c.id === id)
    if (!conversation) return
    
    const newTitle = prompt('Rename chat:', conversation.title)
    if (newTitle && newTitle.trim()) {
      updateConversationTitle(id, newTitle.trim())
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setConversationToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (conversationToDelete) {
      deleteConversation(conversationToDelete)
      setDeleteDialogOpen(false)
      setConversationToDelete(null)
    }
  }

  const handleNewChat = () => {
    onNewChat()
    onClose()
  }

  // Sort conversations by most recent
  const sortedConversations = useMemo(() => {
    return [...filteredConversations].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }, [filteredConversations])

  const renderConversationItem = (conversation: typeof conversations[0]) => {
    const isActive = currentConversationId === conversation.id

    return (
      <div
        key={conversation.id}
        className={cn(
          "group relative flex items-center rounded-lg px-3 py-2 mx-2 cursor-pointer transition-all",
          isActive 
            ? "bg-primary text-primary-foreground" 
            : "hover:bg-muted"
        )}
        onClick={() => handleSelectConversation(conversation.id)}
      >
        <div className="flex-1 min-w-0 overflow-hidden pr-1">
          <p className="text-xs overflow-hidden text-ellipsis whitespace-nowrap" title={conversation.title}>
            {conversation.title}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => handleRename(conversation.id)}>
              {t('actions.rename')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => handleDeleteClick(e, conversation.id)}
              className="text-destructive"
            >
              {t('actions.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  const sidebarContent = (
    <>
      <div className="p-3">
        <Button 
          onClick={handleNewChat} 
          className="w-full justify-center gap-2 h-9"
          variant="default"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          {t('sidebar.newChat')}
        </Button>
        
        {conversations.length > 20 && (
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={t('actions.searchChats')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-xs"
            />
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 px-1 pb-2">
          {sortedConversations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xs text-muted-foreground">
                {searchQuery ? t('sidebar.noResults') : t('sidebar.startNewChat')}
              </p>
            </div>
          ) : (
            sortedConversations.map(renderConversationItem)
          )}
        </div>
      </ScrollArea>

      {conversations.length > 0 && (
        <div className="p-2 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-xs text-muted-foreground"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-40">
              <DropdownMenuItem 
                onClick={() => setClearAllDialogOpen(true)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                {t('actions.clearAll')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </>
  )

  // For desktop, return fixed sidebar
  const desktopSidebar = (
    <div className="w-56 h-full flex flex-col border-r bg-muted/30">
      <div className="px-3 py-3 border-b bg-background">
        <h2 className="font-semibold text-sm">{t('sidebar.chats')}</h2>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col bg-background">
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
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="px-3 py-3 border-b">
            <SheetTitle className="text-sm font-semibold">{t('sidebar.chats')}</SheetTitle>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('sidebar.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('sidebar.deleteConfirmMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConversationToDelete(null)}>{commonT('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear all confirmation dialog */}
      <AlertDialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('sidebar.clearAllConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('sidebar.clearAllConfirmMessage', { count: conversations.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{commonT('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => { clearAllData(); setClearAllDialogOpen(false); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('actions.clearAll')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}