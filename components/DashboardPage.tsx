
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Certificate, CertificateType, Environment, NotificationSettings, AppNotification, ColumnFilters, DaysToExpiryFilter } from '../types';
import Header from './Header';
import SummaryCards from './SummaryCards';
import CertificateTable, { headerConfig } from './CertificateTable';
import CertificateDetailModal from './CertificateDetailModal';
import Pagination from './Pagination';
import { Theme } from '../App';
import { generateMockCertificates } from '../mockData';
import ExportIcon from './icons/ExportIcon';
import ClearIcon from './icons/ClearIcon';
import ViewSwitcher from './ViewSwitcher';
import AnalyticsPage from './AnalyticsPage';
import NotificationSettingsModal from './NotificationSettingsModal';
import SearchIcon from './icons/SearchIcon';
import ChatWidget from './ChatWidget';
import KnowledgeBaseModal from './KnowledgeBaseModal';

const REFRESH_INTERVAL = 60; // seconds

export const blankFilters: ColumnFilters = {
    product: '',
    sealId: '',
    application: '',
    environment: [],
    component: '',
    commonName: '',
    expiryDate_start: '',
    expiryDate_end: '',
    daysToExpiry: { operator: 'between', value1: '', value2: '' },
    certificateType: [],
    issuer: '',
    serialNumber: '',
    san: '',
    hostLocation: '',
    instanceHost: '',
};

const DashboardPage: React.FC<{ theme: Theme; toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
    const [masterCertificateList, setMasterCertificateList] = useState<Certificate[]>([]);
    const [displayedCertificates, setDisplayedCertificates] = useState<Certificate[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
    const [activeFilter, setActiveFilter] = useState<string | null>('total');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Certificate; direction: 'ascending' | 'descending' } | null>({ key: 'daysToExpiry', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [filters, setFilters] = useState<ColumnFilters>(blankFilters);
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');
    const [isPaused, setIsPaused] = useState(false);
    const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
    const [activeView, setActiveView] = useState<'table' | 'analytics'>('table');

    // Chat Sidebar State
    const [isChatOpen, setIsChatOpen] = useState(false);
    
    // Knowledge Base State
    const [showKnowledgeBaseModal, setShowKnowledgeBaseModal] = useState(false);

    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
        try {
            const saved = localStorage.getItem('notificationSettings');
            return saved ? JSON.parse(saved) : { enabled: true, type: 'in-app', emailAddress: '', thresholds: [30, 14, 7] };
        } catch (e) {
            console.error("Failed to parse notification settings:", e);
            return { enabled: true, type: 'in-app', emailAddress: '', thresholds: [30, 14, 7] };
        }
    });
    const [notifications, setNotifications] = useState<AppNotification[]>(() => {
        try {
            const saved = localStorage.getItem('notifications');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse notifications:", e);
            return [];
        }
    });
    const [showNotificationSettings, setShowNotificationSettings] = useState(false);

    const fetchCertificates = useCallback(async (isInitialLoad = false) => {
        if (isInitialLoad) setIsLoading(true);
        else setIsRefreshing(true);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const data = generateMockCertificates(150);
            setMasterCertificateList(data);
            setError(null);
        } catch (e: any) {
             setError(`Failed to load certificates: ${e.message}`);
             setMasterCertificateList([]);
        } finally {
            if (isInitialLoad) setIsLoading(false);
            else setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchCertificates(true);
    }, [fetchCertificates]);

    const isColumnFilterActive = useMemo(() => {
        return Object.entries(filters).some(([key, value]) => {
            if (typeof value === 'string') return value !== '';
            if (Array.isArray(value)) return value.length > 0;
            if (key === 'daysToExpiry') {
                const daysFilter = value as DaysToExpiryFilter;
                return daysFilter.value1 !== '';
            }
            return false;
        });
    }, [filters]);

    useEffect(() => {
        let filtered = [...masterCertificateList];

        if (globalSearchTerm) {
            const lowercasedTerm = globalSearchTerm.toLowerCase();
            filtered = filtered.filter(cert => {
                return Object.entries(cert).some(([key, value]) => {
                    if (key === 'chain' || key === 'id') return false; 
                    return Array.isArray(value)
                        ? value.some(item => String(item).toLowerCase().includes(lowercasedTerm))
                        : String(value).toLowerCase().includes(lowercasedTerm);
                });
            });
        }
        
        switch (activeFilter) {
            case 'expiringSoon':
                filtered = filtered.filter(c => c.daysToExpiry >= 0 && c.daysToExpiry < 7);
                break;
            case 'expired':
                filtered = filtered.filter(c => c.daysToExpiry < 0);
                break;
            case 'healthy':
                filtered = filtered.filter(c => c.daysToExpiry >= 7);
                break;
        }

        if (isColumnFilterActive) {
            filtered = filtered.filter(cert => {
                const textFields: (keyof ColumnFilters)[] = ['product', 'sealId', 'application', 'component', 'commonName', 'issuer', 'serialNumber', 'hostLocation', 'instanceHost'];
                
                for (const key of textFields) {
                    if (filters[key] && !String(cert[key as keyof Certificate]).toLowerCase().includes(String(filters[key as keyof Omit<ColumnFilters, 'environment'|'certificateType'>]).toLowerCase())) {
                        return false;
                    }
                }

                if (filters.san && !cert.san.some(s => s.toLowerCase().includes(filters.san.toLowerCase()))) {
                    return false;
                }
                
                if (filters.environment.length > 0 && !filters.environment.includes(cert.environment)) return false;
                if (filters.certificateType.length > 0 && !filters.certificateType.includes(cert.certificateType)) return false;

                const daysFilter = filters.daysToExpiry;
                if (daysFilter.value1 !== '') {
                    const certDays = cert.daysToExpiry;
                    const val1 = parseInt(daysFilter.value1, 10);
                    
                    if (!isNaN(val1)) {
                        switch (daysFilter.operator) {
                            case '=': if (certDays !== val1) return false; break;
                            case '>': if (certDays <= val1) return false; break;
                            case '<': if (certDays >= val1) return false; break;
                            case '>=': if (certDays < val1) return false; break;
                            case '<=': if (certDays > val1) return false; break;
                            case 'between':
                                const val2 = parseInt(daysFilter.value2, 10);
                                if (!isNaN(val2)) {
                                    if (certDays < Math.min(val1, val2) || certDays > Math.max(val1, val2)) return false;
                                } else {
                                    if (certDays < val1) return false;
                                }
                                break;
                        }
                    }
                }
                
                if (filters.expiryDate_start && cert.expiryDate.substring(0, 10) < filters.expiryDate_start) return false;
                if (filters.expiryDate_end && cert.expiryDate.substring(0, 10) > filters.expiryDate_end) return false;

                return true;
            });
        }
        
        let sorted = [...filtered];
        if (sortConfig !== null) {
            sorted.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        
        setDisplayedCertificates(sorted);

    }, [masterCertificateList, filters, sortConfig, activeFilter, globalSearchTerm, isColumnFilterActive]);


    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setCountdown(prevCountdown => {
                if (prevCountdown <= 1) {
                    fetchCertificates(false);
                    return REFRESH_INTERVAL;
                }
                return prevCountdown - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isPaused, fetchCertificates]);

    useEffect(() => {
        if (!notificationSettings.enabled || masterCertificateList.length === 0) return;
    
        const generatedNotificationKeys: Set<string> = new Set(JSON.parse(localStorage.getItem('generatedNotificationKeys') || '[]'));
        const newNotifications: AppNotification[] = [];
    
        masterCertificateList.forEach(cert => {
            notificationSettings.thresholds.forEach(threshold => {
                if (cert.daysToExpiry === threshold) {
                    const notificationKey = `${cert.id}-${threshold}`;
                    if (!generatedNotificationKeys.has(notificationKey)) {
                        newNotifications.push({
                            id: `${cert.id}-${Date.now()}`,
                            certificateId: cert.id,
                            certificateCommonName: cert.commonName,
                            message: `Certificate for ${cert.commonName} will expire in ${cert.daysToExpiry} days.`,
                            timestamp: Date.now(),
                            isRead: false,
                        });
                        generatedNotificationKeys.add(notificationKey);
                    }
                }
            });
        });
    
        if (newNotifications.length > 0) {
            setNotifications(prev => [...newNotifications, ...prev].sort((a, b) => b.timestamp - a.timestamp));
            localStorage.setItem('generatedNotificationKeys', JSON.stringify(Array.from(generatedNotificationKeys)));
        }
    }, [masterCertificateList, notificationSettings]);

    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }, [notifications]);

    const handlePauseToggle = () => {
        setIsPaused(prev => {
            if (prev) setCountdown(REFRESH_INTERVAL);
            return !prev;
        });
    };
    
    const paginatedCertificates = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return displayedCertificates.slice(startIndex, startIndex + itemsPerPage);
    }, [displayedCertificates, currentPage, itemsPerPage]);

    const handleSort = (key: keyof Certificate) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleCardClick = (filterType: string) => {
        setCurrentPage(1);
        setActiveView('table');
        if (activeFilter === filterType) setActiveFilter('total');
        else setActiveFilter(filterType);
    };
    
    const handleFilterChange = (key: keyof ColumnFilters, value: string | string[] | DaysToExpiryFilter) => {
        setCurrentPage(1);
        setFilters(prev => ({...prev, [key]: value }));
    };
    
    const handleGlobalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGlobalSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setFilters(blankFilters);
        setGlobalSearchTerm('');
        setActiveFilter('total');
    };

    const handleChartStatusFilter = (status: string) => {
        setCurrentPage(1);
        setFilters(blankFilters);
        setGlobalSearchTerm('');
        setActiveFilter(status);
        setActiveView('table');
    };

    const handleChartColumnFilter = (key: keyof ColumnFilters, value: any) => {
        setCurrentPage(1);
        setActiveFilter('total');
        setGlobalSearchTerm('');
        if (key === 'expiryDate_start') {
            setFilters({
                ...blankFilters,
                expiryDate_start: value.start,
                expiryDate_end: value.end
            });
        } else {
             const filterValue = Array.isArray(value) ? value : [value];
             setFilters({ ...blankFilters, [key]: filterValue });
        }
        setActiveView('table');
    };

    const handleExport = useCallback(() => {
        if (displayedCertificates.length === 0) return;

        const headers = headerConfig.map(col => col.label);
        const keys = headerConfig.map(col => col.key);

        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
        
        displayedCertificates.forEach(cert => {
            const row = keys.map(key => {
                let value = cert[key];
                if (key === 'expiryDate' && typeof value === 'string') {
                    value = new Date(value).toLocaleDateString();
                }
                if (Array.isArray(value)) {
                    value = `"${value.join('; ')}"`;
                } else if (typeof value === 'string' && value.includes(',')) {
                    value = `"${value}"`;
                }
                return value;
            }).join(",");
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `CertGuardian-Export-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [displayedCertificates]);

    const summaryData = useMemo(() => ({
        total: masterCertificateList.length,
        expiringSoon: masterCertificateList.filter(c => c.daysToExpiry >= 0 && c.daysToExpiry < 7).length,
        expired: masterCertificateList.filter(c => c.daysToExpiry < 0).length,
        healthy: masterCertificateList.filter(c => c.daysToExpiry >= 7).length,
    }), [masterCertificateList]);

    useEffect(() => {
        if (paginatedCertificates.length === 0 && currentPage > 1) {
            setCurrentPage(Math.max(1, currentPage - 1));
        }
    }, [paginatedCertificates, currentPage]);

    const handleSaveNotificationSettings = (settings: NotificationSettings) => {
        setNotificationSettings(settings);
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
        setShowNotificationSettings(false);
    };

    const handleMarkAllNotificationsAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const handleNotificationClick = (notification: AppNotification) => {
        const cert = masterCertificateList.find(c => c.id === notification.certificateId);
        if (cert) {
            setSelectedCertificate(cert);
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
        }
    };

    // Function to allow Chatbot to apply filters
    const handleApplyFiltersFromChat = (newFilters: Partial<ColumnFilters>) => {
        setActiveFilter('total'); 
        setFilters(prev => ({ ...prev, ...newFilters }));
        setActiveView('table');
    };
    
    const handleResetFiltersFromChat = () => {
        handleClearFilters();
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full p-6"><div className="text-lg font-semibold">Loading Dashboard...</div></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-full p-6 text-danger"><div className="text-lg font-semibold p-4 border border-danger rounded-lg">{error}</div></div>;
    }

    return (
        <main className="container relative min-h-screen pb-24">
            <Header 
                theme={theme} 
                toggleTheme={toggleTheme} 
                isPaused={isPaused} 
                countdown={countdown} 
                isRefreshing={isRefreshing} 
                onPauseToggle={handlePauseToggle}
                notifications={notifications}
                onNotificationClick={handleNotificationClick}
                onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
                onOpenNotificationSettings={() => setShowNotificationSettings(true)}
                onOpenKnowledgeBase={() => setShowKnowledgeBaseModal(true)}
            />

            <div className="mt-8">
                <ViewSwitcher 
                    activeView={activeView} 
                    setActiveView={setActiveView}
                    onOpenChat={() => setIsChatOpen(true)}
                />
            </div>

            {activeView === 'analytics' && (
                <AnalyticsPage 
                    allCertificates={masterCertificateList} 
                    theme={theme} 
                    onStatusFilter={handleChartStatusFilter}
                    onColumnFilter={handleChartColumnFilter}
                />
            )}
            
            {activeView === 'table' && (
                <>
                    <div className="mt-8"><SummaryCards data={summaryData} activeFilter={activeFilter} onCardClick={handleCardClick} /></div>
                    <div className="mt-8 card">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                            <div className="relative flex-grow w-full md:w-auto" style={{ maxWidth: '400px' }}>
                                <span className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none top-0 bottom-0">
                                    <SearchIcon className="w-5 h-5 text-secondary" />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search all certificates..."
                                    value={globalSearchTerm}
                                    onChange={handleGlobalSearchChange}
                                    className="input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    aria-label="Global search for certificates"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={handleClearFilters} className="btn btn-outline" disabled={!isColumnFilterActive && !globalSearchTerm && activeFilter === 'total'}>
                                    <ClearIcon className="w-5 h-5 mr-2" />
                                    Clear Filters
                                </button>
                                <button onClick={handleExport} className="btn btn-primary">
                                    <ExportIcon className="w-5 h-5 mr-2" />
                                    Export CSV
                                </button>
                            </div>
                        </div>
                        <div className="mt-2">
                            <CertificateTable 
                                certificates={paginatedCertificates}
                                onSort={handleSort}
                                sortConfig={sortConfig}
                                onViewDetails={setSelectedCertificate}
                                filters={filters}
                                onFilterChange={handleFilterChange}
                            />
                        </div>
                        <Pagination totalItems={displayedCertificates.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
                    </div>
                </>
            )}
            
            {selectedCertificate && <CertificateDetailModal certificate={selectedCertificate} onClose={() => setSelectedCertificate(null)} />}
            {showNotificationSettings && <NotificationSettingsModal settings={notificationSettings} onSave={handleSaveNotificationSettings} onClose={() => setShowNotificationSettings(false)} />}
            {showKnowledgeBaseModal && <KnowledgeBaseModal onClose={() => setShowKnowledgeBaseModal(false)} />}
        
            <ChatWidget 
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                allCertificates={masterCertificateList}
                onApplyFilter={handleApplyFiltersFromChat}
                onResetFilter={handleResetFiltersFromChat}
            />
        </main>
    );
};

export default DashboardPage;
