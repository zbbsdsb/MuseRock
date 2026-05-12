import React, { useMemo } from 'react';
import { 
  FileText, 
  Type, 
  Calendar, 
  Download, 
  Clock, 
  TrendingUp 
} from 'lucide-react';
import { Project } from '../../types/project';

interface StatsCardProps {
  icon: typeof FileText;
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
}

export function StatsCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  color 
}: StatsCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-brand-paper border border-brand-border">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon size={18} className="text-white" />
        </div>
        {subtitle && (
          <span className="text-xs font-medium text-brand-black/40">
            {subtitle}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-serif italic text-brand-black mb-1">
          {value}
        </p>
        <p className="text-xs text-brand-black/50">{title}</p>
      </div>
    </div>
  );
}

interface ProjectStatisticsProps {
  project: Project;
}

export default function ProjectStatistics({ project }: ProjectStatisticsProps) {
  const stats = useMemo(() => {
    let wordCount = 0;
    let charCount = 0;
    
    project.elements.forEach(el => {
      if (el.content) {
        charCount += el.content.length;
        wordCount += el.content.trim().split(/\s+/).filter(w => w.length > 0).length;
      }
    });
    
    const elementCounts: Record<string, number> = {};
    project.elements.forEach(el => {
      elementCounts[el.type] = (elementCounts[el.type] || 0) + 1;
    });
    
    const lastEdit = project.metadata.lastEditAt || project.updatedAt;
    const lastEditString = formatDate(lastEdit);
    
    return {
      wordCount,
      charCount,
      elementCount: project.elements.length,
      elementCounts,
      noteCount: project.notes.length,
      exportCount: project.metadata.exportCount || 0,
      lastEditString,
      createdAt: formatDate(project.metadata.createdAt || project.createdAt),
      version: project.metadata.version || 1
    };
  }, [project]);
  
  const recentActivity = [
    { 
      action: 'Project created', 
      time: formatDate(project.createdAt), 
      icon: FileText 
    },
    { 
      action: 'Last edited', 
      time: stats.lastEditString, 
      icon: TrendingUp 
    }
  ];
  
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h2 className="text-xl font-serif italic text-brand-black mb-1">
          Project Statistics
        </h2>
        <p className="text-sm text-brand-black/50">
          Overview of your project activity and content
        </p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatsCard
          icon={Type}
          title="Total Words"
          value={stats.wordCount.toLocaleString()}
          color="bg-violet-500"
        />
        <StatsCard
          icon={FileText}
          title="Characters"
          value={stats.charCount.toLocaleString()}
          color="bg-blue-500"
        />
        <StatsCard
          icon={FileText}
          title="Elements"
          value={stats.elementCount}
          color="bg-green-500"
        />
        <StatsCard
          icon={Download}
          title="Exports"
          value={stats.exportCount}
          color="bg-orange-500"
        />
        <StatsCard
          icon={Clock}
          title="Version"
          value={`v${stats.version}`}
          color="bg-purple-500"
        />
        <StatsCard
          icon={Calendar}
          title="Created"
          value={stats.createdAt}
          color="bg-pink-500"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-brand-paper border border-brand-border">
          <h3 className="text-sm font-serif italic text-brand-black mb-4">
            Element Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.elementCounts).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-brand-black/70 capitalize">
                  {type}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 rounded-full bg-brand-offwhite overflow-hidden">
                    <div 
                      className="h-full bg-violet-500 rounded-full"
                      style={{ 
                        width: `${(count / stats.elementCount) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-brand-black/60">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-5 rounded-2xl bg-brand-paper border border-brand-border">
          <h3 className="text-sm font-serif italic text-brand-black mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.map((activity, i) => {
              const Icon = activity.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-offwhite flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-brand-black/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-brand-black">{activity.action}</p>
                    <p className="text-xs text-brand-black/40">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-5 rounded-2xl bg-violet-500/10 border border-violet-500/30">
        <p className="text-sm text-violet-700">
          <strong>Tip:</strong> Export your project regularly to back up your work
        </p>
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}