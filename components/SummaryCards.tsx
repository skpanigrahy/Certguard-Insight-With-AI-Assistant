
import React from 'react';

interface SummaryCardProps {
    title: string;
    value: number;
    bgColor: string;
    icon: React.ReactNode;
    onClick: () => void;
    isActive: boolean;
}

const Card: React.FC<SummaryCardProps> = ({ title, value, bgColor, icon, onClick, isActive }) => (
    <div 
        className="card flex items-center gap-4 cursor-pointer"
        style={{ 
            border: isActive ? '2px solid var(--accent)' : '1px solid var(--border)',
            transition: 'border-color 0.2s'
        }}
        onClick={onClick}
    >
        <div className="p-3 rounded-full" style={{ backgroundColor: bgColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-secondary">{title}</p>
            <p className="font-bold" style={{ fontSize: '1.875rem', lineHeight: '2.25rem' }}>{value}</p>
        </div>
    </div>
);

interface SummaryCardsProps {
    data: {
        total: number;
        expiringSoon: number;
        expired: number;
        healthy: number;
    };
    activeFilter: string | null;
    onCardClick: (filterType: string) => void;
}

const TotalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const HealthyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const WarningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const DangerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;

const SummaryCards: React.FC<SummaryCardsProps> = ({ data, activeFilter, onCardClick }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card title="Total Certificates" value={data.total} bgColor="var(--accent)" icon={<TotalIcon />} onClick={() => onCardClick('total')} isActive={activeFilter === null || activeFilter === 'total'} />
            <Card title="Healthy" value={data.healthy} bgColor="var(--success)" icon={<HealthyIcon />} onClick={() => onCardClick('healthy')} isActive={activeFilter === 'healthy'} />
            <Card title="Expiring < 7 Days" value={data.expiringSoon} bgColor="var(--warning)" icon={<WarningIcon />} onClick={() => onCardClick('expiringSoon')} isActive={activeFilter === 'expiringSoon'} />
            <Card title="Expired" value={data.expired} bgColor="var(--danger)" icon={<DangerIcon />} onClick={() => onCardClick('expired')} isActive={activeFilter === 'expired'} />
        </div>
    );
};

export default SummaryCards;
