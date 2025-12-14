'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Save,
  RefreshCw,
  Bell,
  Shield,
  Database,
  Settings as SettingsIcon,
  Mail,
  Phone,
  Globe,
  Key,
  Server,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { settingsApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';

interface DashboardSettings {
  notifications: {
    email_alerts: boolean;
    webhook_failures: boolean;
    new_merchants: boolean;
    daily_reports: boolean;
  };
  api: {
    rate_limit: number;
    timeout: number;
    retry_attempts: number;
  };
  email: {
    smtp_host: string;
    smtp_port: number;
    smtp_user: string;
    smtp_password: string;
    from_email: string;
  };
  whatsapp: {
    webhook_url: string;
    verify_token: string;
    access_token: string;
  };
  general: {
    dashboard_title: string;
    timezone: string;
    language: string;
    theme: string;
  };
}

const defaultSettings: DashboardSettings = {
  notifications: {
    email_alerts: true,
    webhook_failures: true,
    new_merchants: true,
    daily_reports: false,
  },
  api: {
    rate_limit: 100,
    timeout: 30,
    retry_attempts: 3,
  },
  email: {
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    from_email: '',
  },
  whatsapp: {
    webhook_url: '',
    verify_token: '',
    access_token: '',
  },
  general: {
    dashboard_title: 'YarnMarket AI Dashboard',
    timezone: 'Africa/Lagos',
    language: 'en',
    theme: 'dark',
  },
};

const SettingsSection: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, description, icon, children }) => {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-start space-x-3 mb-6">
        <div className="bg-slate-700 rounded-lg p-2">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
};

const FormField: React.FC<{
  label: string;
  type?: string;
  value: string | number | boolean;
  onChange: (value: any) => void;
  placeholder?: string;
  options?: { value: string; label: string }[];
  sensitive?: boolean;
}> = ({ label, type = 'text', value, onChange, placeholder, options, sensitive }) => {
  if (type === 'select' && options) {
    return (
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
        <select
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (type === 'boolean') {
    return (
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={value as boolean}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 text-green-600 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
        />
        <label className="text-sm font-medium text-slate-300">
          {label}
        </label>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
        {sensitive && (
          <span className="ml-1 text-yellow-400">
            <Key className="inline h-3 w-3" />
          </span>
        )}
      </label>
      <input
        type={sensitive ? 'password' : type}
        value={value as string | number}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </div>
  );
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<DashboardSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState('general');
  const { theme, setTheme } = useTheme();
  
  const queryClient = useQueryClient();
  
  // Sync theme from context to settings
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        theme: theme
      }
    }));
  }, [theme]);
  
  // Update theme context when settings change
  const handleThemeChange = (newTheme: string) => {
    updateSetting('general', 'theme', newTheme);
    setTheme(newTheme as 'dark' | 'light' | 'auto');
  };

  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    onSuccess: (data) => {
      if (data) {
        setSettings({ ...defaultSettings, ...data });
      }
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save settings');
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: settingsApi.testConnection,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Connection test successful');
      } else {
        toast.error(`Connection test failed: ${result.error}`);
      }
    },
    onError: () => {
      toast.error('Connection test failed');
    },
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleTestConnection = (type: 'email' | 'whatsapp') => {
    testConnectionMutation.mutate({ type, settings: settings[type] });
  };

  const updateSetting = (section: keyof DashboardSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <SettingsIcon className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'api', label: 'API', icon: <Server className="h-4 w-4" /> },
    { id: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <Phone className="h-4 w-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-600 rounded w-1/3"></div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400">Configure dashboard preferences and integrations</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={saveSettingsMutation.isPending}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {saveSettingsMutation.isPending ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </button>
      </div>

      <div className="flex space-x-6">
        {/* Tabs */}
        <div className="w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white border border-slate-600'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'general' && (
            <SettingsSection
              title="General Settings"
              description="Basic dashboard configuration"
              icon={<SettingsIcon className="h-5 w-5 text-slate-300" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Dashboard Title"
                  value={settings.general.dashboard_title}
                  onChange={(value) => updateSetting('general', 'dashboard_title', value)}
                />
                <FormField
                  label="Timezone"
                  type="select"
                  value={settings.general.timezone}
                  onChange={(value) => updateSetting('general', 'timezone', value)}
                  options={[
                    { value: 'Africa/Lagos', label: 'Africa/Lagos (WAT)' },
                    { value: 'UTC', label: 'UTC' },
                    { value: 'America/New_York', label: 'America/New_York (EST)' },
                    { value: 'Europe/London', label: 'Europe/London (GMT)' },
                  ]}
                />
                <FormField
                  label="Language"
                  type="select"
                  value={settings.general.language}
                  onChange={(value) => updateSetting('general', 'language', value)}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'yo', label: 'Yoruba' },
                    { value: 'ig', label: 'Igbo' },
                    { value: 'ha', label: 'Hausa' },
                  ]}
                />
                <FormField
                  label="Theme"
                  type="select"
                  value={settings.general.theme}
                  onChange={(value) => handleThemeChange(value)}
                  options={[
                    { value: 'dark', label: 'Dark' },
                    { value: 'light', label: 'Light' },
                    { value: 'auto', label: 'Auto' },
                  ]}
                />
              </div>
            </SettingsSection>
          )}

          {activeTab === 'notifications' && (
            <SettingsSection
              title="Notification Settings"
              description="Configure when and how you receive notifications"
              icon={<Bell className="h-5 w-5 text-slate-300" />}
            >
              <div className="space-y-4">
                <FormField
                  label="Email alerts for critical events"
                  type="boolean"
                  value={settings.notifications.email_alerts}
                  onChange={(value) => updateSetting('notifications', 'email_alerts', value)}
                />
                <FormField
                  label="Webhook failure notifications"
                  type="boolean"
                  value={settings.notifications.webhook_failures}
                  onChange={(value) => updateSetting('notifications', 'webhook_failures', value)}
                />
                <FormField
                  label="New merchant registration alerts"
                  type="boolean"
                  value={settings.notifications.new_merchants}
                  onChange={(value) => updateSetting('notifications', 'new_merchants', value)}
                />
                <FormField
                  label="Daily summary reports"
                  type="boolean"
                  value={settings.notifications.daily_reports}
                  onChange={(value) => updateSetting('notifications', 'daily_reports', value)}
                />
              </div>
            </SettingsSection>
          )}

          {activeTab === 'api' && (
            <SettingsSection
              title="API Configuration"
              description="Configure API limits and behavior"
              icon={<Server className="h-5 w-5 text-slate-300" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Rate Limit (req/min)"
                  type="number"
                  value={settings.api.rate_limit}
                  onChange={(value) => updateSetting('api', 'rate_limit', value)}
                />
                <FormField
                  label="Timeout (seconds)"
                  type="number"
                  value={settings.api.timeout}
                  onChange={(value) => updateSetting('api', 'timeout', value)}
                />
                <FormField
                  label="Retry Attempts"
                  type="number"
                  value={settings.api.retry_attempts}
                  onChange={(value) => updateSetting('api', 'retry_attempts', value)}
                />
              </div>
            </SettingsSection>
          )}

          {activeTab === 'email' && (
            <SettingsSection
              title="Email Configuration"
              description="Configure SMTP settings for email notifications"
              icon={<Mail className="h-5 w-5 text-slate-300" />}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="SMTP Host"
                    value={settings.email.smtp_host}
                    onChange={(value) => updateSetting('email', 'smtp_host', value)}
                    placeholder="smtp.gmail.com"
                  />
                  <FormField
                    label="SMTP Port"
                    type="number"
                    value={settings.email.smtp_port}
                    onChange={(value) => updateSetting('email', 'smtp_port', value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="SMTP User"
                    value={settings.email.smtp_user}
                    onChange={(value) => updateSetting('email', 'smtp_user', value)}
                  />
                  <FormField
                    label="SMTP Password"
                    value={settings.email.smtp_password}
                    onChange={(value) => updateSetting('email', 'smtp_password', value)}
                    sensitive
                  />
                </div>
                <FormField
                  label="From Email"
                  value={settings.email.from_email}
                  onChange={(value) => updateSetting('email', 'from_email', value)}
                  placeholder="noreply@yarnmarket.ai"
                />
                <div className="pt-4">
                  <button
                    onClick={() => handleTestConnection('email')}
                    disabled={testConnectionMutation.isPending}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {testConnectionMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Test Connection
                  </button>
                </div>
              </div>
            </SettingsSection>
          )}

          {activeTab === 'whatsapp' && (
            <SettingsSection
              title="WhatsApp Configuration"
              description="Configure WhatsApp Business API settings"
              icon={<Phone className="h-5 w-5 text-slate-300" />}
            >
              <div className="space-y-4">
                <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-yellow-200 text-sm font-medium">Sensitive Information</p>
                    <p className="text-yellow-300/80 text-sm mt-1">
                      These credentials are securely stored and encrypted. Only change them if you need to update your WhatsApp Business API configuration.
                    </p>
                  </div>
                </div>
                
                <FormField
                  label="Webhook URL"
                  value={settings.whatsapp.webhook_url}
                  onChange={(value) => updateSetting('whatsapp', 'webhook_url', value)}
                  placeholder="https://your-domain.com/webhook"
                />
                <FormField
                  label="Verify Token"
                  value={settings.whatsapp.verify_token}
                  onChange={(value) => updateSetting('whatsapp', 'verify_token', value)}
                  sensitive
                />
                <FormField
                  label="Access Token"
                  value={settings.whatsapp.access_token}
                  onChange={(value) => updateSetting('whatsapp', 'access_token', value)}
                  sensitive
                />
                
                <div className="pt-4">
                  <button
                    onClick={() => handleTestConnection('whatsapp')}
                    disabled={testConnectionMutation.isPending}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {testConnectionMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Test Connection
                  </button>
                </div>
              </div>
            </SettingsSection>
          )}
        </div>
      </div>
    </div>
  );
}
