
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Theme } from '../App';

interface IssuerChartProps {
    data: { name: string; value: number }[];
    theme: Theme;
}

const IssuerChart: React.FC<IssuerChartProps> = ({ data, theme }) => {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#cbd5e1' : '#475569';
    const gridColor = isDark ? '#334155' : '#e2e8f0';

    // Cyber-security dashboard palette
    const colors = ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#fb7185'];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-2 bg-secondary border border-border rounded shadow-lg text-xs">
                    <p className="font-bold text-text-primary">{label}</p>
                    <p className="text-accent">Count: {payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} opacity={0.5} />
                    <XAxis type="number" stroke={textColor} fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke={textColor} 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false} 
                        width={100}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={15}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default IssuerChart;
