
import React, { useState, useRef, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import { Theme } from '../App';
import AutoRefreshControl from './AutoRefreshControl';
import BellIcon from './icons/BellIcon';
import BookIcon from './icons/BookIcon';
import NotificationPanel from './NotificationPanel';
import { AppNotification } from '../types';

interface HeaderProps {
    theme: Theme;
    toggleTheme: () => void;
    isPaused: boolean;
    countdown: number;
    isRefreshing: boolean;
    onPauseToggle: () => void;
    notifications: AppNotification[];
    onNotificationClick: (notification: AppNotification) => void;
    onMarkAllNotificationsAsRead: () => void;
    onOpenNotificationSettings: () => void;
    onOpenKnowledgeBase: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, isPaused, countdown, isRefreshing, onPauseToggle, notifications, onNotificationClick, onMarkAllNotificationsAsRead, onOpenNotificationSettings, onOpenKnowledgeBase }) => {
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (
            panelRef.current && !panelRef.current.contains(event.target as Node) &&
            bellRef.current && !bellRef.current.contains(event.target as Node)
        ) {
            setShowPanel(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClickAndClosePanel = (notification: AppNotification) => {
    onNotificationClick(notification);
    setShowPanel(false);
  };

  return (
    <header className="flex items-center justify-between p-6 border-b" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="flex items-center gap-4">
        <h1 className="font-bold">
          Cert<span className="text-accent">Guardian</span> Dashboard
        </h1>
        <AutoRefreshControl 
            isPaused={isPaused}
            countdown={countdown}
            isRefreshing={isRefreshing}
            onToggle={onPauseToggle}
        />
      </div>
      <div className="flex items-center gap-2">
        <button 
            onClick={onOpenKnowledgeBase}
            className="btn-icon text-text-secondary hover:text-accent"
            title="Manage Knowledge Base"
        >
            <BookIcon className="w-6 h-6" />
        </button>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)', margin: '0 0.5rem' }}></div>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <div className="relative" ref={panelRef}>
          <button
            ref={bellRef}
            onClick={() => setShowPanel(!showPanel)}
            className="btn-icon relative"
            aria-label="Toggle notifications"
          >
            <BellIcon className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex" style={{ width: '0.75rem', height: '0.75rem' }}>
                <span className="absolute inline-flex w-full h-full rounded-full bg-danger opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full w-full h-full bg-danger"></span>
              </span>
            )}
          </button>
          {showPanel && (
            <NotificationPanel 
                notifications={notifications}
                onNotificationClick={handleNotificationClickAndClosePanel}
                onMarkAllRead={onMarkAllNotificationsAsRead}
                onOpenSettings={onOpenNotificationSettings}
                onClose={() => setShowPanel(false)}
            />
          )}
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-secondary" style={{ backgroundColor: 'var(--bg-highlight)' }}>
            AO
        </div>
      </div>
    </header>
  );
};

export default Header;
