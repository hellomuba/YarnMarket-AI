import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
  color: string;
}

interface ActivityCardProps {
  title: string;
  subtitle: string;
  activities: Activity[];
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  subtitle,
  activities
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            
            return (
              <motion.div
                key={activity.id}
                className="flex items-start gap-3 p-3 glass-dark rounded-lg hover:bg-slate-800/30 transition-all"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className={`p-2 rounded-lg ${activity.color} flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-slate-200 mb-1">
                    {activity.title}
                  </h4>
                  <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                    {activity.description}
                  </p>
                  <p className="text-xs text-slate-500">
                    {activity.time}
                  </p>
                </div>
                
                {/* Activity pulse indicator */}
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                </div>
              </motion.div>
            );
          })}
          
          {activities.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
