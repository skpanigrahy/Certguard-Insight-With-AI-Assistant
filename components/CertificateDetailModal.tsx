
import React, { useState } from 'react';
import { Certificate } from '../types';
import CloseIcon from './icons/CloseIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface CertificateDetailModalProps {
  certificate: Certificate;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({ label, value, mono = false }) => (
    <div className="py-3" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
        <dt className="text-sm font-bold text-secondary">{label}</dt>
        <dd className={`text-sm text-primary ${mono ? 'font-mono' : ''}`} style={{ fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{value}</dd>
    </div>
);

const ChainCertificateView: React.FC<{ certificate: Certificate }> = ({ certificate }) => (
    <div className="p-4 rounded-b-md" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <dl className="divide-y" style={{ borderTop: '1px solid var(--border)' }}>
            <DetailRow label="Common Name" value={certificate.commonName} mono />
            <DetailRow label="Subject" value={certificate.subject} mono />
            <DetailRow label="Issuer" value={certificate.issuer} mono />
            <DetailRow label="Serial Number" value={certificate.serialNumber} mono />
            <DetailRow label="Expires" value={`${new Date(certificate.expiryDate).toLocaleString()} (${certificate.daysToExpiry} days left)`} />
            <DetailRow label="Valid From" value={new Date(certificate.validFrom).toLocaleString()} />
            <DetailRow label="Version" value={certificate.version} />
            <DetailRow label="Signature Algorithm" value={certificate.signatureAlgorithm} />
            <DetailRow label="Subject Alternative Names (SANs)" value={
                <ul className="list-disc list-inside" style={{ listStyleType: 'disc', paddingLeft: '1rem' }}>
                    {certificate.san.map(name => <li key={name}>{name}</li>)}
                </ul>
            } mono />
        </dl>
    </div>
);


const CertificateDetailModal: React.FC<CertificateDetailModalProps> = ({ certificate, onClose }) => {
  const [expandedChainCertId, setExpandedChainCertId] = useState<string | null>(null);
  
  const fullChain = [certificate, ...certificate.chain];

  const toggleChainCert = (id: string) => {
    setExpandedChainCertId(prevId => (prevId === id ? null : id));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 z-10" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h3 className="font-bold">Certificate Details</h3>
            <button onClick={onClose} className="btn-icon">
              <CloseIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="overflow-y-auto" style={{ flex: 1 }}>
            <div className="p-6">
                <dl>
                    <DetailRow label="Product" value={certificate.product} />
                    <DetailRow label="SEAL ID" value={certificate.sealId} />
                    <DetailRow label="Application" value={certificate.application} />
                    <DetailRow label="Component" value={certificate.component} />
                    <DetailRow label="Environment" value={certificate.environment} />
                    <DetailRow label="Host Location" value={certificate.hostLocation} />
                    <DetailRow label="Instance Host" value={certificate.instanceHost} mono />
                    <DetailRow label="Expires" value={`${new Date(certificate.expiryDate).toLocaleString()} (${certificate.daysToExpiry} days left)`} />
                </dl>
                <div className="mt-8">
                    <h4 className="font-bold mb-4">Certificate Chain</h4>
                    <div className="flex-col gap-2" style={{ display: 'flex', gap: '0.5rem' }}>
                        {fullChain.map((cert, index) => (
                            <div key={cert.id} className="flex items-start" style={{ paddingLeft: `${index * 24}px` }}>
                            {index > 0 && <span className="text-secondary" style={{ paddingTop: '0.75rem', paddingRight: '0.5rem' }}>└─</span>}
                            <div className="flex-grow" style={{ width: '100%' }}>
                                <button 
                                    onClick={() => toggleChainCert(cert.id)} 
                                    className={`w-full flex items-center justify-between p-3 text-left`}
                                    style={{ 
                                        width: '100%',
                                        backgroundColor: 'var(--bg-highlight)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        borderRadius: expandedChainCertId === cert.id ? '0.375rem 0.375rem 0 0' : '0.375rem'
                                    }}
                                >
                                    <div>
                                        <p className="font-mono text-sm" style={{ fontFamily: 'monospace' }}>{cert.commonName}</p>
                                        <p className="text-xs text-secondary">Issuer: {cert.issuer}</p>
                                    </div>
                                    {expandedChainCertId === cert.id ? <ChevronDownIcon className="w-5 h-5 text-secondary" /> : <ChevronRightIcon className="w-5 h-5 text-secondary" />}
                                </button>
                                {expandedChainCertId === cert.id && <ChainCertificateView certificate={cert} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateDetailModal;
