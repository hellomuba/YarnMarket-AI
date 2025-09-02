'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useState, useEffect } from 'react'

interface LayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊', gradient: 'from-emerald-500 to-teal-600' },
  { name: 'Conversations', href: '/conversations', icon: '💬', gradient: 'from-blue-500 to-cyan-600' },
  { name: 'Products', href: '/products', icon: '📦', gradient: 'from-purple-500 to-indigo-600' },
  { name: 'Analytics', href: '/analytics', icon: '📈', gradient: 'from-amber-500 to-orange-600' },
  { name: 'Settings', href: '/settings', icon: '⚙️', gradient: 'from-gray-500 to-slate-600' },
]

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname()
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    // Set initial time on mount
    setCurrentTime(new Date())

    // Update every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 relative overflow-x-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-r from-amber-400 to-red-400 rounded-full mix-blend-multiply filter blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      {/* Navigation */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? 'glass-card shadow-xl backdrop-blur-xl' : 'bg-white/80 backdrop-blur-sm border-b border-white/20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  🗣️
                </div>
                <div>
                  <h1 className="text-2xl font-bold brand-font gradient-text">YarnMarket AI</h1>
                  <p className="text-xs text-gray-600 font-medium">Conversational Commerce Platform</p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group relative flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive ? 'text-white shadow-lg' : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    {isActive && (
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-xl shadow-lg`}
                      ></div>
                    )}
                    <span className="relative text-lg">{item.icon}</span>
                    <span className="relative font-medium">{item.name}</span>

                    {/* Hover effect */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Time Display */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-white/20 rounded-lg">
                {currentTime && (
                  <span className="text-xs font-medium text-gray-600">
                    {currentTime.toLocaleTimeString('en-US', {
                      hour12: true,
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>

              {/* Connection Status */}
              <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full pulse-glow">
                <div className="relative">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="text-emerald-700 text-sm font-semibold">Live</span>
              </div>

              {/* User Avatar */}
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                👤
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10">
        <div className="animate-slide-up">{children}</div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 bg-white/30 backdrop-blur-sm border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Powered by YarnMarket AI</span>
              <span className="text-emerald-500">•</span>
              <span className="text-sm text-gray-600">🇳🇬 Made for Nigerian Markets</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>© 2024 YarnMarket AI</span>
              <span>•</span>
              <span>All rights reserved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
