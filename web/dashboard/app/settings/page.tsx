'use client'

import React, { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Settings as SettingsIcon,
  Globe,
  Shield,
  Bell,
  Zap,
  Store,
  Bot,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react'

interface SettingsSection {
  id: string
  title: string
  description: string
  icon: any
}

const settingSections: SettingsSection[] = [
  {
    id: 'ai-responses',
    title: 'AI Response Configuration',
    description: 'Configure how the AI responds to customers in different Nigerian languages',
    icon: Bot
  },
  {
    id: 'business-profile',
    title: 'Business Profile',
    description: 'Your store information, contact details, and branding',
    icon: Store
  },
  {
    id: 'languages',
    title: 'Language & Localization',
    description: 'Configure supported languages and cultural preferences',
    icon: Globe
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Manage alerts, webhooks, and communication preferences',
    icon: Bell
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect with WhatsApp, Instagram, SMS, and payment providers',
    icon: Zap
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    description: 'API keys, access controls, and data protection settings',
    icon: Shield
  }
]

const ToggleSwitch = ({
  enabled,
  onChange,
  disabled = false
}: {
  enabled: boolean
  onChange: (enabled: boolean) => void
  disabled?: boolean
}) => (
  <button
    onClick={() => !disabled && onChange(!enabled)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
      enabled ? 'bg-primary' : 'bg-muted'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
)

export default function Settings() {
  const [activeSection, setActiveSection] = useState('ai-responses')
  const [isSaving, setIsSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [settings, setSettings] = useState({
    ai: {
      responseStyle: 'friendly',
      useNigerianSlang: true,
      autoNegotiation: true,
      responseTime: 'instant',
      fallbackToHuman: true,
      confidenceThreshold: 85
    },
    business: {
      name: 'YarnMarket Store',
      description: 'Quality fabrics and fashion accessories',
      phone: '+234-801-234-5678',
      email: 'hello@yarnmarket.ng',
      address: 'Victoria Island, Lagos, Nigeria',
      currency: 'NGN',
      timezone: 'Africa/Lagos'
    },
    languages: {
      primary: 'english',
      supported: ['english', 'pidgin', 'yoruba', 'igbo', 'hausa'],
      autoDetect: true,
      translateResponses: true
    },
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      webhookUrl: 'https://api.example.com/webhook',
      escalationThreshold: 3
    },
    integrations: {
      whatsapp: { enabled: true, connected: true, phone: '+234-801-234-5678' },
      instagram: { enabled: true, connected: false, username: '' },
      sms: { enabled: false, connected: false, provider: 'twilio' },
      payment: { enabled: true, connected: true, provider: 'flutterwave' }
    },
    security: {
      apiKey: 'sk_live_••••••••••••••••1234',
      webhookSecret: 'whsec_••••••••••••1234',
      ipWhitelist: ['192.168.1.1', '10.0.0.1'],
      sessionTimeout: 24
    }
  })

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      // Show success message
    }, 2000)
  }

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }))
  }

  const renderAISettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Response Personality</CardTitle>
              <CardDescription>How the AI should communicate with customers</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Response Style</label>
            <select
              value={settings.ai.responseStyle}
              onChange={(e) => updateSetting('ai', 'responseStyle', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="professional">Professional & Formal</option>
              <option value="friendly">Friendly & Casual</option>
              <option value="enthusiastic">Enthusiastic & Energetic</option>
              <option value="helpful">Helpful & Supportive</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Use Nigerian Slang & Expressions</p>
              <p className="text-sm text-muted-foreground">Include local expressions and cultural context</p>
            </div>
            <ToggleSwitch
              enabled={settings.ai.useNigerianSlang}
              onChange={(value) => updateSetting('ai', 'useNigerianSlang', value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Auto-Negotiation</p>
              <p className="text-sm text-muted-foreground">Allow AI to negotiate prices within set limits</p>
            </div>
            <ToggleSwitch
              enabled={settings.ai.autoNegotiation}
              onChange={(value) => updateSetting('ai', 'autoNegotiation', value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Confidence Threshold</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.ai.confidenceThreshold}
                onChange={(e) => updateSetting('ai', 'confidenceThreshold', parseInt(e.target.value))}
                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <Badge variant="secondary" className="min-w-[3rem] justify-center">
                {settings.ai.confidenceThreshold}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Below this threshold, conversations will be escalated to human agents
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Your business details and contact information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Business Name</label>
              <input
                type="text"
                value={settings.business.name}
                onChange={(e) => updateSetting('business', 'name', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Phone Number</label>
              <input
                type="text"
                value={settings.business.phone}
                onChange={(e) => updateSetting('business', 'phone', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Description</label>
              <textarea
                value={settings.business.description}
                onChange={(e) => updateSetting('business', 'description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <input
                type="email"
                value={settings.business.email}
                onChange={(e) => updateSetting('business', 'email', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Currency</label>
              <select
                value={settings.business.currency}
                onChange={(e) => updateSetting('business', 'currency', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="NGN">Nigerian Naira (NGN)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Communication Channels</CardTitle>
              <CardDescription>Connect your messaging platforms</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(settings.integrations).map(([key, integration]) => (
            <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="font-semibold text-primary text-sm">
                    {key === 'whatsapp' ? 'WA' :
                     key === 'instagram' ? 'IG' :
                     key === 'sms' ? 'SMS' : 'PAY'}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold">
                    {key === 'whatsapp' ? 'WhatsApp Business' :
                     key === 'instagram' ? 'Instagram DMs' :
                     key === 'sms' ? 'SMS Gateway' :
                     'Payment Gateway'}
                  </h4>
                  <div className="flex items-center gap-1 mt-1">
                    {integration.connected ? (
                      <>
                        <Check className="h-3 w-3 text-primary" />
                        <span className="text-sm text-muted-foreground">Connected</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Not Connected</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ToggleSwitch
                  enabled={integration.enabled}
                  onChange={(value) => updateSetting('integrations', key, { ...integration, enabled: value })}
                />
                <Button variant="outline" size="sm">
                  {integration.connected ? 'Reconfigure' : 'Connect'}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Manage your API keys and security settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">API Key</label>
            <div className="flex items-center gap-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.security.apiKey}
                readOnly
                className="flex-1 px-3 py-2 border rounded-lg bg-muted font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="outline">
                Regenerate
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Session Timeout (hours)</label>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value={1}>1 hour</option>
              <option value={8}>8 hours</option>
              <option value={24}>24 hours</option>
              <option value={168}>1 week</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSection = () => {
    switch (activeSection) {
      case 'ai-responses':
        return renderAISettings()
      case 'business-profile':
        return renderBusinessSettings()
      case 'integrations':
        return renderIntegrationsSettings()
      case 'security':
        return renderSecuritySettings()
      default:
        return renderAISettings()
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Settings & Configuration</h1>
            <p className="text-muted-foreground mt-2">
              Customize your YarnMarket AI experience and business settings
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {settingSections.map((section) => {
                    const Icon = section.icon
                    const isActive = activeSection === section.id
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-primary-foreground/10' : 'bg-muted'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{section.title}</p>
                        </div>
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {renderSection()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
