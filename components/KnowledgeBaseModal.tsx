
import React, { useState, useEffect, useRef } from 'react';
import { KnowledgeBaseItem } from '../types';
import CloseIcon from './icons/CloseIcon';
import TrashIcon from './icons/TrashIcon';
import UploadIcon from './icons/UploadIcon';
import LockIcon from './icons/LockIcon';
import CheckIcon from './icons/CheckIcon';

interface KnowledgeBaseModalProps {
  onClose: () => void;
}

type UserRole = 'Admin' | 'User';

const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({ onClose }) => {
  const [items, setItems] = useState<KnowledgeBaseItem[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'reviews'>('list');
  
  // Role Simulation State
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Admin');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<KnowledgeBaseItem['category']>('General');
  const [source, setSource] = useState<KnowledgeBaseItem['source']>('Manual');
  const [content, setContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('certguardian_kb_items');
    if (saved) {
        try {
            setItems(JSON.parse(saved));
        } catch (e) {
            console.error("Error loading KB items", e);
            setItems([]);
        }
    } else {
        // Default seed data if empty
        const seedData: KnowledgeBaseItem[] = [
            {
                id: 'kb-1',
                title: 'Certificate Pending State',
                category: 'Troubleshooting',
                source: 'Teams',
                content: 'If a certificate is stuck in "Pending", check Network ACLs for api.digicert.com on port 443. Firewall often blocks the validation callback.',
                addedBy: 'System',
                dateAdded: Date.now(),
                status: 'approved'
            },
            {
                id: 'kb-2',
                title: 'Wildcard Policy',
                category: 'Policy',
                source: 'Blog',
                content: 'Wildcard certificates (*.example.com) are strictly prohibited in Production environments to limit blast radius. Use them only in DEV/QA.',
                addedBy: 'System',
                dateAdded: Date.now(),
                status: 'approved'
            }
        ];
        setItems(seedData);
        localStorage.setItem('certguardian_kb_items', JSON.stringify(seedData));
    }
  }, []);

  const saveItems = (newItems: KnowledgeBaseItem[]) => {
      setItems(newItems);
      localStorage.setItem('certguardian_kb_items', JSON.stringify(newItems));
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
        alert("Please provide both a title and content.");
        return;
    }

    const newItem: KnowledgeBaseItem = {
        id: `kb-${Date.now()}`,
        title: title.trim(),
        category,
        source,
        content: content.trim(),
        addedBy: currentUserRole, // Simulating who added it
        dateAdded: Date.now(),
        status: currentUserRole === 'Admin' ? 'approved' : 'pending' // Auto-approve if Admin, else Pending
    };

    saveItems([newItem, ...items]);
    
    // Reset form
    setTitle('');
    setContent('');
    setActiveTab('list');
    
    const msg = currentUserRole === 'Admin' 
        ? "Article saved and published immediately." 
        : "Article submitted for review. An admin must approve it before the AI uses it.";
    alert(msg);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
        saveItems(items.filter(i => i.id !== id));
    }
  };

  const handleApprove = (id: string) => {
      const updated = items.map(i => i.id === id ? { ...i, status: 'approved' as const } : i);
      saveItems(updated);
  };

  const handleReject = (id: string) => {
      if (window.confirm("Reject and delete this submission?")) {
          saveItems(items.filter(i => i.id !== id));
      }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          const text = e.target?.result;
          if (typeof text === 'string') {
              setContent(prev => prev ? prev + '\n\n' + text : text);
              if (!title) {
                  const fileName = file.name.split('.').slice(0, -1).join('.');
                  setTitle(fileName.charAt(0).toUpperCase() + fileName.slice(1).replace(/[-_]/g, ' '));
              }
          }
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileUpload = () => {
      fileInputRef.current?.click();
  };

  const pendingCount = items.filter(i => i.status === 'pending').length;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '60rem', height: '85vh' }}>
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-light-secondary dark:bg-secondary">
            <div className="flex items-center gap-4">
                <h3 className="font-bold text-lg">Knowledge Base Manager</h3>
                <div className="flex bg-light-highlight dark:bg-highlight rounded-md p-1">
                    <button 
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === 'list' ? 'bg-accent text-white' : 'text-text-secondary'}`}
                        onClick={() => setActiveTab('list')}
                    >
                        Approved Articles
                    </button>
                    {currentUserRole === 'Admin' && (
                        <button 
                            className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-2 ${activeTab === 'reviews' ? 'bg-accent text-white' : 'text-text-secondary'}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Pending Reviews
                            {pendingCount > 0 && <span className="bg-danger text-white text-[10px] px-1.5 rounded-full">{pendingCount}</span>}
                        </button>
                    )}
                    <button 
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === 'add' ? 'bg-accent text-white' : 'text-text-secondary'}`}
                        onClick={() => setActiveTab('add')}
                    >
                        {currentUserRole === 'Admin' ? 'Add Article' : 'Submit Draft'}
                    </button>
                </div>
            </div>
            <button onClick={onClose} className="btn-icon"><CloseIcon className="w-6 h-6" /></button>
        </div>

        {/* Role Simulator (For Demo Purpose) */}
        <div className="bg-light-highlight dark:bg-highlight px-6 py-2 flex justify-between items-center text-xs border-b border-border">
            <span className="text-text-secondary font-mono">MODE: {currentUserRole.toUpperCase()}</span>
            <button 
                onClick={() => setCurrentUserRole(prev => prev === 'Admin' ? 'User' : 'Admin')}
                className="text-accent hover:underline"
            >
                Switch to {currentUserRole === 'Admin' ? 'Standard User' : 'Admin'} View (Simulation)
            </button>
        </div>

        {/* Banner */}
        <div className="banner-warning">
            <LockIcon className="w-4 h-4 flex-shrink-0" />
            <span>
                {currentUserRole === 'Admin' 
                    ? 'Admin Mode: You have full access to Approve, Reject, and Publish articles.' 
                    : 'Contributor Mode: Your submissions will require Admin approval before training the AI.'}
            </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-light-primary dark:bg-primary">
            {/* VIEW LIST TAB */}
            {activeTab === 'list' && (
                <div className="space-y-4">
                    {items.filter(i => i.status === 'approved').length === 0 ? (
                         <div className="text-center py-12 text-text-secondary">No approved articles found.</div>
                    ) : (
                        items.filter(i => i.status === 'approved').map(item => (
                            <div key={item.id} className="card relative group hover:border-accent transition-colors border-l-4 border-l-success">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-accent">{item.title}</h4>
                                            <span className="text-[10px] bg-success/10 text-success border border-success/20 px-1.5 rounded">APPROVED</span>
                                        </div>
                                        <div className="flex gap-2 mt-1 text-xs text-text-secondary">
                                            <span className="px-2 py-0.5 rounded-full bg-light-highlight dark:bg-highlight border border-border font-medium">{item.category}</span>
                                            <span className="px-2 py-0.5 rounded-full bg-light-highlight dark:bg-highlight border border-border">{item.source}</span>
                                            <span>Added by {item.addedBy}</span>
                                        </div>
                                    </div>
                                    {currentUserRole === 'Admin' && (
                                        <button 
                                            onClick={() => handleDelete(item.id)} 
                                            className="btn-icon text-danger hover:bg-red-100 dark:hover:bg-red-900/30"
                                            title="Delete Article"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="bg-light-highlight dark:bg-highlight/50 p-3 rounded-md mt-3">
                                    <p className="text-sm text-text-primary whitespace-pre-wrap font-mono text-xs">{item.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && currentUserRole === 'Admin' && (
                <div className="space-y-4">
                    {items.filter(i => i.status === 'pending').length === 0 ? (
                         <div className="text-center py-12 text-text-secondary">No pending submissions to review.</div>
                    ) : (
                        items.filter(i => i.status === 'pending').map(item => (
                            <div key={item.id} className="card relative border-l-4 border-l-warning">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-text-primary">{item.title}</h4>
                                            <span className="text-[10px] bg-warning/10 text-warning border border-warning/20 px-1.5 rounded animate-pulse">PENDING REVIEW</span>
                                        </div>
                                        <div className="flex gap-2 mt-1 text-xs text-text-secondary">
                                            <span className="px-2 py-0.5 rounded-full bg-light-highlight dark:bg-highlight border border-border">{item.category}</span>
                                            <span>Submitted by <strong>{item.addedBy}</strong></span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleReject(item.id)} className="btn btn-outline text-danger border-danger hover:bg-danger hover:text-white text-xs">Reject</button>
                                        <button onClick={() => handleApprove(item.id)} className="btn btn-primary bg-success hover:bg-green-600 text-xs border-transparent">
                                            <CheckIcon className="w-3 h-3 mr-1" /> Approve
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-light-highlight dark:bg-highlight/50 p-3 rounded-md mt-3">
                                    <p className="text-sm text-text-primary whitespace-pre-wrap font-mono text-xs">{item.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ADD NEW TAB */}
            {activeTab === 'add' && (
                <div className="max-w-3xl mx-auto card space-y-6">
                    <div className="flex justify-between items-center">
                         <h4 className="text-lg font-bold">{currentUserRole === 'Admin' ? 'Add New Article' : 'Submit Draft for Review'}</h4>
                         <button onClick={triggerFileUpload} className="btn btn-outline text-xs">
                            <UploadIcon className="w-4 h-4 mr-2" /> Upload Document
                         </button>
                         <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.md,.json,.csv" className="hidden" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Title <span className="text-danger">*</span></label>
                        <input type="text" className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., How to renew SSL certs" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select className="input" value={category} onChange={(e) => setCategory(e.target.value as any)}>
                                <option>General</option>
                                <option>Troubleshooting</option>
                                <option>Policy</option>
                                <option>Best Practice</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Source</label>
                            <select className="input" value={source} onChange={(e) => setSource(e.target.value as any)}>
                                <option>Manual</option>
                                <option>Confluence</option>
                                <option>Teams</option>
                                <option>Blog</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Content <span className="text-danger">*</span></label>
                        <div className="relative">
                            <textarea className="input min-h-[250px] font-mono text-sm" value={content} onChange={e => setContent(e.target.value)} placeholder="Content..." />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button onClick={() => setActiveTab('list')} className="btn btn-outline">Cancel</button>
                        <button onClick={handleSave} className="btn btn-primary" disabled={!title.trim() || !content.trim()}>
                            {currentUserRole === 'Admin' ? 'Publish Immediately' : 'Submit for Approval'}
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseModal;
