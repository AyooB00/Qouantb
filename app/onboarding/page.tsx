'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Globe, Clock, TrendingUp, ChevronRight, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

interface UserPreferences {
  language: string
  timezone: string
  nasdaqOnly: boolean
  notifications: boolean
}

export default function OnboardingPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('onboarding')
  
  const [currentStep, setCurrentStep] = useState(0)
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: locale,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    nasdaqOnly: true,
    notifications: true
  })

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: t('welcome.title'),
      description: t('welcome.description'),
      icon: TrendingUp
    },
    {
      id: 'language',
      title: t('language.title'),
      description: t('language.description'),
      icon: Globe
    },
    {
      id: 'preferences',
      title: t('preferences.title'),
      description: t('preferences.description'),
      icon: Clock
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Save preferences and redirect
      savePreferences()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const savePreferences = () => {
    // Save to localStorage
    localStorage.setItem('userPreferences', JSON.stringify(preferences))
    localStorage.setItem('preferred-locale', preferences.language)
    localStorage.setItem('onboardingCompleted', 'true')
    
    // Redirect to dashboard
    router.push(`/${preferences.language}/dashboard`)
  }

  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const renderStepContent = () => {
    const StepIcon = steps[currentStep].icon
    
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <StepIcon className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{t('welcome.greeting')}</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('welcome.intro')}
              </p>
            </div>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <p className="text-sm">{t('welcome.feature1')}</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <p className="text-sm">{t('welcome.feature2')}</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <p className="text-sm">{t('welcome.feature3')}</p>
              </div>
            </div>
          </div>
        )
      
      case 1: // Language
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <StepIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{steps[currentStep].title}</h3>
              <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
            </div>
            
            <RadioGroup value={preferences.language} onValueChange={(value) => updatePreference('language', value)}>
              <div className="space-y-3">
                <Label htmlFor="en" className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="en" id="en" />
                  <div className="flex-1">
                    <p className="font-medium">English</p>
                    <p className="text-sm text-muted-foreground">Use English throughout the platform</p>
                  </div>
                </Label>
                
                <Label htmlFor="ar" className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="ar" id="ar" />
                  <div className="flex-1">
                    <p className="font-medium">العربية</p>
                    <p className="text-sm text-muted-foreground">استخدم اللغة العربية في جميع أنحاء المنصة</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        )
      
      case 2: // Preferences
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <StepIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{steps[currentStep].title}</h3>
              <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="nasdaq-only">{t('preferences.nasdaqOnly')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('preferences.nasdaqOnlyDesc')}
                      </p>
                    </div>
                    <Switch
                      id="nasdaq-only"
                      checked={preferences.nasdaqOnly}
                      onCheckedChange={(checked) => updatePreference('nasdaqOnly', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">{t('preferences.notifications')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('preferences.notificationsDesc')}
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={preferences.notifications}
                      onCheckedChange={(checked) => updatePreference('notifications', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">{t('preferences.summary')}</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• {t('language.title')}: {preferences.language === 'ar' ? 'العربية' : 'English'}</p>
                  <p>• {preferences.nasdaqOnly ? t('preferences.nasdaqStocksOnly') : t('preferences.allStocks')}</p>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Progress value={(currentStep + 1) / steps.length * 100} className="mb-4" />
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>
            {t.rich('step', { current: currentStep + 1, total: steps.length })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStepContent()}
          
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={cn(currentStep === 0 && "invisible")}
            >
              {t('back')}
            </Button>
            
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? t('complete') : t('next')}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}