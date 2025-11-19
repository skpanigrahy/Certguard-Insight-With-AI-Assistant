import React, { useMemo, useState } from 'react';
import { Certificate, Environment, ColumnFilters } from '../types';
import { Theme } from '../App';
import ChartCard from './ChartCard';
import ExpiryChart from './ExpiryChart';
import EnvironmentChart from './EnvironmentChart';
import StatusDistributionChart from './StatusDistributionChart';
import TopProductsChart from './TopProductsChart';
import DateRangeSelector from './DateRangeSelector';

interface AnalyticsPageProps {
    allCertificates: Certificate[];
    theme: Theme;
    onStatusFilter: (status: string) => void;
    onColumnFilter: (key: keyof ColumnFilters, value: any) => void;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ allCertificates, theme, onStatusFilter, onColumnFilter }) => {
    const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

    const filteredCertificatesByDate = useMemo(() => {
        if (!dateRange.start || !dateRange.end) {
            return allCertificates; // "All Time"
        }
        
        const endOfDay = new Date(dateRange.end);
        endOfDay.setHours(23, 59, 59, 999);

        return allCertificates.filter(cert => {
            const expiryDate = new Date(cert.expiryDate);
            return expiryDate >= dateRange.start! && expiryDate <= endOfDay;
        });
    }, [allCertificates, dateRange]);


    const statusDistributionData = useMemo(() => {
        const expiringSoon = filteredCertificatesByDate.filter(c => c.daysToExpiry >= 0 && c.daysToExpiry < 7).length;
        const expired = filteredCertificatesByDate.filter(c => c.daysToExpiry < 0).length;
        const valid = filteredCertificatesByDate.filter(c => c.daysToExpiry >= 7).length;
        return [
            { name: 'Valid', value: valid },
            { name: 'Expiring', value: expiringSoon },
            { name: 'Expired', value: expired },
        ];
    }, [filteredCertificatesByDate]);
    
    const environmentChartData = useMemo(() => {
        const envCounts: { [key in Environment]: number } = { PROD: 0, UAT: 0, DEV: 0, QA: 0 };
        filteredCertificatesByDate.forEach(cert => {
            if (cert.environment in envCounts) envCounts[cert.environment]++;
        });
        return Object.entries(envCounts).map(([name, value]) => ({ name, value }));
    }, [filteredCertificatesByDate]);

    const expiryChartData = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const next6Months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() + i);
            return { name: `${months[d.getMonth()]} '${d.getFullYear().toString().slice(-2)}`, expiring: 0 };
        });
        const today = new Date();
        const sixMonthsLater = new Date();
        sixMonthsLater.setMonth(today.getMonth() + 6);
        
        filteredCertificatesByDate.forEach(cert => {
            const expiryDate = new Date(cert.expiryDate);
            if (expiryDate > today && expiryDate < sixMonthsLater) {
                let monthIndex = (expiryDate.getFullYear() - today.getFullYear()) * 12 + expiryDate.getMonth() - today.getMonth();
                if (monthIndex >= 0 && monthIndex < 6) {
                    next6Months[monthIndex].expiring++;
                }
            }
        });
        return next6Months;
    }, [filteredCertificatesByDate]);

    const topProductsData = useMemo(() => {
        const productCounts: { [key: string]: number } = {};
        filteredCertificatesByDate.forEach(cert => {
            productCounts[cert.product] = (productCounts[cert.product] || 0) + 1;
        });
        return Object.entries(productCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Top 10 products
    }, [filteredCertificatesByDate]);

    const handleStatusClick = (data: { name: string }) => {
        const statusMap: { [key: string]: string } = {
            'Expired': 'expired',
            'Expiring': 'expiringSoon',
            'Valid': 'healthy'
        };
        const filter = statusMap[data.name];
        if (filter) onStatusFilter(filter);
    };

    const handleEnvironmentClick = (data: { name: string }) => {
        onColumnFilter('environment', data.name);
    };

    const handleProductClick = (data: { name: string }) => {
        onColumnFilter('product', data.name);
    };

    const handleExpiryMonthClick = (data: { name: string }) => {
        const [monthStr, yearStr] = data.name.split(" '");
        const year = 2000 + parseInt(yearStr, 10);
        const month = new Date(Date.parse(monthStr +" 1, 2012")).getMonth();
        
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const formatDate = (d: Date) => d.toISOString().split('T')[0];

        onColumnFilter('expiryDate_start', { 
            start: formatDate(startDate),
            end: formatDate(endDate)
        });
    };

    return (
        <div className="mt-8">
            <div className="mb-8">
                <DateRangeSelector onRangeChange={setDateRange} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard title="Certificate Status Distribution"><StatusDistributionChart data={statusDistributionData} theme={theme} onSegmentClick={handleStatusClick} /></ChartCard>
                <ChartCard title="Certificates by Environment"><EnvironmentChart data={environmentChartData} theme={theme} onBarClick={handleEnvironmentClick} /></ChartCard>
                <ChartCard title="Certificate Expiry Timeline"><ExpiryChart data={expiryChartData} theme={theme} onBarClick={handleExpiryMonthClick} /></ChartCard>
                <ChartCard title="Top Products by Certificate Count"><TopProductsChart data={topProductsData} theme={theme} onBarClick={handleProductClick} /></ChartCard>
            </div>
        </div>
    );
};

export default AnalyticsPage;