'use client'

import { useTransition, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { LANGUAGE_COOKIE_NAME, REMEMBER_LANGUAGE_COOKIE_NAME } from '@/lib/language-preferences'
import { useLocale } from '@/lib/locale-context'

interface LanguageSwitcherProps {
  className?: string
  showLabel?: boolean
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function LanguageSwitcher({ 
  className, 
  showLabel = true,
  variant = 'ghost',
  size = 'default'
}: LanguageSwitcherProps) {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rememberChoice, setRememberChoice] = useState(false)
  const t = useTranslations('languageSwitcher')

  // Load remember choice preference
  useEffect(() => {
    const remembered = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${REMEMBER_LANGUAGE_COOKIE_NAME}=`))
      ?.split('=')[1] === 'true'
    
    setRememberChoice(remembered || false)
  }, [])

  const switchLocale = async (newLocale: Locale) => {
    startTransition(async () => {
      // Set cookies for language preference
      const expires = rememberChoice 
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString() // 1 year
        : '' // Session cookie

      // Set language preference cookie
      document.cookie = `${LANGUAGE_COOKIE_NAME}=${newLocale}; path=/; ${expires ? `expires=${expires};` : ''} SameSite=Lax`
      
      // Set remember choice cookie
      if (rememberChoice) {
        document.cookie = `${REMEMBER_LANGUAGE_COOKIE_NAME}=true; path=/; expires=${expires}; SameSite=Lax`
      }
      
      // Store preference in localStorage as backup
      localStorage.setItem('preferred-locale', newLocale)
      
      // Refresh the page to apply new locale
      router.refresh()
    })
  }

  const handleRememberChoiceChange = (checked: boolean) => {
    setRememberChoice(checked)
    
    if (!checked) {
      // Remove remember cookie if unchecked
      document.cookie = `${REMEMBER_LANGUAGE_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={cn('gap-2', className)}
          disabled={isPending}
        >
          <Globe className="h-4 w-4" />
          {showLabel && (
            <>
              <span className="hidden sm:inline">{localeNames[locale]}</span>
              <span className="sm:hidden">{localeFlags[locale]}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className={cn(
              'cursor-pointer gap-2',
              locale === loc && 'bg-accent'
            )}
          >
            <span className="text-lg">{localeFlags[loc]}</span>
            <span>{localeNames[loc]}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="flex items-center space-x-2 px-2 py-2">
          <Checkbox 
            id="remember-language"
            checked={rememberChoice}
            onCheckedChange={handleRememberChoiceChange}
          />
          <label
            htmlFor="remember-language"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t('rememberChoice')}
          </label>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}