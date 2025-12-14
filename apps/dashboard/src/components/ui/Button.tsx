import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  onClick,
  type = 'button'
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium
    transition-all duration-200 focus:outline-none focus:ring-2
    focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50
    disabled:cursor-not-allowed rounded-lg relative overflow-hidden
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
      text-white shadow-lg hover:shadow-blue-500/25 focus:ring-blue-500/50
      hover:scale-105 active:scale-95
    `,
    secondary: `
      glass hover:bg-white/10 text-slate-200 shadow-lg
      hover:shadow-white/10 focus:ring-white/20 hover:scale-105 active:scale-95
    `,
    outline: `
      border-2 border-slate-600 hover:border-slate-500 text-slate-200
      hover:bg-slate-800/50 focus:ring-slate-500/50 hover:scale-105 active:scale-95
    `,
    ghost: `
      text-slate-300 hover:text-slate-100 hover:bg-slate-800/50
      focus:ring-slate-500/50 hover:scale-105 active:scale-95
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800
      text-white shadow-lg hover:shadow-red-500/25 focus:ring-red-500/50
      hover:scale-105 active:scale-95
    `,
    success: `
      bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800
      text-white shadow-lg hover:shadow-green-500/25 focus:ring-green-500/50
      hover:scale-105 active:scale-95
    `
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
    xl: 'px-8 py-3 text-lg'
  };

  const MotionButton = motion.button;
  
  return (
    <MotionButton
      whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
    >
      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
      
      <span className="relative flex items-center gap-2">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          icon
        ) : null}
        {children}
      </span>
    </MotionButton>
  );
};
