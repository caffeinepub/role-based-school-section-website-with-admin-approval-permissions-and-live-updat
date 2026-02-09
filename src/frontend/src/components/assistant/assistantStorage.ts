const ASSISTANT_OPEN_KEY = 'assistant_open';
const ASSISTANT_HISTORY_KEY = 'assistant_history';
const MAX_HISTORY = 10;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function saveOpenState(isOpen: boolean): void {
  try {
    localStorage.setItem(ASSISTANT_OPEN_KEY, JSON.stringify(isOpen));
  } catch (error) {
    console.error('Failed to save assistant open state:', error);
  }
}

export function loadOpenState(): boolean {
  try {
    const stored = localStorage.getItem(ASSISTANT_OPEN_KEY);
    if (!stored) return false;
    return JSON.parse(stored) as boolean;
  } catch (error) {
    console.error('Failed to load assistant open state:', error);
    return false;
  }
}

export function saveChatHistory(messages: ChatMessage[]): void {
  try {
    const capped = messages.slice(-MAX_HISTORY);
    localStorage.setItem(ASSISTANT_HISTORY_KEY, JSON.stringify(capped));
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
}

export function loadChatHistory(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(ASSISTANT_HISTORY_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as ChatMessage[];
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return [];
  }
}

export function clearChatHistory(): void {
  try {
    localStorage.removeItem(ASSISTANT_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear chat history:', error);
  }
}
