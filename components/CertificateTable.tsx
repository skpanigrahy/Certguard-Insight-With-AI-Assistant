
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Certificate, CertificateType, Environment, ColumnFilters, DaysToExpiryFilter } from '../types';
import ChevronUpIcon from './icons/ChevronUpIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import InfoIcon from './icons/InfoIcon';
import MultiSelectDropdown from './MultiSelectDropdown';

export interface HeaderConfigItem {
  key: keyof Certificate;
  label: string;
  fullName: string;
  minWidth: number;
  defaultWidth: number;
}

export const headerConfig: HeaderConfigItem[] = [
  { key: 'product', label: 'Product', fullName: 'Product Name', minWidth: 100, defaultWidth: 150 },
  { key: 'sealId', label: 'SEAL ID', fullName: 'SEAL ID', minWidth: 100, defaultWidth: 120 },
  { key: 'application', label: 'Application', fullName: 'Application Name', minWidth: 120, defaultWidth: 150 },
  { key: 'environment', label: 'Env', fullName: 'Environment', minWidth: 120, defaultWidth: 160 },
  { key: 'component', label: 'Component', fullName: 'Component', minWidth: 120, defaultWidth: 150 },
  { key: 'commonName', label: 'Common Name', fullName: 'Common Name (CN)', minWidth: 150, defaultWidth: 250 },
  { key: 'expiryDate', label: 'Expiry Date', fullName: 'Expiry Date', minWidth: 120, defaultWidth: 180 },
  { key: 'daysToExpiry', label: 'Expires In', fullName: 'Days to Expiry', minWidth: 150, defaultWidth: 220 },
  { key: 'certificateType', label: 'Type', fullName: 'Certificate Type', minWidth: 120, defaultWidth: 160 },
  { key: 'issuer', label: 'Issuer', fullName: 'Certificate Issuer', minWidth: 120, defaultWidth: 200 },
  { key: 'serialNumber', label: 'Serial Number', fullName: 'Serial Number', minWidth: 150, defaultWidth: 220 },
  { key: 'san', label: 'SANs', fullName: 'Subject Alternative Names', minWidth: 150, defaultWidth: 250 },
  { key: 'hostLocation', label: 'Location', fullName: 'Host Location', minWidth: 100, defaultWidth: 120 },
  { key: 'instanceHost', label: 'Instance', fullName: 'Instance Host', minWidth: 120, defaultWidth: 150 },
];

interface CertificateTableProps {
    certificates: Certificate[];
    onSort: (key: keyof Certificate) => void;
    sortConfig: { key: keyof Certificate; direction: 'ascending' | 'descending' } | null;
    onViewDetails: (certificate: Certificate) => void;
    filters: ColumnFilters;
    onFilterChange: (key: keyof ColumnFilters, value: any) => void;
}

const Th: React.FC<{
    children: React.ReactNode;
    sortKey: keyof Certificate;
    onSort: (key: keyof Certificate) => void;
    sortConfig: CertificateTableProps['sortConfig'];
    fullName: string;
    onMouseDown: (e: React.MouseEvent) => void;
    width: number;
}> = ({ children, sortKey, onSort, sortConfig, fullName, onMouseDown, width }) => {
    const isSorted = sortConfig?.key === sortKey;
    const direction = sortConfig?.direction;

    return (
        <th
            scope="col"
            style={{ width: `${width}px` }}
        >
            <div className="flex items-center" onClick={() => onSort(sortKey)} style={{cursor: 'pointer'}}>
                <span className="truncate">{children}</span>
                <span className="ml-2 flex-shrink-0">
                    {isSorted ? (
                        direction === 'ascending' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    ) : (
                        <ChevronDownIcon className="w-4 h-4" style={{ opacity: 0.2 }} />
                    )}
                </span>
                <span title={fullName} className="ml-1 opacity-60 flex-shrink-0"><InfoIcon className="w-4 h-4" /></span>
            </div>
            <div
                onMouseDown={onMouseDown}
                className="absolute top-0 right-0 h-full w-2 cursor-col-resize"
                style={{ cursor: 'col-resize' }}
            />
        </th>
    );
};

const DaysToExpiryFilterComponent: React.FC<{
    value: DaysToExpiryFilter;
    onChange: (value: DaysToExpiryFilter) => void;
}> = ({ value, onChange }) => {
    const operators = ['between', '>', '<', '=', '>=', '<='];
    return (
        <div className="flex items-center gap-1 w-full">
            <select
                value={value.operator}
                onChange={e => onChange({ ...value, operator: e.target.value as DaysToExpiryFilter['operator'] })}
                className="input p-1 text-xs"
                style={{ width: 'auto', minWidth: '65px', flexShrink: 0 }}
            >
                {operators.map(op => <option key={op} value={op}>{op}</option>)}
            </select>
            <input
                type="number"
                placeholder="days"
                value={value.value1}
                onChange={e => onChange({ ...value, value1: e.target.value })}
                className="input p-1 text-xs flex-1"
                style={{ minWidth: '50px' }}
            />
            {value.operator === 'between' &&
                <input
                    type="number"
                    placeholder="days"
                    value={value.value2}
                    onChange={e => onChange({ ...value, value2: e.target.value })}
                    className="input p-1 text-xs flex-1"
                    style={{ minWidth: '50px' }}
                />
            }
        </div>
    )
}

const CertificateTable: React.FC<CertificateTableProps> = ({ certificates, onSort, sortConfig, onViewDetails, filters, onFilterChange }) => {
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => 
        headerConfig.reduce((acc, col) => ({ ...acc, [col.key]: col.defaultWidth }), {})
    );

    const resizingColumnRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!resizingColumnRef.current) return;
        const { key, startX, startWidth } = resizingColumnRef.current;
        const newWidth = startWidth + (e.clientX - startX);
        const minWidth = headerConfig.find(c => c.key === key)?.minWidth || 50;

        if (newWidth > minWidth) {
            setColumnWidths(prev => ({ ...prev, [key]: newWidth }));
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        resizingColumnRef.current = null;
    }, [handleMouseMove]);
    
    const handleMouseDown = (e: React.MouseEvent, key: keyof Certificate) => {
        resizingColumnRef.current = {
            key: key as string,
            startX: e.clientX,
            startWidth: columnWidths[key as string],
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);


    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        {headerConfig.map(col => (
                            <Th key={col.key} sortKey={col.key} onSort={onSort} sortConfig={sortConfig} fullName={col.fullName} onMouseDown={(e) => handleMouseDown(e, col.key)} width={columnWidths[col.key]}>
                                {col.label}
                            </Th>
                        ))}
                        <th style={{ width: '100px' }}>Actions</th>
                    </tr>
                    <tr>
                        {headerConfig.map(col => (
                            <th key={`${col.key}-filter`} style={{ padding: '0.5rem' }}>
                                {col.key === 'environment' ? (
                                    <MultiSelectDropdown options={Object.values(Environment)} selected={filters.environment} onChange={val => onFilterChange('environment', val)} placeholder="All Envs"/>
                                ) : col.key === 'certificateType' ? (
                                     <MultiSelectDropdown options={Object.values(CertificateType)} selected={filters.certificateType} onChange={val => onFilterChange('certificateType', val)} placeholder="All Types"/>
                                ) : col.key === 'daysToExpiry' ? (
                                    <DaysToExpiryFilterComponent value={filters.daysToExpiry} onChange={val => onFilterChange('daysToExpiry', val)} />
                                ) : col.key === 'expiryDate' ? (
                                    <div className="flex gap-1">
                                        <input type="date" value={filters.expiryDate_start} onChange={e => onFilterChange('expiryDate_start', e.target.value)} className="input p-1 text-xs" />
                                        <input type="date" value={filters.expiryDate_end} onChange={e => onFilterChange('expiryDate_end', e.target.value)} className="input p-1 text-xs" />
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        placeholder={`Filter...`}
                                        value={filters[col.key as keyof Omit<ColumnFilters, 'environment' | 'certificateType' | 'daysToExpiry' | 'expiryDate_start' | 'expiryDate_end'>] as string}
                                        onChange={e => onFilterChange(col.key as keyof ColumnFilters, e.target.value)}
                                        className="input p-1 text-xs"
                                    />
                                )}
                            </th>
                        ))}
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {certificates.length > 0 ? (
                        certificates.map(cert => (
                           <tr key={cert.id}>
                                {headerConfig.map(col => {
                                    const value = cert[col.key];
                                    let displayValue: React.ReactNode = Array.isArray(value) ? value.join(', ') : String(value);

                                    if (col.key === 'daysToExpiry') {
                                        const days = value as number;
                                        const colorClass = days < 0 ? 'text-danger' : days < 7 ? 'text-warning' : 'text-success';
                                        displayValue = <span className={`font-bold ${colorClass}`}>{days} days</span>;
                                    }
                                    if (col.key === 'expiryDate' || col.key === 'validFrom') {
                                        displayValue = new Date(value as string).toLocaleDateString();
                                    }
                                    
                                    return (
                                        <td key={col.key} style={{ width: columnWidths[col.key] }}>
                                            {displayValue}
                                        </td>
                                    );
                                })}
                                <td className="text-center">
                                    <button onClick={() => onViewDetails(cert)} className="text-accent font-bold hover:underline" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Details</button>
                                </td>
                           </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={headerConfig.length + 1} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                No certificates found matching your criteria.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CertificateTable;
