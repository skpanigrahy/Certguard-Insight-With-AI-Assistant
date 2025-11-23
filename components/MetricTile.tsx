
import React from 'react';

interface MetricTileProps {
    title: string;
    value: number | string;
    trend?: number; // percentage
    trendLabel?: string;
    icon?: React.ReactNode;
}

const MetricTile: React.FC<MetricTileProps> = ({ title, value, trend, trendLabel = "24 hours", icon }) => {
    const isPositive = trend && trend > 0;
    const isNeutral = !trend || trend === 0;

    return (
        <div className="card p-5 flex flex-col justify-between h-full relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-bold text-secondary uppercase tracking-wider">{title}</h4>
                {icon && <div className="text-accent opacity-80">{icon}</div>}
            </div>
            <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-primary">{value}</span>
                {trend !== undefined && (
                    <div className={`flex items-center text-xs font-bold mb-1 ${isPositive ? 'text-success' : 'text-danger'}`}>
                        <span>{isPositive ? '↑' : '↓'} {Math.abs(trend)}%</span>
                        <span className="text-secondary ml-1 font-normal opacity-70">({trendLabel})</span>
                    </div>
                )}
            </div>
            {/* Decorative background element */}
            <div 
                className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 pointer-events-none"
                style={{ backgroundColor: 'currentColor' }}
            />
        </div>
    );
};

export default MetricTile;
