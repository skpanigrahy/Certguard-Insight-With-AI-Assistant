
import React, { useMemo, useState } from 'react';
import { Certificate, Environment, ColumnFilters } from '../types';
import { Theme } from '../App';
import ChartCard from './ChartCard';
import ExpiryChart from './ExpiryChart';
import EnvironmentChart from './EnvironmentChart';
import DateRangeSelector from './DateRangeSelector';
import MetricTile from './MetricTile';
import IssuerChart from './IssuerChart';
import AlgorithmChart from './AlgorithmChart';
import ComplianceTable from './ComplianceTable';

interface AnalyticsPageProps {
    allCertificates: Certificate[];
    theme: Theme;
    onStatusFilter: (status: string) => void;
    onColumnFilter: (key: keyof ColumnFilters, value: any) => void;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ allCertificates, theme, onStatusFilter, onColumnFilter }) => {
    const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

    // --- DATA PROCESSING ---

    const filteredCertificates = useMemo(() => {
        if (!dateRange.start || !dateRange.end) return allCertificates;
        const endOfDay = new Date(dateRange.end);
        endOfDay.setHours(23, 59, 59, 999);
        return allCertificates.filter(cert => {
            const expiryDate = new Date(cert.expiryDate);
            return expiryDate >= dateRange.start! && expiryDate <= endOfDay;
        });
    }, [allCertificates, dateRange]);

    // Metrics for Tiles
    const metrics = useMemo(() => {
        const total = filteredCertificates.length;
        const expiring7 = filteredCertificates.filter(c => c.daysToExpiry >= 0 && c.daysToExpiry < 7).length;
        const expired = filteredCertificates.filter(c => c.daysToExpiry < 0).length;
        const avgLife = Math.floor(filteredCertificates.reduce((acc, c) => acc + c.daysToExpiry, 0) / (total || 1));

        return { total, expiring7, expired, avgLife };
    }, [filteredCertificates]);

    // Top Issuers (Horizontal Bar)
    const issuerData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredCertificates.forEach(c => counts[c.issuer] = (counts[c.issuer] || 0) + 1);
        return Object.entries(counts)
            .map(([name, value]) => ({ name: name.replace(' Intermediate CA', ''), value })) // Shorten names
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [filteredCertificates]);

    // Environments (Vertical Bar / Map Replacement)
    const envData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredCertificates.forEach(c => counts[c.environment] = (counts[c.environment] || 0) + 1);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filteredCertificates]);

    // Algorithm Distribution (Donut)
    const algoData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredCertificates.forEach(c => {
            // Simplify algo name
            const simpleName = c.signatureAlgorithm.replace('withRSA', '').replace('SHA', 'SHA-');
            counts[simpleName] = (counts[simpleName] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filteredCertificates]);

    // Expiry Timeline (Area/Bar)
    const expiryTimelineData = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const timeline = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() + i);
            return { 
                name: `${months[d.getMonth()]}`, 
                fullDate: d,
                expiring: 0 
            };
        });
        
        filteredCertificates.forEach(cert => {
            const expiryDate = new Date(cert.expiryDate);
            const today = new Date();
            const sixMonths = new Date();
            sixMonths.setMonth(today.getMonth() + 6);
            
            if (expiryDate >= today && expiryDate <= sixMonths) {
                const diffMonth = (expiryDate.getFullYear() - today.getFullYear()) * 12 + (expiryDate.getMonth() - today.getMonth());
                if (diffMonth >= 0 && diffMonth < 6) {
                    timeline[diffMonth].expiring++;
                }
            }
        });
        return timeline;
    }, [filteredCertificates]);

    // --- HANDLERS ---
    const handleBarClick = (data: any) => { /* Generic handler wrapper */ };

    return (
        <div className="mt-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Security Operations Center</h2>
                <DateRangeSelector onRangeChange={setDateRange} />
            </div>

            {/* ROW 1: Key Metrics (Bento Tiles) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricTile 
                    title="Total Certificates" 
                    value={metrics.total} 
                    trend={12} 
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                />
                <MetricTile 
                    title="Critical (Expiring < 7d)" 
                    value={metrics.expiring7} 
                    trend={-5} 
                    trendLabel="vs last week"
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                />
                <MetricTile 
                    title="Expired Certificates" 
                    value={metrics.expired} 
                    trend={2} 
                    trendLabel="new today"
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>}
                />
                <MetricTile 
                    title="Avg. Lifespan Remaining" 
                    value={`${metrics.avgLife} days`} 
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
            </div>

            {/* ROW 2: Distribution Layer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left: Top Issuers (Vertical List Style) */}
                <div className="lg:col-span-3">
                    <ChartCard title="Top Authorities">
                        <IssuerChart data={issuerData} theme={theme} />
                    </ChartCard>
                </div>

                {/* Center: Environment Map Replacement */}
                <div className="lg:col-span-6">
                    <ChartCard title="Infrastructure Distribution">
                         {/* Reusing EnvironmentChart but could be replaced with Map if lib allowed */}
                        <EnvironmentChart 
                            data={envData} 
                            theme={theme} 
                            onBarClick={(d) => onColumnFilter('environment', d.name)} 
                        />
                    </ChartCard>
                </div>

                {/* Right: Algo Distribution */}
                <div className="lg:col-span-3">
                    <ChartCard title="Cryptography Standards">
                        <AlgorithmChart data={algoData} theme={theme} />
                    </ChartCard>
                </div>
            </div>

            {/* ROW 3: Timeline & Risks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <ChartCard title="6-Month Expiry Forecast">
                        <ExpiryChart 
                            data={expiryTimelineData} 
                            theme={theme} 
                            onBarClick={() => {}} 
                        />
                    </ChartCard>
                </div>
                <div className="lg:col-span-1">
                    <ChartCard title="Compliance Risk Watchlist">
                        <ComplianceTable certificates={filteredCertificates} />
                    </ChartCard>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
