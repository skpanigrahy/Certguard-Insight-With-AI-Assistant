
import React from 'react';
import TableIcon from './icons/TableIcon';
import AnalyticsIcon from './icons/AnalyticsIcon';
import SparklesIcon from './icons/SparklesIcon';

type View = 'table' | 'analytics';

interface ViewSwitcherProps {
    activeView: View;
    setActiveView: (view: View) => void;
    onOpenChat: () => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ activeView, setActiveView, onOpenChat }) => {
    const activeStyle: React.CSSProperties = {
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--accent)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
    };

    const inactiveStyle: React.CSSProperties = {
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)'
    };

    return (
        <div className="flex items-center gap-4">
            <div className="flex p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-highlight)', width: 'fit-content', gap: '0.25rem' }}>
                <button 
                    onClick={() => setActiveView('table')} 
                    className="btn"
                    style={activeView === 'table' ? activeStyle : inactiveStyle}
                >
                    <TableIcon className="w-5 h-5 mr-2" />
                    Certificate Table
                </button>
                <button 
                    onClick={() => setActiveView('analytics')} 
                    className="btn"
                    style={activeView === 'analytics' ? activeStyle : inactiveStyle}
                >
                    <AnalyticsIcon className="w-5 h-5 mr-2" />
                    Analytics & Charts
                </button>
            </div>
            
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }}></div>
            
            <button 
                onClick={onOpenChat} 
                className="btn btn-primary"
                style={{ 
                    background: 'linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%)',
                    border: 'none',
                    boxShadow: '0 4px 10px rgba(139, 92, 246, 0.2)'
                }}
            >
                <SparklesIcon className="w-5 h-5 mr-2" />
                Ask AI Assistant
            </button>
        </div>
    );
};

export default ViewSwitcher;
