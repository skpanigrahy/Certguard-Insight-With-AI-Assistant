
import { Certificate, ChatMessage, AIChatResponse, ColumnFilters, KnowledgeBaseItem } from '../types';

/**
 * Configuration for your Internal AI Wrapper / Proxy.
 * In a real app, these should come from process.env
 */
const AI_CONFIG = {
    // Replace this with your organization's wrapper URL
    // e.g., "https://api.mycompany.com/ai/v1/chat/completions"
    ENDPOINT: '/api/ai/chat', 
    
    // If your wrapper needs an API key or token
    API_KEY: 'YOUR_INTERNAL_TOKEN', 
    
    // The model ID you want to request from your internal wrapper
    MODEL: 'gpt-4-turbo', 
    
    // --- UNIFIED KNOWLEDGE BASE CONFIGURATION ---
    // This configuration tells your backend wrapper which vector stores to search.
    RAG_CONFIG: {
        ENABLED: true,
        SOURCES: {
            CONFLUENCE: true,      // Official Docs & Policies
            INTERNAL_BLOGS: true,  // Best Practices & Announcements
            MS_TEAMS_SUPPORT: true // Historical Q&A from Support Channels
        },
        // ID of the vector collection containing your ingested documents
        COLLECTION_ID: 'certguardian-unified-kb-v1'
    }
};

/**
 * This service is responsible for formatting the prompt and calling the API.
 * It acts as an Adapter. You can change the 'fetch' logic inside sendMessage
 * to match whatever signature your internal wrapper expects.
 */
export const AIService = {

    /**
     * Intelligent Context Builder.
     * Updated to include granular details: validFrom, version, signatureAlgorithm.
     * We generate a Condensed Inventory so the AI can perform "in-context" analysis.
     */
    buildSystemContext: (certificates: Certificate[]): string => {
        // 1. Calculate Statistics
        const total = certificates.length;
        const byEnv: Record<string, number> = {};
        const byProduct: Record<string, number> = {};
        const byIssuer: Record<string, number> = {};
        const byAlgo: Record<string, number> = {};
        const byVersion: Record<string, number> = {};

        certificates.forEach(c => {
            // Counts
            byEnv[c.environment] = (byEnv[c.environment] || 0) + 1;
            byProduct[c.product] = (byProduct[c.product] || 0) + 1;
            byIssuer[c.issuer] = (byIssuer[c.issuer] || 0) + 1;
            byAlgo[c.signatureAlgorithm] = (byAlgo[c.signatureAlgorithm] || 0) + 1;
            byVersion[`v${c.version}`] = (byVersion[`v${c.version}`] || 0) + 1;
        });

        // 2. Generate Condensed Inventory (Max 100 to preserve context, or filtering logic can be applied)
        // Format: ID | CN | Env | Algo | Ver | ValidFrom | DaysLeft
        const condensedInventory = certificates.slice(0, 100).map(c => 
            `| ${c.sealId} | ${c.commonName} | ${c.environment} | ${c.signatureAlgorithm} | v${c.version} | ${c.validFrom.split('T')[0]} | ${c.daysToExpiry} days`
        ).join('\n');

        const today = new Date().toISOString().split('T')[0];

        // 3. Load Knowledge Base Titles (to hint what is available)
        // CRITICAL: Only load APPROVED items.
        let kbHints = "";
        try {
            const allItems: KnowledgeBaseItem[] = JSON.parse(localStorage.getItem('certguardian_kb_items') || '[]');
            const approvedItems = allItems.filter(i => i.status === 'approved');
            
            if (approvedItems.length > 0) {
                kbHints = "AVAILABLE KNOWLEDGE BASE TOPICS:\n" + approvedItems.map(i => `- ${i.title} (${i.category})`).join('\n');
            }
        } catch (e) {}

        // 4. Format the Context String
        const summary = `
TODAY'S DATE: ${today}

STATISTICAL SUMMARY:
- Total Certificates: ${total}
- By Environment: ${JSON.stringify(byEnv)}
- By Product: ${JSON.stringify(byProduct)}
- Top Issuers: ${JSON.stringify(byIssuer)}
- Signature Algorithms: ${JSON.stringify(byAlgo)}
- Versions: ${JSON.stringify(byVersion)}

CONDENSED CERTIFICATE INVENTORY (Top 100):
| SEAL ID | Common Name | Env | Sig Algo | Ver | Valid From | Expires In |
|---|---|---|---|---|---|---|
${condensedInventory}
${certificates.length > 100 ? `... (and ${certificates.length - 100} more)` : ''}

${kbHints}
`;

        return `
You are CertGuardian AI, an expert DevOps assistant.
Your goal is to help users query certificate data AND resolve support issues using the **Unified Knowledge Base**.

${summary}

INSTRUCTIONS:
1. **Data Queries:** Answer questions based on the STATISTICAL SUMMARY and CONDENSED CERTIFICATE INVENTORY above.
2. **Unified Support (RAG):** You have access to a dynamic internal Knowledge Base containing Troubleshooting steps, Policies, and Best Practices.
   
   **ZERO HALLUCINATION POLICY:**
   - If the user asks a conceptual or troubleshooting question (e.g., "How do I...", "What is..."), you MUST only answer if the information is present in your Knowledge Base or the provided Certificate Data.
   - If you cannot find the answer in the context, you MUST deny the request politely. 
     Example: "I searched the Knowledge Base but couldn't find specific information regarding [topic]. Please contact the platform team directly or add the solution to the Knowledge Base Manager."

3. **Filtering:** If the user asks to FILTER the view, you MUST return a JSON object at the very end of your response.
   - Map relative dates (e.g., "next 6 months", "next 30 days") to specific "YYYY-MM-DD" values for 'expiryDate_start' and 'expiryDate_end' based on TODAY'S DATE.

RESPONSE FORMAT:
Reply in Markdown.
If an action is required, append this JSON block at the very end:

\`\`\`json
{
  "action": "FILTER",
  "payload": {
    "environment": ["PROD"], 
    "product": "Jira",
    "sealId": "SEAL001",
    "status": "expired", // options: "expired", "expiring_soon", "healthy"
    "expiryDate_start": "2024-01-01", // Set to "" to include past dates (expired)
    "expiryDate_end": "2024-06-01",
    "issuer": "DigiCert"
  }
}
\`\`\`

OR to reset:
\`\`\`json
{ "action": "RESET" }
\`\`\`
        `;
    },

    /**
     * Sends the message to the Generic API.
     */
    sendMessage: async (
        history: ChatMessage[], 
        currentCertificates: Certificate[]
    ): Promise<AIChatResponse> => {
        
        const systemContext = AIService.buildSystemContext(currentCertificates);

        const messagesPayload = [
            { role: 'system', content: systemContext },
            ...history.map(msg => ({ role: msg.role, content: msg.content }))
        ];

        try {
            // --- MOCK IMPLEMENTATION (For Demo Purposes) ---
            const rawText = await mockAIResponse(history[history.length - 1].content, currentCertificates);
            // -----------------------------------------------

            return parseResponse(rawText);

        } catch (error) {
            console.error("AI Service Failed:", error);
            return {
                text: "I'm sorry, I'm having trouble connecting to the AI service right now. Please check your network or configuration.",
                action: { type: 'NONE' }
            };
        }
    }
};

/**
 * Helper to parse the text and extract JSON actions if present.
 */
function parseResponse(text: string): AIChatResponse {
    const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonBlockRegex);

    if (match && match[1]) {
        try {
            const actionData = JSON.parse(match[1]);
            const cleanText = text.replace(jsonBlockRegex, '').trim();
            return {
                text: cleanText,
                action: {
                    type: actionData.action,
                    payload: actionData.payload
                }
            };
        } catch (e) {
            return { text: text, action: { type: 'NONE' } };
        }
    }

    return { text: text, action: { type: 'NONE' } };
}

/**
 * SIMULATED BACKEND LOGIC with ZERO HALLUCINATION check
 */
async function mockAIResponse(userMsg: string, certs: Certificate[]): Promise<string> {
    await new Promise(r => setTimeout(r, 800)); // Latency

    const lower = userMsg.toLowerCase();

    // --- 1. HANDLE EXPLANATION REQUESTS (PRIORITY) ---
    if (lower.startsWith('explain:')) {
        const parts = userMsg.split(/explain:\s*"?/i);
        const targetContent = parts[1] ? parts[1].replace(/"$/, '') : lower;
        const lowerTarget = targetContent.toLowerCase();

        if (lowerTarget.includes('filter') || lowerTarget.includes('filtered') || lowerTarget.includes('showing')) {
            return `### 🔍 What just happened?
I applied a **Filter** to your dashboard data. 

**Why is this useful?**
Instead of searching through 150+ rows, filtering isolates only the certificates that match your specific criteria (like a date range or environment). This allows you to focus on immediate risks.

**Technical Context:**
I updated the \`ColumnFilters\` state in the React application to exclude any record that doesn't match the criteria you specified.`;
        }
        if (lowerTarget.includes('seal')) {
            return `### 🏷️ Concept: SEAL ID
**SEAL** stands for **Service Enrollment & Application Lookup**. 
It maps IT assets to cost centers and ownership. Filtering by SEAL ID shows "only what I own".`;
        }
        if (lowerTarget.includes('expir')) {
            return `### ⚠️ Concept: Certificate Expiry
**What does it mean?**
TLS Certificates have a validity period. When they expire, services go down.
**The Warning:** 'Expiring Soon' means < 7 days left, requiring immediate action.`;
        }
        if (lowerTarget.includes('prod')) {
             return `### 🌍 Concept: Environments
**PROD:** Live systems. Outages here lose revenue.
**DEV/QA:** Testing environments.`;
        }
        if (lowerTarget.includes('reset')) {
             return `### 🔄 Action: Reset
I cleared all active filters, returning the dashboard to its default view showing **All Certificates**.`;
        }
        return `### 💡 Context
You asked me to explain: *"${targetContent.substring(0, 50)}..."*
This appears to be data from the current view or a command I just executed.`;
    }

    // --- 2. CHECK DATA QUERIES (DASHBOARD ACTIONS) ---
    if (lower.includes('filter') || lower.includes('show') || lower.includes('reset') || lower.includes('clear') || lower.includes('expire') || lower.includes('prod') || lower.includes('digicert') || lower.includes('issuer') || lower.includes('count') || lower.includes('many') || lower.includes('seal')) {
         
         if (lower.includes('reset') || lower.includes('clear')) {
            return `I have reset all filters for you.\n\n\`\`\`json\n{\n  "action": "RESET"\n}\n\`\`\``;
        }
        
        const daysMatch = userMsg.match(/(\d+)\s*days/i);
        const monthsMatch = userMsg.match(/(\d+)\s*months/i);
        const sealMatch = userMsg.match(/seal\s?(\d+)/i);
        
        // Check for date range intent OR specific field intent like Seal ID or Environment
        if (daysMatch || monthsMatch || sealMatch || lower.includes('expire') || lower.includes('prod') || lower.includes('dev') || lower.includes('uat') || lower.includes('qa')) {
            
            const today = new Date();
            const future = new Date();
            let durationLabel = '';
            const formatDate = (d: Date) => d.toISOString().split('T')[0];
            
            const payload: any = {};

            // --- Handle SEAL ID ---
            if (sealMatch) {
                const sealId = `SEAL${sealMatch[1].padStart(3, '0')}`;
                payload.sealId = sealId;
            }

            // --- Handle Environment ---
            if (lower.includes('prod')) payload.environment = "PROD";
            else if (lower.includes('dev')) payload.environment = "DEV";
            else if (lower.includes('uat')) payload.environment = "UAT";
            else if (lower.includes('qa')) payload.environment = "QA";

            // --- Handle Date Logic ---
            if (daysMatch || monthsMatch) {
                if (daysMatch) {
                    const days = parseInt(daysMatch[1], 10);
                    future.setDate(today.getDate() + days);
                    durationLabel = `${days} days`;
                } else if (monthsMatch) {
                     const months = parseInt(monthsMatch[1], 10);
                     future.setMonth(today.getMonth() + months);
                     durationLabel = `${months} months`;
                }

                // Improved Logic for "Expired OR Expiring" detection
                // We check for 'already', 'past', 'history', or explicit 'expired' usage
                // Also safe check for 'or' word boundary
                const includeExpired = 
                    lower.includes('expired') || 
                    lower.includes('past') || 
                    lower.includes('history') || 
                    lower.includes('already') ||
                    lower.includes('previous') ||
                    /\bor\b/.test(lower);
                
                if (includeExpired) {
                    // Clear the start date to allow past dates (expired)
                    payload.expiryDate_start = ""; 
                } else {
                    // Default to today for "Next X days" (future only)
                    payload.expiryDate_start = formatDate(today);
                }
                
                payload.expiryDate_end = formatDate(future);
            } else if (lower.includes('expired')) {
                 // Just "Expired" without a specific "next X days" range
                 // Implies < Today
                 payload.status = "expired";
            } else if (lower.includes('expiring')) {
                 // "Expiring" usually implies soon
                 payload.status = "expiring_soon";
            }

            // Build Response Text
            let responseText = "I have filtered the view";
            if (payload.sealId) responseText += ` for **${payload.sealId}**`;
            if (payload.environment) responseText += ` in **${payload.environment}**`;
            
            if (payload.expiryDate_end) {
                 if (payload.expiryDate_start === "") {
                     responseText += ` including **Already Expired** certificates and those expiring within the next **${durationLabel}** (until ${payload.expiryDate_end})`;
                 } else {
                     responseText += ` for certificates expiring within the next **${durationLabel}** (until ${payload.expiryDate_end})`;
                 }
            } else if (payload.status === 'expired') {
                responseText += ` showing **Expired** certificates`;
            }

            responseText += ".";

            return `${responseText}\n\n\`\`\`json\n{\n  "action": "FILTER",\n  "payload": ${JSON.stringify(payload)}\n}\n\`\`\``;
        }
        
        // Fallback
        return `I'm analyzing your request against the live dashboard data. I can filter by Environment, SEAL ID, Issuer, or Status.`;
    }
    
    // --- 3. DYNAMIC KNOWLEDGE BASE SEARCH ---
    try {
        const allItems: KnowledgeBaseItem[] = JSON.parse(localStorage.getItem('certguardian_kb_items') || '[]');
        const approvedItems = allItems.filter(i => i.status === 'approved');

        const match = approvedItems.find(item => {
            const keywords = item.title.toLowerCase().split(' ');
            const matchCount = keywords.filter(k => k.length > 3 && lower.includes(k)).length;
            return matchCount >= 1 || lower.includes(item.title.toLowerCase());
        });

        if (match) {
            return `**Found in Knowledge Base (${match.source} - ${match.category}):**\n\n**${match.title}**\n\n${match.content}\n\n*Added by ${match.addedBy} on ${new Date(match.dateAdded).toLocaleDateString()}*`;
        }
        
    } catch (e) { console.error("KB Search failed", e); }

    // --- 4. DENIAL ---
    return `I searched the Unified Knowledge Base but couldn't find approved information regarding **"${userMsg}"**.`;
}
