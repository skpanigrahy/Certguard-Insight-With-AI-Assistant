import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Theme } from '../App';

interface StatusDistributionChartProps {
    data: { name: string; value: number }[];
    theme: Theme;
    onSegmentClick: (data: any) => void;
}

const COLORS: { [key: string]: string } = {
    'Valid': '#22c55e',
    'Expiring': '#f59e0b',
    'Expired': '#ef4444',
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-bold text-sm">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="p-2 bg-light-secondary dark:bg-secondary border border-light-highlight dark:border-highlight rounded-md shadow-lg">
                <p className="label text-sm font-bold" style={{ color: data.payload.fill }}>{`${data.name}`}</p>
                <p className="intro text-sm">{`Count: ${data.value}`}</p>
            </div>
        );
    }
    return null;
};

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ data, theme, onSegmentClick }) => {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#cbd5e1' : '#475569';

    const handleClick = (data: any) => {
        if (onSegmentClick) {
            onSegmentClick(data);
        }
    };

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        onClick={handleClick}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} cursor="pointer" />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ color: textColor, fontSize: '14px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StatusDistributionChart;