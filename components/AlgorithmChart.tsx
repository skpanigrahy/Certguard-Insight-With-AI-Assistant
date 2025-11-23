
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Theme } from '../App';

interface AlgorithmChartProps {
    data: { name: string; value: number }[];
    theme: Theme;
}

const AlgorithmChart: React.FC<AlgorithmChartProps> = ({ data, theme }) => {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#cbd5e1' : '#475569';

    // High contrast donut colors
    const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#ef4444', '#a855f7'];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-2 bg-secondary border border-border rounded shadow-lg text-xs">
                    <p className="font-bold text-text-primary">{payload[0].name}</p>
                    <p style={{ color: payload[0].fill }}>Count: {payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '11px', color: textColor }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AlgorithmChart;
