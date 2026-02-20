import { supabase } from './supabase';

export type Prompt = {
    name: string;
    prompt: string;
};

// Cache for prompts to avoid repeated database calls
const promptCache: Record<string, string> = {};

export const PromptService = {
    /**
     * Get a single prompt by name, with caching
     * Throws error if prompt not found
     */
    async getPrompt(name: string): Promise<string> {
        // Validate input
        if (!name || typeof name !== 'string') {
            throw new Error(`Invalid prompt name: ${name}`);
        }

        // Return cached version if available
        if (promptCache[name]) {
            return promptCache[name];
        }

        const { data, error } = await supabase
            .from('prompts')
            .select('prompt')
            .eq('name', name)
            .single();

        if (error || !data) {
            throw new Error(`Prompt '${name}' not found in database`);
        }

        // Cache the result
        promptCache[name] = data.prompt;
        return data.prompt;
    },

    /**
     * Replace template variables in a prompt
     * Variables should be in format {{ VARIABLE_NAME }}
     */
    replaceTemplateVariables(template: string, replacements: Record<string, string>): string {
        return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, variable) => {
            return replacements[variable] ?? match;
        });
    },

    /**
     * Clear the prompt cache (useful for testing)
     */
    clearCache() {
        Object.keys(promptCache).forEach(key => delete promptCache[key]);
    }
};

export const CHAT_STATES = [
    'start',
    'long_time_no_see',
    'exploration',
    'problem_solving',
    'crisis',
    'updates_from_yesterday',
    'maintenance',
] as const;

export type ChatState = (typeof CHAT_STATES)[number];

export const DEFAULT_STATE: ChatState = 'start';
