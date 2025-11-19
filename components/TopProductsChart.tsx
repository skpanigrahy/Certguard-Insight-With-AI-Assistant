import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Theme } from '../App';

interface TopProductsChartProps {
    data: { name: string; value: number }[];
    theme: Theme;
    onBarClick: (data: any) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-light-secondary dark:bg-secondary border border-light-highlight dark:border-highlight rounded-md shadow-lg">
          <p className="label text-sm font-bold">{label}</p>
          <p className="intro text-sm text-accent">Count: {payload[0].value}</p>
        </div>
      );
    }
    return null;
};

const TopProductsChart: React.FC<TopProductsChartProps> = ({ data, theme, onBarClick }) => {
    const isDark = theme === 'dark';
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    const textColor = isDark ? '#cbd5e1' : '#475569';
    const tooltipCursor = isDark ? 'rgba(45, 55, 72, 0.5)' : 'rgba(241, 245, 249, 0.8)';

    const handleClick = (data: any) => {
        if (onBarClick) {
            onBarClick(data);
        }
    };

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{
                        top: 5,
                        right: 20,
                        left: 10,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                    <XAxis type="number" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} width={80} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: tooltipCursor }} />
                    <Bar 
                        dataKey="value" 
                        name="Certificate Count" 
                        fill="#38bdf8" 
                        radius={[0, 4, 4, 0]} 
                        maxBarSize={20}
                        onClick={handleClick} 
                        cursor="pointer"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TopProductsChart;