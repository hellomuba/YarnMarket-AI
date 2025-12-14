import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  gradient = false,
  onClick
}) => {
  const baseClasses = `
    rounded-xl shadow-lg border transition-all duration-200
    ${hover ? 'cursor-pointer' : ''}
    ${gradient ? 'gradient-mesh animate-gradient' : 'glass'}
    ${className}
  `;

  const MotionCard = motion.div;

  return (
    <MotionCard
      className={baseClasses}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02, y: -2 } : {}}
      whileTap={hover ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </MotionCard>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`p-6 pb-2 ${className}`}>
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`p-6 pt-2 ${className}`}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`p-6 pt-2 border-t border-slate-700/50 ${className}`}>
      {children}
    </div>
  );
};
