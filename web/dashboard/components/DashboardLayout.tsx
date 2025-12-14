'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Menu, X, LayoutDashboard, MessageSquare, Package, BarChart3, Settings, Bell
} from 'lucide-react'

const sidebarNavItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Conversations', icon: MessageSquare, href: '/conversations' },
  { name: 'Products', icon: Package, href: '/products' },
  { name: 'Analytics', icon: BarChart3, href: '/analytics' },
  { name: 'Settings', icon: Settings, href: '/settings' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 lg:translate-x-0`}>
          {/* Logo */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xl">
                  🇳🇬
                </div>
                <div>
                  <h1 className="text-lg font-bold">YarnMarket AI</h1>
                  <p className="text-xs text-muted-foreground">Nigerian Commerce</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center justify-between px-3 py-2 bg-muted rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="font-medium">Lagos Time</span>
              </div>
              <span className="font-mono font-semibold">
                {currentTime.toLocaleTimeString('en-NG', {
                  timeZone: 'Africa/Lagos',
                  hour12: true,
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </a>
              )
            })}
          </nav>

          {/* Status */}
          <div className="absolute bottom-6 left-4 right-4">
            <Card className={isConnected ? 'border-primary/20 bg-primary/5' : 'border-yellow-500/20 bg-yellow-500/5'}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-primary' : 'bg-yellow-500'} animate-pulse`}></div>
                  <span className="text-sm font-semibold">
                    {isConnected ? 'Live System' : 'Demo Mode'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isConnected ? 'All services operational' : 'Using sample data'}
                </p>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex items-center justify-between h-16 px-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex-1"></div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  <span className="text-lg">{darkMode ? '☀️' : '🌙'}</span>
                </Button>

                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
                </Button>

                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-semibold">
                  <span>U</span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main>{children}</main>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm"></div>
          </div>
        )}
      </div>
    </div>
  )
}
