'use client'

import { useState, useEffect } from 'react'
import { Settings, Brain, Moon, Sun, Save, Check } from 'lucide-react'
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
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState<SettingsState>({
    aiProvider: 'auto',
    theme: 'system',
    notifications: true,
    autoSave: true
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
      setSettings(prev => ({ ...prev, theme: theme as any }))
    }
  }, [])

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

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSettingChange = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Configure your application preferences
        </p>
      </div>

        <div className="space-y-6">
          {/* AI Provider Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Provider
              </CardTitle>
              <CardDescription>
                Choose your preferred AI provider for analysis and chat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai-provider">Preferred Provider</Label>
                <Select
                  value={settings.aiProvider}
                  onValueChange={(value) => handleSettingChange('aiProvider', value)}
                >
                  <SelectTrigger id="ai-provider">
                    <SelectValue placeholder="Select AI provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      <div className="flex items-center gap-2">
                        <span>Automatic</span>
                        <Badge variant="secondary" className="text-xs">Recommended</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="openai" disabled={!availableProviders.openai}>
                      <div className="flex items-center gap-2">
                        <span>OpenAI (GPT-4)</span>
                        {!availableProviders.openai && (
                          <Badge variant="outline" className="text-xs">Not configured</Badge>
                        )}
                      </div>
                    </SelectItem>
                    <SelectItem value="gemini" disabled={!availableProviders.gemini}>
                      <div className="flex items-center gap-2">
                        <span>Google Gemini</span>
                        {!availableProviders.gemini && (
                          <Badge variant="outline" className="text-xs">Not configured</Badge>
                        )}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Automatic mode will use the best available provider
                </p>
              </div>

              {/* Provider Status */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-medium">Available Providers:</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${availableProviders.openai ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span>OpenAI</span>
                    {availableProviders.openai && <Badge variant="secondary" className="text-xs">Active</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${availableProviders.gemini ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span>Google Gemini</span>
                    {availableProviders.gemini && <Badge variant="secondary" className="text-xs">Active</Badge>}
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
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => handleSettingChange('theme', value)}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        System
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
              <CardTitle>General</CardTitle>
              <CardDescription>
                General application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts for market updates and analysis
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
                  <Label htmlFor="autosave">Auto-save</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save your work and preferences
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

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">
              {saved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          Settings are saved locally in your browser. 
          API keys should be configured through environment variables.
        </p>
      </div>
    </div>
  )
}