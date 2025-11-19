
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Certificate, ColumnFilters, ChatMessage } from '../types';
import { AIService } from '../services/aiService';
import CloseIcon from './icons/CloseIcon';
import SendIcon from './icons/SendIcon';
import SparklesIcon from './icons/SparklesIcon';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';
import TrashIcon from './icons/TrashIcon';
import LightBulbIcon from './icons/LightBulbIcon';

interface ChatWidgetProps {
    isOpen: boolean;
    onClose: () => void;
    allCertificates: Certificate[];
    onApplyFilter: (filters: Partial<ColumnFilters>) => void;
    onResetFilter: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, onClose, allCertificates, onApplyFilter, onResetFilter }) => {
    // State stores the conversation history
    const [messages, setMessages] = useState<ChatMessage[]>([
        { 
            role: 'assistant', 
            content: 'Hi! I am CertGuardian AI. I can help you analyze certificates, filter your dashboard, or explain security concepts.\n\nTry asking: **"Show me certificates expiring next week in PROD"**.', 
            timestamp: Date.now() 
        }
    ]);
    
    const [inputValue, setInputValue] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            setTimeout(scrollToBottom, 100);
        }
    }, [isOpen, messages, isThinking]);

    // Dynamic resizing of textarea
    useEffect(() => {
        if (textareaRef.current) {
            // Reset height to auto to get the correct scrollHeight for shrinking
            textareaRef.current.style.height = 'auto';
            // Set new height based on scrollHeight, capped at 120px
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
            
            // Add overflow-y auto only if content exceeds max height
            if (textareaRef.current.scrollHeight > 120) {
                textareaRef.current.style.overflowY = 'auto';
            } else {
                textareaRef.current.style.overflowY = 'hidden';
            }
        }
    }, [inputValue]);

    const processUserMessage = async (userContent: string) => {
        const newHistory: ChatMessage[] = [
            ...messages, 
            { role: 'user', content: userContent, timestamp: Date.now() }
        ];
        setMessages(newHistory);
        setIsThinking(true);

        try {
            const response = await AIService.sendMessage(newHistory, allCertificates);

            setMessages(prev => [
                ...prev, 
                { role: 'assistant', content: response.text, timestamp: Date.now() }
            ]);

            if (response.action) {
                if (response.action.type === 'RESET') {
                    onResetFilter();
                } else if (response.action.type === 'FILTER') {
                    const payload = response.action.payload;
                    const newFilters: Partial<ColumnFilters> = {};

                    if (payload.environment) {
                        newFilters.environment = Array.isArray(payload.environment) 
                            ? payload.environment 
                            : [payload.environment];
                    }
                    if (payload.product) newFilters.product = payload.product;
                    if (payload.commonName) newFilters.commonName = payload.commonName;
                    if (payload.sealId) newFilters.sealId = payload.sealId;
                    if (payload.issuer) newFilters.issuer = payload.issuer;
                    
                    // Handle Explicit Date Ranges (e.g., "Next 30 days")
                    if (payload.expiryDate_start) newFilters.expiryDate_start = payload.expiryDate_start;
                    if (payload.expiryDate_end) newFilters.expiryDate_end = payload.expiryDate_end;

                    // Handle Status Shortcuts
                    if (payload.status === 'expired') {
                        newFilters.daysToExpiry = { operator: '<', value1: '0', value2: '' };
                    } else if (payload.status === 'expiring_soon') {
                        newFilters.daysToExpiry = { operator: 'between', value1: '0', value2: '7' };
                    } else if (payload.status === 'healthy') {
                         newFilters.daysToExpiry = { operator: '>=', value1: '7', value2: '' };
                    }
                    
                    onApplyFilter(newFilters);
                }
            }

        } catch (error) {
            console.error("Chat Error", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong. Please try again.", timestamp: Date.now() }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;
        const text = inputValue;
        setInputValue('');
        await processUserMessage(text);
    };

    const handleExplain = (content: string) => {
        // We send a special formatted message that our AI Service knows how to intercept
        // Truncate for brevity if needed
        const snippet = content.length > 100 ? content.substring(0, 100) + '...' : content;
        const text = `Explain: "${snippet}"`;
        processUserMessage(text);
    };

    const handleClearChat = () => {
        setMessages([
            { 
                role: 'assistant', 
                content: 'Hi! I am CertGuardian AI. I can help you analyze certificates, filter your dashboard, or explain security concepts.\n\nTry asking: **"Show me certificates expiring next week in PROD"**.', 
                timestamp: Date.now() 
            }
        ]);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        // Allow Shift+Enter for new line, but Enter sends the message
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <>
            {/* Backdrop */}
            <div className={`chat-sidebar-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} />

            {/* Sidebar Drawer */}
            <div className={`chat-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="chat-header">
                    <div className="chat-title">
                        <SparklesIcon className="w-6 h-6 text-accent" />
                        <span>AI Assistant</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={handleClearChat} 
                            className="btn-icon" 
                            title="Clear conversation history"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="btn-icon" title="Close">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="chat-messages">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message-bubble ${msg.role === 'user' ? 'message-user' : 'message-bot'}`}>
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                            
                            <div className="message-actions">
                                <button 
                                    className="action-btn" 
                                    onClick={() => handleExplain(msg.content)}
                                    title="Explain this"
                                >
                                    <LightBulbIcon className="w-4 h-4" />
                                </button>
                                <button 
                                    className="action-btn" 
                                    onClick={() => handleCopy(msg.content, idx)}
                                    title="Copy to clipboard"
                                >
                                    {copiedIndex === idx ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    ))}
                    {isThinking && (
                        <div className="typing-indicator">
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-area">
                    <textarea 
                        ref={textareaRef}
                        className="chat-input" 
                        placeholder="Ask about your certificates..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        rows={1}
                        style={{ overflow: 'hidden' }} // Initial overflow hidden for cleanliness
                    />
                    <button 
                        onClick={handleSendMessage} 
                        disabled={!inputValue.trim() || isThinking} 
                        className="btn-primary rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </>
    );
};

export default ChatWidget;
