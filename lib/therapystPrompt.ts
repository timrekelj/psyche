import { PromptService, type ChatState, CHAT_STATES } from './promptService';

export { CHAT_STATES };

export type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
    createdAt?: string;
    state?: ChatState;
    source?: 'mistral' | 'apple';
};

// Format messages for prompt
export function formatTranscript(messages: ChatMessage[]): string {
    return messages.map(m => {
        const speaker = m.role === 'user' ? 'User' : 'Therapyst';
        const stateSuffix = m.role === 'assistant' && m.state ? ` (${m.state})` : '';
        
        // Format date and time if available
        const dateTimeSuffix = m.createdAt ? formatMessageDateTime(m.createdAt) : '';
        
        return `${speaker}${stateSuffix}${dateTimeSuffix}: ${m.content}`;
    }).join('\n');
}

// Helper function to format message date and time
function formatMessageDateTime(isoString: string): string {
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) {
            return ''; // Invalid date
        }
        
        // Format: " (YYYY-MM-DD HH:MM)"
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return ` (${year}-${month}-${day} ${hours}:${minutes})`;
    } catch (error) {
        console.warn('Failed to format message date:', error);
        return '';
    }
}

// Build the complete prompt with all variables
export async function buildTherapystPrompt({
    messages,
    summary,
    chatState,
}: {
    messages: ChatMessage[];
    summary: string;
    chatState: ChatState;
}): Promise<string> {
    try {
        // Validate chatState
        if (!chatState || (CHAT_STATES && !CHAT_STATES.includes(chatState))) {
            console.warn(`Invalid chatState: ${chatState}, falling back to 'start'`);
            chatState = 'start';
        }

        // Fetch all required prompts from database
        const [mainPrompt, statePrompt] = await Promise.all([
            PromptService.getPrompt('therapist_main'),
            PromptService.getPrompt(`state_${chatState}`),
        ]);

        // Get last 50 messages for history
        const chatHistory = messages.slice(-50);
        const lastUserMessage = messages
            .slice()
            .reverse()
            .find(m => m.role === 'user')?.content || '(no user messages)';

        // Replace all variables in the main prompt
        const finalPrompt = PromptService.replaceTemplateVariables(mainPrompt, {
            SUMMARY: summary,
            CHAT_HISTORY: formatTranscript(chatHistory),
            CURRENT_STATE_INSTRUCTIONS: statePrompt,
            LAST_USER_MESSAGE: lastUserMessage,
            ALLOWED_STATES: CHAT_STATES ? CHAT_STATES.join(', ') : 'start,continue,reflect,summarize,end',
        });

        return finalPrompt;
    } catch (error) {
        console.error('Failed to build prompt:', error);
        throw new Error(`Failed to build prompt: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Generate summary of recent messages
export async function generateSummary(
    messages: ChatMessage[],
    existingSummary: string
): Promise<string> {
    const prompt = await PromptService.getPrompt('summary_prompt');

    // Get recent messages for summary (last 8 messages)
    const recentMessages = messages.slice(-8);
    const recentTranscript = formatTranscript(recentMessages);

    // Replace variables in summary prompt
    const finalPrompt = PromptService.replaceTemplateVariables(prompt, {
        EXISTING_SUMMARY: existingSummary,
        RECENT_MESSAGES: recentTranscript,
    });

    return finalPrompt;
}
