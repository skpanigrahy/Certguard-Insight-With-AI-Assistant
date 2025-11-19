import React from 'react';
import PauseIcon from './icons/PauseIcon';
import PlayIcon from './icons/PlayIcon';
import RefreshIcon from './icons/RefreshIcon';

interface AutoRefreshControlProps {
    isPaused: boolean;
    countdown: number;
    isRefreshing: boolean;
    onToggle: () => void;
}

const AutoRefreshControl: React.FC<AutoRefreshControlProps> = ({ isPaused, countdown, isRefreshing, onToggle }) => {
    return (
        <div className="flex items-center space-x-3 text-sm text-light-text-secondary dark:text-text-secondary">
             <button 
                onClick={onToggle} 
                title={isPaused ? 'Resume Refresh' : 'Pause Refresh'} 
                className="p-1.5 rounded-full hover:bg-light-highlight dark:hover:bg-highlight transition-colors"
                aria-label={isPaused ? 'Resume auto-refresh' : 'Pause auto-refresh'}
            >
                {isPaused ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />}
            </button>
            <div className="flex items-center space-x-1.5">
                {isRefreshing && <RefreshIcon className="w-4 h-4 animate-spin"/>}
                <span>
                    {isRefreshing ? 'Refreshing...' : (isPaused ? 'Auto-refresh is paused' : `Next refresh in ${countdown}s`)}
                </span>
            </div>
        </div>
    );
};

export default AutoRefreshControl;
