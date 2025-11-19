import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Theme } from '../App';

interface EnvironmentChartProps {
    data: { name: string; value: number }[];
    theme: Theme;
    onBarClick: (data: { name: string }) => void;
}

const COLORS: { [key: string]: string } = {
    'Development': '#22c55e',
    'Production': '#38bdf8',
    'QA': '#f43f5e',
    'Staging': '#8b5cf6',
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-light-secondary dark:bg-secondary border border-light-highlight dark:border-highlight rounded-md shadow-lg">
                <p className="label text-sm font-bold">{label}</p>
                <p className="intro text-sm" style={{ color: payload[0].fill }}>
                    Certificates: {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

const EnvironmentChart: React.FC<EnvironmentChartProps> = ({ data, theme, onBarClick }) => {
    const isDark = theme === 'dark';
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    const textColor = isDark ? '#cbd5e1' : '#475569';
    const tooltipCursor = isDark ? 'rgba(45, 55, 72, 0.5)' : 'rgba(241, 245, 249, 0.8)';

    const envNameMapping: { [key: string]: string } = {
        'DEV': 'Development',
        'PROD': 'Production',
        'QA': 'QA',
        'UAT': 'Staging'
    };
    
    const chartData = data.map(item => ({
        value: item.value,
        displayName: envNameMapping[item.name] || item.name,
        originalName: item.name
    }));

    const handleClick = (payload: any) => {
        if (onBarClick && payload) {
            onBarClick({ name: payload.originalName });
        }
    };

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 20,
                        left: -10,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="displayName" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: tooltipCursor }} />
                    <Bar dataKey="value" name="Certificates" radius={[4, 4, 0, 0]} maxBarSize={60} onClick={handleClick}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.displayName] || '#8884d8'} cursor="pointer" />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EnvironmentChart;