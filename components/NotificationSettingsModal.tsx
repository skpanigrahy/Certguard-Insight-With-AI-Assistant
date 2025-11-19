import React, { useState } from 'react';
import { NotificationSettings } from '../types';
import CloseIcon from './icons/CloseIcon';

interface NotificationSettingsModalProps {
  settings: NotificationSettings;
  onSave: (settings: NotificationSettings) => void;
  onClose: () => void;
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [enabled, setEnabled] = useState(settings.enabled);
  const [type, setType] = useState(settings.type);
  const [emailAddress, setEmailAddress] = useState(settings.emailAddress);
  const [thresholds, setThresholds] = useState(settings.thresholds.join(', '));
  
  const handleSave = () => {
    const parsedThresholds = thresholds.split(',')
      .map(t => parseInt(t.trim(), 10))
      .filter(t => !isNaN(t) && t > 0);

    onSave({
      enabled,
      type,
      emailAddress,
      // Fix: Explicitly type `a` and `b` as numbers for the sort comparison function.
      thresholds: [...new Set(parsedThresholds)].sort((a: number, b: number) => b - a), // remove duplicates and sort
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-light-secondary dark:bg-secondary rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-light-highlight dark:border-highlight flex justify-between items-center">
          <h3 className="text-lg font-bold text-light-text-primary dark:text-text-primary">Notification Settings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-light-text-primary dark:hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <label htmlFor="enabled" className="text-sm font-medium text-light-text-primary dark:text-text-primary">Enable Notifications</label>
            <button
              id="enabled"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-accent' : 'bg-light-highlight dark:bg-highlight'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className={`transition-opacity ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div>
              <label className="text-sm font-medium text-light-text-primary dark:text-text-primary">Notification Type</label>
              <div className="mt-2 flex gap-4">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="type" value="in-app" checked={type === 'in-app'} onChange={() => setType('in-app')} disabled={!enabled} className="h-4 w-4 text-accent focus:ring-accent border-gray-300" />
                  <span className="text-sm">In-App</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="type" value="email" checked={type === 'email'} onChange={() => setType('email')} disabled={!enabled} className="h-4 w-4 text-accent focus:ring-accent border-gray-300"/>
                  <span className="text-sm">Email</span>
                </label>
              </div>
            </div>

            {type === 'email' && (
              <div className="mt-4">
                <label htmlFor="email" className="block text-sm font-medium text-light-text-primary dark:text-text-primary">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  disabled={!enabled}
                  placeholder="user@example.com"
                  className="mt-1 w-full bg-light-primary dark:bg-primary border border-light-highlight dark:border-highlight rounded px-3 py-2 text-sm focus:ring-accent focus:border-accent"
                />
              </div>
            )}
            
            <div className="mt-4">
              <label htmlFor="thresholds" className="block text-sm font-medium text-light-text-primary dark:text-text-primary">Notify at (days before expiry)</label>
              <input
                type="text"
                id="thresholds"
                value={thresholds}
                onChange={(e) => setThresholds(e.target.value)}
                disabled={!enabled}
                placeholder="e.g., 30, 14, 7"
                className="mt-1 w-full bg-light-primary dark:bg-primary border border-light-highlight dark:border-highlight rounded px-3 py-2 text-sm focus:ring-accent focus:border-accent"
              />
              <p className="mt-1 text-xs text-light-text-secondary dark:text-text-secondary">Enter comma-separated numbers.</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-light-primary dark:bg-primary/50 flex justify-end items-center gap-x-3 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md hover:bg-light-highlight dark:hover:bg-highlight">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold bg-accent text-white rounded-md hover:bg-sky-500">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsModal;