
import React from 'react';
import { Certificate } from '../types';

interface ComplianceTableProps {
    certificates: Certificate[];
}

const ComplianceTable: React.FC<ComplianceTableProps> = ({ certificates }) => {
    // Filter for "Risk" items: Expired, Expiring Soon, or Weak Algo (mocked logic for weak algo)
    const riskItems = certificates
        .filter(c => c.daysToExpiry < 30 || c.signatureAlgorithm.includes('SHA1'))
        .sort((a, b) => a.daysToExpiry - b.daysToExpiry)
        .slice(0, 7); // Top 7 risks

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr>
                        <th className="p-2 text-xs font-bold text-secondary uppercase border-b border-border">Common Name</th>
                        <th className="p-2 text-xs font-bold text-secondary uppercase border-b border-border">Issue</th>
                        <th className="p-2 text-xs font-bold text-secondary uppercase border-b border-border text-right">Days Left</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {riskItems.map(cert => (
                        <tr key={cert.id} className="group hover:bg-highlight/20 transition-colors">
                            <td className="p-2 border-b border-border/50 truncate max-w-[150px] font-mono text-xs text-primary">
                                {cert.commonName}
                            </td>
                            <td className="p-2 border-b border-border/50">
                                {cert.daysToExpiry < 0 ? (
                                    <span className="px-1.5 py-0.5 rounded bg-danger/10 text-danger text-[10px] font-bold border border-danger/20">EXPIRED</span>
                                ) : cert.daysToExpiry < 7 ? (
                                    <span className="px-1.5 py-0.5 rounded bg-warning/10 text-warning text-[10px] font-bold border border-warning/20">CRITICAL</span>
                                ) : (
                                    <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-bold border border-accent/20">WARNING</span>
                                )}
                            </td>
                            <td className="p-2 border-b border-border/50 text-right font-mono text-xs text-primary">
                                {cert.daysToExpiry}
                            </td>
                        </tr>
                    ))}
                    {riskItems.length === 0 && (
                        <tr>
                            <td colSpan={3} className="p-4 text-center text-xs text-secondary">No immediate compliance risks detected.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ComplianceTable;
