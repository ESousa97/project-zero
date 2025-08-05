import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  trend?: string;
  trendDirection?: 'up' | 'down';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendDirection = 'up',
}) => {
  // Mapeia cores para gradientes, ícones e bordas de acordo com o tema
  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      icon: 'text-blue-400',
      border: 'border-blue-500/20',
    },
    green: {
      bg: 'from-green-500 to-green-600',
      icon: 'text-green-400',
      border: 'border-green-500/20',
    },
    yellow: {
      bg: 'from-yellow-500 to-yellow-600',
      icon: 'text-yellow-400',
      border: 'border-yellow-500/20',
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      icon: 'text-purple-400',
      border: 'border-purple-500/20',
    },
    red: {
      bg: 'from-red-500 to-red-600',
      icon: 'text-red-400',
      border: 'border-red-500/20',
    },
  };

  // Formata valores grandes para abreviação (ex: 1500 => 1.5K, 1500000 => 1.5M)
  const formatValue = (val: number): string => {
    if (val >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toString();
  };

  return (
    <div
      className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border ${colorClasses[color].border} hover:shadow-lg hover:shadow-${color}-500/10 transition-all duration-300 group`}
    >
      <div className="flex items-center justify-between">
        {/* Texto e tendência */}
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-2">{formatValue(value)}</p>
          {trend && (
            <div
              className={`flex items-center space-x-1 ${
                trendDirection === 'up' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {trendDirection === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{trend}</span>
            </div>
          )}
        </div>

        {/* Ícone colorido com efeito hover */}
        <div
          className={`p-3 bg-gradient-to-r ${colorClasses[color].bg} rounded-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
