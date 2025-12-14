'use client'

import { motion } from 'framer-motion'

interface LoadingStateProps {
  message?: string
  type?: 'default' | 'conversations' | 'analytics' | 'minimal'
}

export default function LoadingState({ message = "Loading...", type = 'default' }: LoadingStateProps) {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const dotVariants = {
    initial: { y: 0 },
    animate: {
      y: -20,
      transition: {
        duration: 0.6,
        yoyo: Infinity,
        ease: "easeInOut"
      }
    }
  }

  if (type === 'minimal') {
    return (
      <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-600 font-medium">{message}</span>
      </div>
    )
  }

  if (type === 'conversations') {
    return (
      <div className="metric-card p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <div className="text-2xl text-white">💬</div>
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 brand-font mb-2">Loading Conversations</h3>
        <p className="text-gray-600 text-sm mb-4">{message}</p>
        <motion.div
          className="flex justify-center space-x-2"
          variants={containerVariants}
          animate="animate"
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full"
              variants={dotVariants}
              initial="initial"
              animate="animate"
            />
          ))}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative mb-8">
        {/* Main logo container */}
        <motion.div
          className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl"
          animate={{
            scale: [1, 1.1, 1],
            rotateY: [0, 180, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <span className="text-3xl">🗣️</span>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center"
          animate={{
            y: [-5, 5, -5],
            rotate: [0, 360]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <span className="text-xs">🇳🇬</span>
        </motion.div>

        <motion.div
          className="absolute -bottom-1 -left-2 w-5 h-5 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center"
          animate={{
            y: [5, -5, 5],
            rotate: [360, 0]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          <span className="text-xs">✨</span>
        </motion.div>
      </div>

      <div className="text-center">
        <motion.h2
          className="text-2xl font-bold text-gray-900 brand-font mb-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          YarnMarket AI
        </motion.h2>
        <p className="text-gray-600 mb-6">{message}</p>
        
        {/* Loading dots */}
        <motion.div
          className="flex justify-center space-x-3"
          variants={containerVariants}
          animate="animate"
        >
          {[0, 1, 2, 3].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full"
              variants={dotVariants}
              initial="initial"
              animate="animate"
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
