import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '../ui/Card';

interface StatData {
  current: number;
  target: number;
  trend: 'excellent' | 'good' | 'fair' | 'poor';
}

interface StatsCardProps {
  title: string;
  subtitle: string;
  data: {
    responseTime: StatData;
    accuracy: StatData;
    uptime: StatData;
    satisfaction: StatData;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  subtitle,
  data
}) => {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPercentage = (current: number, target: number, isReverse = false) => {
    if (isReverse) {
      // For metrics where lower is better (like response time)
      return Math.min((target / current) * 100, 100);
    }
    return Math.min((current / target) * 100, 100);
  };

  const formatValue = (key: string, value: number) => {
    switch (key) {
      case 'responseTime': return `${value}ms`;
      case 'uptime': return `${value}%`;
      case 'accuracy': return `${value}%`;
      case 'satisfaction': return `${value}/5.0`;
      default: return value.toString();
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(data).map(([key, stat], index) => {
            const isReverse = key === 'responseTime';
            const percentage = getPercentage(stat.current, stat.target, isReverse);
            
            return (
              <motion.div
                key={key}
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100">
                      {formatValue(key, stat.current)}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${getTrendColor(stat.trend)}`} />
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${getTrendColor(stat.trend)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                    />
                  </div>
                  
                  {/* Target indicator */}
                  <div 
                    className="absolute top-0 w-0.5 h-2 bg-slate-400"
                    style={{ left: isReverse ? '100%' : `${(stat.target / (stat.current > stat.target ? stat.current : stat.target)) * 100}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Target: {formatValue(key, stat.target)}</span>
                  <span className={`font-medium ${
                    stat.trend === 'excellent' ? 'text-green-400' :
                    stat.trend === 'good' ? 'text-blue-400' :
                    stat.trend === 'fair' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {stat.trend.toUpperCase()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Overall Score */}
        <motion.div
          className="mt-6 pt-6 border-t border-slate-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-100 mb-1">
              95.2%
            </div>
            <div className="text-xs text-slate-400">Overall Health Score</div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};
