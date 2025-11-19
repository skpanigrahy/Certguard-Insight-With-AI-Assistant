
export enum CertificateType {
  SERVER = 'Server',
  CLIENT = 'Client',
}

export enum Environment {
  PROD = 'PROD',
  UAT = 'UAT',
  DEV = 'DEV',
  QA = 'QA',
}

export interface DaysToExpiryFilter {
  operator: 'between' | '>' | '<' | '=' | '>=' | '<=';
  value1: string;
  value2: string;
}

export interface ColumnFilters {
  product: string;
  sealId: string;
  application: string;
  environment: string[];
  component: string;
  commonName: string;
  expiryDate_start: string;
  expiryDate_end: string;
  daysToExpiry: DaysToExpiryFilter;
  certificateType: string[];
  issuer: string;
  serialNumber: string;
  san: string;
  hostLocation: string;
  instanceHost: string;
}

export interface Certificate {
  id: string;
  product: string;
  sealId: string;
  application: string;
  environment: Environment;
  component: string;
  commonName: string;
  expiryDate: string;
  daysToExpiry: number;
  certificateType: CertificateType;
  issuer: string;
  subject: string;
  serialNumber: string;
  san: string[];
  hostLocation: string;
  instanceHost: string;
  signatureAlgorithm: string;
  validFrom: string;
  version: number;
  chain: Certificate[];
}

export interface NotificationSettings {
  enabled: boolean;
  type: 'in-app' | 'email';
  emailAddress: string;
  thresholds: number[];
}

export interface AppNotification {
  id: string; // unique id for the notification
  certificateId: string;
  certificateCommonName: string;
  message: string;
  timestamp: number;
  isRead: boolean;
}

// --- AI / Chat Types ---

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AIAction {
  type: 'FILTER' | 'RESET' | 'NONE';
  payload?: any;
}

export interface AIChatResponse {
  text: string;
  action?: AIAction;
}

// --- Knowledge Base Types ---

export interface KnowledgeBaseItem {
    id: string;
    title: string;
    category: 'General' | 'Troubleshooting' | 'Policy' | 'Best Practice';
    content: string;
    source: 'Confluence' | 'Teams' | 'Blog' | 'Manual';
    addedBy: string;
    dateAdded: number;
    status: 'approved' | 'pending'; // New field for governance
}
