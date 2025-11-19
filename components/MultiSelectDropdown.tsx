
import React, { useState, useRef, useEffect } from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface MultiSelectDropdownProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ options, selected, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOptionToggle = (option: string) => {
        const newSelected = selected.includes(option)
            ? selected.filter(item => item !== option)
            : [...selected, option];
        onChange(newSelected);
    };

    const getButtonLabel = () => {
        if (selected.length === 0) return placeholder;
        if (selected.length === 1) return selected[0];
        if (selected.length === options.length) return 'All';
        return `${selected.length} selected`;
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="input"
                style={{ 
                    cursor: 'pointer', 
                    height: '30px',
                    padding: '0 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    gap: '0.5rem',
                    width: '100%'
                }}
                title={getButtonLabel()}
            >
                <span className="truncate" style={{ flex: 1, textAlign: 'left' }}>{getButtonLabel()}</span>
                <ChevronDownIcon style={{ width: '1rem', height: '1rem', flexShrink: 0, color: 'var(--text-secondary)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full rounded shadow-lg" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', maxHeight: '200px', overflowY: 'auto', minWidth: '140px' }}>
                    <ul className="p-1" style={{ listStyle: 'none', padding: '0.25rem', margin: 0 }}>
                        {options.map(option => (
                            <li key={option}>
                                <label className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-highlight" style={{ fontSize: '0.8rem', display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(option)}
                                        onChange={() => handleOptionToggle(option)}
                                        style={{ accentColor: 'var(--accent)' }}
                                    />
                                    <span>{option}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;
