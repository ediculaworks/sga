import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Componente StatsCard
 *
 * Card reutilizável para exibir estatísticas no dashboard.
 * Suporta ícones, valores, descrições e indicadores de tendência.
 */

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  onClick?: () => void;
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'text-blue-600',
  trend,
  onClick,
  loading = false,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        onClick && 'cursor-pointer hover:border-blue-300'
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {Icon && <Icon className={cn('h-5 w-5', iconColor)} />}
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-gray-900">{value}</div>

            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}

            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
                {trend.label && (
                  <span className="text-sm text-gray-500 ml-1">{trend.label}</span>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
