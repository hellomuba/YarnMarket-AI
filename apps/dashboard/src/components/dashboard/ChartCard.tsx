import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '../ui/Card';

interface ChartCardProps {
  title: string;
  subtitle: string;
  data: any[];
  type: 'area' | 'bar' | 'pie' | 'line';
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  data,
  type
}) => {
  const renderChart = () => {
    if (type === 'pie') {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="relative w-48 h-48">
            {/* Simple pie chart visualization */}
            <div className="relative w-full h-full">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {data.map((item, index) => {
                  const percentage = item.value;
                  const offset = data.slice(0, index).reduce((acc, curr) => acc + curr.value, 0);
                  const circumference = 2 * Math.PI * 30;
                  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -((offset / 100) * circumference);

                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="30"
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth="20"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500"
                    />
                  );
                })}
              </svg>
            </div>
            
            {/* Legend */}
            <div className="absolute top-full left-0 right-0 mt-4">
              <div className="grid grid-cols-2 gap-2">
                {data.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-slate-400">
                      {item.name} ({item.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'area') {
      return (
        <div className="h-64 mt-4">
          {/* Simple area chart representation */}
          <div className="flex items-end justify-between h-full px-4 pb-4">
            {data.map((item, index) => (
              <motion.div
                key={item.name}
                className="flex flex-col items-center gap-2"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex flex-col items-center gap-1">
                  {/* Conversations bar */}
                  <motion.div
                    className="w-8 bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t"
                    style={{ height: `${(item.conversations / 2000) * 160}px` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.conversations / 2000) * 160}px` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                  {/* Responses bar */}
                  <motion.div
                    className="w-8 bg-gradient-to-t from-green-500 to-emerald-500 rounded-t"
                    style={{ height: `${(item.responses / 2000) * 160}px` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.responses / 2000) * 160}px` }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                  />
                </div>
                <span className="text-xs text-slate-400 rotate-0">{item.name}</span>
              </motion.div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-cyan-500" />
              <span className="text-xs text-slate-400">Conversations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-green-500 to-emerald-500" />
              <span className="text-xs text-slate-400">AI Responses</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        <p>Chart visualization placeholder</p>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};
