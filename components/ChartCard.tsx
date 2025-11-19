import React from 'react';

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => {
    return (
        <div className="bg-light-secondary dark:bg-secondary p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold text-light-text-primary dark:text-text-primary mb-4">{title}</h3>
            {children}
        </div>
    );
};

export default ChartCard;