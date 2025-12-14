'use client'

import React, { useState, useEffect } from 'react'
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
import {
  initializeFacebookSDK,
  launchWhatsAppSignup,
  getWhatsAppStatus,
  disconnectWhatsApp
} from '@/lib/whatsapp-signup'
import type { WhatsAppSignupResult } from '@/lib/whatsapp-signup'

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

  // WhatsApp connection state
  const [whatsappStatus, setWhatsappStatus] = useState({
    connected: false,
    loading: true,
    phone_number: null as string | null,
    verified_name: null as string | null,
    quality_rating: null as string | null
  })
  const [connectingWhatsApp, setConnectingWhatsApp] = useState(false)

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

  // Initialize Facebook SDK on mount
  useEffect(() => {
    const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID

    if (metaAppId) {
      initializeFacebookSDK(metaAppId)
        .then(() => console.log('✅ Facebook SDK initialized'))
        .catch(err => console.error('Failed to initialize Facebook SDK:', err))
    }
  }, [])

  // Load WhatsApp connection status on mount
  useEffect(() => {
    loadWhatsAppStatus()
  }, [])

  async function loadWhatsAppStatus() {
    try {
      const merchantId = 'MERCHANT-001' // TODO: Get from auth context
      const status = await getWhatsAppStatus(merchantId)

      setWhatsappStatus({
        connected: status.connected,
        loading: false,
        phone_number: status.phone_number,
        verified_name: status.verified_name,
        quality_rating: status.quality_rating
      })
    } catch (error) {
      console.error('Error loading WhatsApp status:', error)
      setWhatsappStatus(prev => ({ ...prev, loading: false }))
    }
  }

  function handleConnectWhatsApp() {
    setConnectingWhatsApp(true)

    const merchantId = 'MERCHANT-001' // TODO: Get from auth context
    const businessName = settings.business.name

    launchWhatsAppSignup({
      merchantId,
      businessName,
      onSuccess: (data: WhatsAppSignupResult) => {
        console.log('WhatsApp connected successfully:', data)

        setWhatsappStatus({
          connected: true,
          loading: false,
          phone_number: data.phone_number,
          verified_name: data.verified_name,
          quality_rating: data.quality_rating
        })

        setConnectingWhatsApp(false)

        // Show success message
        alert(`WhatsApp connected successfully!\nPhone: ${data.phone_number}\nVerified as: ${data.verified_name}`)
      },
      onError: (error: string) => {
        console.error('WhatsApp connection failed:', error)
        setConnectingWhatsApp(false)
        alert(`Failed to connect WhatsApp: ${error}`)
      }
    })
  }

  async function handleDisconnectWhatsApp() {
    if (!confirm('Are you sure you want to disconnect WhatsApp? You will stop receiving customer messages.')) {
      return
    }

    try {
      const merchantId = 'MERCHANT-001' // TODO: Get from auth context
      await disconnectWhatsApp(merchantId)

      setWhatsappStatus({
        connected: false,
        loading: false,
        phone_number: null,
        verified_name: null,
        quality_rating: null
      })

      alert('WhatsApp disconnected successfully')
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error)
      alert('Failed to disconnect WhatsApp. Please try again.')
    }
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
      {/* WhatsApp Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>WhatsApp Business</CardTitle>
              <CardDescription>Connect your WhatsApp number to receive customer messages</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {whatsappStatus.loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : whatsappStatus.connected ? (
            <div className="space-y-4">
              {/* Connected Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="font-semibold text-primary text-sm">WA</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">WhatsApp Connected</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <Check className="h-3 w-3 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {whatsappStatus.phone_number}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="default">Active</Badge>
              </div>

              {/* Connection Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Verified Name</label>
                  <p className="text-sm font-semibold mt-1">{whatsappStatus.verified_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Quality Rating</label>
                  <p className="text-sm font-semibold mt-1">
                    <Badge variant={
                      whatsappStatus.quality_rating === 'GREEN' ? 'default' :
                      whatsappStatus.quality_rating === 'YELLOW' ? 'secondary' : 'secondary'
                    }>
                      {whatsappStatus.quality_rating || 'UNKNOWN'}
                    </Badge>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={loadWhatsAppStatus}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDisconnectWhatsApp}>
                  Disconnect WhatsApp
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Not Connected */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <span className="font-semibold text-muted-foreground text-sm">WA</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">WhatsApp Business</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <X className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Not Connected</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Setup Instructions */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Setup Instructions</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Click "Connect WhatsApp Business" below</li>
                  <li>Log in with your Facebook account (if not already logged in)</li>
                  <li>Select or create a WhatsApp Business Account</li>
                  <li>Choose your WhatsApp phone number</li>
                  <li>Authorize YarnMarket AI to manage messages</li>
                </ol>
              </div>

              {/* Connect Button */}
              <Button
                onClick={handleConnectWhatsApp}
                disabled={connectingWhatsApp}
                className="w-full gap-2"
              >
                {connectingWhatsApp ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Connect WhatsApp Business
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other Integrations (Coming Soon) */}
      <Card>
        <CardHeader>
          <CardTitle>Other Channels</CardTitle>
          <CardDescription>Additional messaging platforms (coming soon)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {['Instagram DMs', 'SMS Gateway', 'Payment Gateway'].map((channel) => (
            <div key={channel} className="flex items-center justify-between p-4 border rounded-lg opacity-60">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <span className="font-semibold text-muted-foreground text-sm">
                    {channel.substring(0, 3).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold">{channel}</h4>
                  <p className="text-sm text-muted-foreground">Coming Soon</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
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
