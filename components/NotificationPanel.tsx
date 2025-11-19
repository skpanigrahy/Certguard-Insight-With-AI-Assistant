import React from 'react';
import { AppNotification } from '../types';
import CogIcon from './icons/CogIcon';

interface NotificationPanelProps {
  notifications: AppNotification[];
  onNotificationClick: (notification: AppNotification) => void;
  onMarkAllRead: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onNotificationClick, onMarkAllRead, onOpenSettings, onClose }) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const timeSince = (timestamp: number) => {
    const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-light-secondary dark:bg-secondary rounded-lg shadow-2xl border border-light-highlight dark:border-highlight z-20">
      <div className="p-3 border-b border-light-highlight dark:border-highlight flex justify-between items-center">
        <h4 className="font-bold text-light-text-primary dark:text-text-primary">Notifications</h4>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={onMarkAllRead} className="text-xs text-accent font-semibold hover:underline">Mark all as read</button>
          )}
          <button onClick={() => { onOpenSettings(); onClose(); }} title="Notification Settings" className="text-light-text-secondary dark:text-text-secondary hover:text-accent">
            <CogIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="p-6 text-center text-sm text-light-text-secondary dark:text-text-secondary">No new notifications.</p>
        ) : (
          <ul className="divide-y divide-light-highlight dark:divide-highlight">
            {notifications.map(n => (
              <li key={n.id} onClick={() => onNotificationClick(n)} className={`p-3 hover:bg-light-highlight dark:hover:bg-highlight cursor-pointer ${!n.isRead ? 'bg-sky-500/10 dark:bg-sky-500/10' : ''}`}>
                <div className="flex items-start gap-3">
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0"></div>}
                  <div className={`flex-grow ${n.isRead ? 'pl-5' : ''}`}>
                    <p className="text-sm text-light-text-primary dark:text-text-primary">{n.message}</p>
                    <p className="text-xs text-light-text-secondary dark:text-text-secondary mt-1">{timeSince(n.timestamp)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
