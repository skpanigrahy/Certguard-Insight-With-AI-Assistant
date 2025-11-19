import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Theme } from '../App';

interface ExpiryChartProps {
    data: { name: string; expiring: number }[];
    theme: Theme;
    onBarClick: (data: any) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-light-secondary dark:bg-secondary border border-light-highlight dark:border-highlight rounded-md shadow-lg">
          <p className="label text-sm font-bold">{`${label}`}</p>
          <p className="intro text-sm text-purple-400">{`Expiring : ${payload[0].value}`}</p>
        </div>
      );
    }
  
    return null;
};

const ExpiryChart: React.FC<ExpiryChartProps> = ({ data, theme, onBarClick }) => {
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
                    data={data}
                    margin={{
                        top: 5,
                        right: 20,
                        left: -10,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: tooltipCursor }}
                    />
                    <Bar 
                        dataKey="expiring" 
                        name="Expiring Certificates" 
                        fill="#8b5cf6" 
                        radius={[4, 4, 0, 0]} 
                        maxBarSize={50} 
                        onClick={handleClick}
                        cursor="pointer"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ExpiryChart;