import React, { useState, useEffect } from 'react';

interface DateRangeSelectorProps {
    onRangeChange: (range: { start: Date | null; end: Date | null }) => void;
}

const presets = [
    { label: 'All Time', days: -1 },
    { label: 'Expiring Next 7 Days', days: 7 },
    { label: 'Expiring Next 30 Days', days: 30 },
    { label: 'Expiring Next 90 Days', days: 90 },
    { label: 'Expiring This Year', days: 0, special: 'year' },
];

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ onRangeChange }) => {
    const [activePreset, setActivePreset] = useState('All Time');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    useEffect(() => {
        if (customStart && customEnd && activePreset === 'Custom') {
            // Adjust for timezone differences by using UTC
            const start = new Date(customStart + 'T00:00:00Z');
            const end = new Date(customEnd + 'T00:00:00Z');
            if (start <= end) {
                onRangeChange({ start, end });
            }
        }
    }, [customStart, customEnd, onRangeChange, activePreset]);

    const handlePresetClick = (label: string) => {
        setActivePreset(label);
        
        const preset = presets.find(p => p.label === label);
        if (!preset) return;

        if (label === 'All Time') {
            onRangeChange({ start: null, end: null });
            setCustomStart('');
            setCustomEnd('');
            return;
        }

        const start = new Date();
        let end = new Date();

        if (preset.special === 'year') {
            end = new Date(start.getFullYear(), 11, 31); // End of the current year
        } else {
            end.setDate(start.getDate() + preset.days);
        }
        
        start.setHours(0, 0, 0, 0);
        
        onRangeChange({ start, end });
        // Clear custom inputs when a preset is clicked
        const yyyy = start.getFullYear();
        const mm = String(start.getMonth() + 1).padStart(2, '0');
        const dd = String(start.getDate()).padStart(2, '0');
        setCustomStart(`${yyyy}-${mm}-${dd}`);

        const yyyyEnd = end.getFullYear();
        const mmEnd = String(end.getMonth() + 1).padStart(2, '0');
        const ddEnd = String(end.getDate()).padStart(2, '0');
        setCustomEnd(`${yyyyEnd}-${mmEnd}-${ddEnd}`);
    };

    const handleCustomStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomStart(e.target.value);
        setActivePreset('Custom');
    };
    
    const handleCustomEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomEnd(e.target.value);
        setActivePreset('Custom');
    };

    const buttonClass = (label: string) => `
        px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out
        ${activePreset === label
            ? 'bg-accent text-white'
            : 'bg-light-secondary dark:bg-secondary text-light-text-secondary dark:text-text-secondary hover:bg-light-highlight dark:hover:bg-highlight'
        }
    `;

    return (
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-light-secondary dark:bg-secondary">
            <div className="flex items-center gap-2 flex-wrap">
                {presets.map(preset => (
                    <button key={preset.label} onClick={() => handlePresetClick(preset.label)} className={buttonClass(preset.label)}>
                        {preset.label}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-light-text-secondary dark:text-text-secondary">Custom Expiry Range:</span>
                <input
                    type="date"
                    value={customStart}
                    onChange={handleCustomStartChange}
                    className="bg-light-primary dark:bg-primary border border-light-highlight dark:border-highlight rounded-md px-2 py-1 text-sm focus:ring-accent focus:border-accent text-light-text-primary dark:text-text-primary"
                    aria-label="Custom start date"
                />
                <span className="text-light-text-secondary dark:text-text-secondary">-</span>
                <input
                    type="date"
                    value={customEnd}
                    onChange={handleCustomEndChange}
                    className="bg-light-primary dark:bg-primary border border-light-highlight dark:border-highlight rounded-md px-2 py-1 text-sm focus:ring-accent focus:border-accent text-light-text-primary dark:text-text-primary"
                    aria-label="Custom end date"
                    min={customStart}
                />
            </div>
        </div>
    );
};

export default DateRangeSelector;