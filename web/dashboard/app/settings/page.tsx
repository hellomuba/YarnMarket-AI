'use client'

import React, { useState, useEffect } from 'react'
import { Settings as SettingsIcon, MessageSquare, Globe, Shield, Bell, Zap, Users, Store, Bot, Save, RefreshCw, Eye, EyeOff, ChevronRight, Check, X } from 'lucide-react'

// Icons Component
const Icons = {
  Settings: () => <SettingsIcon className="w-5 h-5" />,
  Message: () => <MessageSquare className="w-5 h-5" />,
  Globe: () => <Globe className="w-5 h-5" />,
  Shield: () => <Shield className="w-5 h-5" />,
  Bell: () => <Bell className="w-5 h-5" />,
  Zap: () => <Zap className="w-5 h-5" />,
  Users: () => <Users className="w-5 h-5" />,
  Store: () => <Store className="w-5 h-5" />,
  Bot: () => <Bot className="w-5 h-5" />,
  Save: () => <Save className="w-5 h-5" />,
  Refresh: () => <RefreshCw className="w-5 h-5" />,
  Eye: () => <Eye className="w-5 h-5" />,
  EyeOff: () => <EyeOff className="w-5 h-5" />,
  ChevronRight: () => <ChevronRight className="w-5 h-5" />,
  Check: () => <Check className="w-5 h-5" />,
  X: () => <X className="w-5 h-5" />
}

interface SettingsSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

const settingSections: SettingsSection[] = [
  {
    id: 'ai-responses',
    title: 'AI Response Configuration',
    description: 'Configure how the AI responds to customers in different Nigerian languages',
    icon: <Icons.Bot />,
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'business-profile',
    title: 'Business Profile',
    description: 'Your store information, contact details, and branding',
    icon: <Icons.Store />,
    color: 'from-emerald-500 to-green-600'
  },
  {
    id: 'languages',
    title: 'Language & Localization',
    description: 'Configure supported languages and cultural preferences',
    icon: <Icons.Globe />,
    color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Manage alerts, webhooks, and communication preferences',
    icon: <Icons.Bell />,
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect with WhatsApp, Instagram, SMS, and payment providers',
    icon: <Icons.Zap />,
    color: 'from-rose-500 to-pink-600'
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    description: 'API keys, access controls, and data protection settings',
    icon: <Icons.Shield />,
    color: 'from-gray-500 to-slate-600'
  }
]

const ToggleSwitch = ({ enabled, onChange, disabled = false }: { enabled: boolean; onChange: (enabled: boolean) => void; disabled?: boolean }) => (
  <button
    onClick={() => !disabled && onChange(!enabled)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
      enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
)

const SettingCard = ({ 
  title, 
  description, 
  children, 
  icon,
  color = 'from-gray-500 to-gray-600'
}: {
  title: string
  description?: string
  children: React.ReactNode
  icon?: React.ReactNode
  color?: string
}) => (
  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-6 relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-32 h-32 opacity-5 dark:opacity-10">
      <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-blue-400 rounded-full transform rotate-12 scale-150"></div>
    </div>
    
    <div className="relative">
      <div className="flex items-center space-x-4 mb-4">
        {icon && (
          <div className={`p-3 rounded-2xl bg-gradient-to-r ${color} text-white shadow-lg`}>
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white brand-font">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  </div>
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
      <SettingCard 
        title="Response Personality" 
        description="How the AI should communicate with customers"
        icon={<Icons.Bot />}
        color="from-purple-500 to-indigo-600"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Response Style</label>
            <select 
              value={settings.ai.responseStyle}
              onChange={(e) => updateSetting('ai', 'responseStyle', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="professional">Professional & Formal</option>
              <option value="friendly">Friendly & Casual</option>
              <option value="enthusiastic">Enthusiastic & Energetic</option>
              <option value="helpful">Helpful & Supportive</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Use Nigerian Slang & Expressions</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Include local expressions and cultural context</p>
            </div>
            <ToggleSwitch 
              enabled={settings.ai.useNigerianSlang}
              onChange={(value) => updateSetting('ai', 'useNigerianSlang', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Auto-Negotiation</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Allow AI to negotiate prices within set limits</p>
            </div>
            <ToggleSwitch 
              enabled={settings.ai.autoNegotiation}
              onChange={(value) => updateSetting('ai', 'autoNegotiation', value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confidence Threshold</label>
            <div className="flex items-center space-x-4">
              <input 
                type="range"
                min="0"
                max="100"
                value={settings.ai.confidenceThreshold}
                onChange={(e) => updateSetting('ai', 'confidenceThreshold', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[3rem]">
                {settings.ai.confidenceThreshold}%
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Below this threshold, conversations will be escalated to human agents
            </p>
          </div>
        </div>
      </SettingCard>
    </div>
  )

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      <SettingCard 
        title="Store Information" 
        description="Your business details and contact information"
        icon={<Icons.Store />}
        color="from-emerald-500 to-green-600"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Business Name</label>
            <input 
              type="text"
              value={settings.business.name}
              onChange={(e) => updateSetting('business', 'name', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
            <input 
              type="text"
              value={settings.business.phone}
              onChange={(e) => updateSetting('business', 'phone', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea 
              value={settings.business.description}
              onChange={(e) => updateSetting('business', 'description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input 
              type="email"
              value={settings.business.email}
              onChange={(e) => updateSetting('business', 'email', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Currency</label>
            <select 
              value={settings.business.currency}
              onChange={(e) => updateSetting('business', 'currency', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="NGN">🇳🇬 Nigerian Naira (₦)</option>
              <option value="USD">🇺🇸 US Dollar ($)</option>
              <option value="EUR">🇪🇺 Euro (€)</option>
            </select>
          </div>
        </div>
      </SettingCard>
    </div>
  )

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <SettingCard 
        title="Communication Channels" 
        description="Connect your messaging platforms"
        icon={<Icons.Zap />}
        color="from-rose-500 to-pink-600"
      >
        <div className="space-y-6">
          {Object.entries(settings.integrations).map(([key, integration]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  key === 'whatsapp' ? 'bg-green-500' :
                  key === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                  key === 'sms' ? 'bg-blue-500' :
                  'bg-emerald-500'
                }`}>
                  {key === 'whatsapp' ? '📱' : 
                   key === 'instagram' ? '📸' :
                   key === 'sms' ? '💬' : '💳'}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white capitalize">
                    {key === 'whatsapp' ? 'WhatsApp Business' :
                     key === 'instagram' ? 'Instagram DMs' :
                     key === 'sms' ? 'SMS Gateway' :
                     'Payment Gateway'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {integration.connected ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                        <Icons.Check />
                        <span>Connected</span>
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 flex items-center space-x-1">
                        <Icons.X />
                        <span>Not Connected</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <ToggleSwitch 
                  enabled={integration.enabled}
                  onChange={(value) => updateSetting('integrations', key, { ...integration, enabled: value })}
                />
                <button className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                  {integration.connected ? 'Reconfigure' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </SettingCard>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <SettingCard 
        title="API Configuration" 
        description="Manage your API keys and security settings"
        icon={<Icons.Shield />}
        color="from-gray-500 to-slate-600"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">API Key</label>
            <div className="flex items-center space-x-2">
              <input 
                type={showApiKey ? 'text' : 'password'}
                value={settings.security.apiKey}
                readOnly
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                {showApiKey ? <Icons.EyeOff /> : <Icons.Eye />}
              </button>
              <button className="px-4 py-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">
                Regenerate
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Session Timeout (hours)</label>
            <select 
              value={settings.security.sessionTimeout}
              onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value={1}>1 hour</option>
              <option value={8}>8 hours</option>
              <option value={24}>24 hours</option>
              <option value={168}>1 week</option>
            </select>
          </div>
        </div>
      </SettingCard>
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
    <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-emerald-950/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 pt-32">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white brand-font flex items-center space-x-3">
                <span>⚙️</span>
                <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Settings & Configuration
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                Customize your YarnMarket AI experience and business settings
              </p>
            </div>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-emerald-500 via-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Icons.Refresh className="animate-spin" /> : <Icons.Save />}
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-6 sticky top-32">
              <h2 className="text-xl font-black text-gray-900 dark:text-white brand-font mb-6">Configuration Menu</h2>
              <nav className="space-y-2">
                {settingSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all duration-300 group ${
                      activeSection === section.id
                        ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl transition-all duration-300 ${
                        activeSection === section.id 
                          ? 'bg-white/20' 
                          : 'bg-gray-100 dark:bg-gray-600 group-hover:bg-gray-200 dark:group-hover:bg-gray-500'
                      }`}>
                        {section.icon}
                      </div>
                      <div>
                        <p className="font-semibold">{section.title}</p>
                        <p className={`text-xs ${
                          activeSection === section.id 
                            ? 'text-white/80' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {section.description.split('.')[0]}...
                        </p>
                      </div>
                    </div>
                    <Icons.ChevronRight className={`transition-transform duration-300 ${
                      activeSection === section.id ? 'rotate-90' : 'group-hover:translate-x-1'
                    }`} />
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {renderSection()}
          </div>
        </div>
        
      </div>
    </div>
  )
}
