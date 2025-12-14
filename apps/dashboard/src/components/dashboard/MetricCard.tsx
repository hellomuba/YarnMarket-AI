import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  gradient: string;
  description: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  gradient,
  description
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className={`flex items-center text-sm font-medium ${
                trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
              }`}>
                {trend === 'up' && <ArrowUpRight className="w-4 h-4 mr-1" />}
                {trend === 'down' && <ArrowDownRight className="w-4 h-4 mr-1" />}
                {change}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-400">{title}</h3>
            <p className="text-3xl font-bold text-slate-100">{value}</p>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
          
          {/* Animated background accent */}
          <motion.div
            className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${gradient}`}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};
