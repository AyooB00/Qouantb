'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Settings, Brain, Moon, Sun, Save, Check, Globe } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useTheme } from 'next-themes'
import { Badge } from '@/components/ui/badge'

interface SettingsState {
  aiProvider: 'openai' | 'gemini' | 'auto'
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  autoSave: boolean
  cleanUrls: boolean
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const t = useTranslations('settings')
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState<SettingsState>({
    aiProvider: 'auto',
    theme: 'system',
    notifications: true,
    autoSave: true,
    cleanUrls: false
  })

  const [availableProviders, setAvailableProviders] = useState<{
    openai: boolean
    gemini: boolean
  }>({
    openai: false,
    gemini: false
  })

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings(parsed)
    }

    // Check available providers
    checkAvailableProviders()

    // Set theme from settings
    if (theme) {
      setSettings(prev => ({ ...prev, theme: theme as SettingsState['theme'] }))
    }
  }, [theme])

  const checkAvailableProviders = async () => {
    try {
      const response = await fetch('/api/settings/providers')
      if (response.ok) {
        const data = await response.json()
        setAvailableProviders(data)
      }
    } catch (error) {
      console.error('Error checking providers:', error)
    }
  }

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('appSettings', JSON.stringify(settings))
    
    // Apply theme
    setTheme(settings.theme)
    
    // Set AI provider preference
    if (settings.aiProvider !== 'auto') {
      localStorage.setItem('preferredAIProvider', settings.aiProvider)
    } else {
      localStorage.removeItem('preferredAIProvider')
    }
    
    // Set clean URLs preference
    localStorage.setItem('cleanUrlsMode', settings.cleanUrls ? 'true' : 'false')

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSettingChange = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="h-8 w-8" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

        <div className="space-y-6">
          {/* AI Provider Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {t('providers.title')}
              </CardTitle>
              <CardDescription>
                {t('providers.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai-provider">{t('providers.preferred')}</Label>
                <Select
                  value={settings.aiProvider}
                  onValueChange={(value) => handleSettingChange('aiProvider', value as 'openai' | 'gemini' | 'auto')}
                >
                  <SelectTrigger id="ai-provider">
                    <SelectValue placeholder="Select AI provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      <div className="flex items-center gap-2">
                        <span>{t('providers.automatic')}</span>
                        <Badge variant="secondary" className="text-xs">{t('providers.recommended')}</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="openai" disabled={!availableProviders.openai}>
                      <div className="flex items-center gap-2">
                        <span>OpenAI (GPT-4)</span>
                        {!availableProviders.openai && (
                          <Badge variant="outline" className="text-xs">{t('providers.notConfigured')}</Badge>
                        )}
                      </div>
                    </SelectItem>
                    <SelectItem value="gemini" disabled={!availableProviders.gemini}>
                      <div className="flex items-center gap-2">
                        <span>Google Gemini</span>
                        {!availableProviders.gemini && (
                          <Badge variant="outline" className="text-xs">{t('providers.notConfigured')}</Badge>
                        )}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t('providers.autoDescription')}
                </p>
              </div>

              {/* Provider Status */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-medium">{t('providers.availableProviders')}:</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${availableProviders.openai ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span>OpenAI</span>
                    {availableProviders.openai && <Badge variant="secondary" className="text-xs">{t('providers.active')}</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${availableProviders.gemini ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span>Google Gemini</span>
                    {availableProviders.gemini && <Badge variant="secondary" className="text-xs">{t('providers.active')}</Badge>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                {t('appearance.title')}
              </CardTitle>
              <CardDescription>
                {t('appearance.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">{t('appearance.theme')}</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => handleSettingChange('theme', value as 'light' | 'dark' | 'system')}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        {t('appearance.light')}
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        {t('appearance.dark')}
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        {t('appearance.system')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t('general.title')}</CardTitle>
              <CardDescription>
                {t('general.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">{t('general.notifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('general.notificationsDesc')}
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autosave">{t('general.autoSave')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('general.autoSaveDesc')}
                  </p>
                </div>
                <Switch
                  id="autosave"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('settings.language.title', { defaultValue: 'Language & URLs' })}
              </CardTitle>
              <CardDescription>
                {t('settings.language.description', { defaultValue: 'Configure language and URL preferences' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cleanUrls">{t('settings.language.cleanUrls', { defaultValue: 'Clean URLs Mode' })}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.language.cleanUrlsDesc', { defaultValue: 'Use simple URLs without language prefixes' })}
                  </p>
                </div>
                <Switch
                  id="cleanUrls"
                  checked={settings.cleanUrls}
                  onCheckedChange={(checked) => handleSettingChange('cleanUrls', checked)}
                />
              </div>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <strong>{t('settings.language.cleanUrlsExample', { defaultValue: 'URL format' })}:</strong>
                </p>
                <p className="text-xs font-mono">
                  {settings.cleanUrls ? (
                    <>✅ /finchat<br />✅ /portfolio</>
                  ) : (
                    <>✅ /en/finchat<br />✅ /ar/portfolio</>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {settings.cleanUrls ? t('settings.language.cleanUrlsWarning', { defaultValue: 'Note: This mode reduces SEO visibility for multiple languages' }) : t('settings.language.seoFriendly', { defaultValue: 'SEO-optimized URLs with language prefixes for better search visibility' })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">
              {saved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {t('saved')}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t('save', { defaultValue: 'Save Settings' })}
                </>
              )}
            </Button>
          </div>
        </div>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          {t('about.localOnly')} {t('about.apiKeys')}
        </p>
      </div>
    </div>
  )
}