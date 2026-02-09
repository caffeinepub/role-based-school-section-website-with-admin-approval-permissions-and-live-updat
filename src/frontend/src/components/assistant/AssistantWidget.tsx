import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '../../auth/AuthContext';
import { generateResponse, type AssistantResponse } from './assistantEngine';
import { getSuggestions } from './suggestions';
import { guidanceContent, exampleQuestions, type UserRole } from './assistantContent';
import { useAssistantContextData } from './useAssistantContextData';
import { 
  saveOpenState, 
  loadOpenState, 
  saveChatHistory, 
  loadChatHistory, 
  clearChatHistory,
  type ChatMessage 
} from './assistantStorage';
import { useNavigate } from '@tanstack/react-router';

export default function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { sessionRole } = useAuth();
  const contextData = useAssistantContextData();
  const navigate = useNavigate();
  
  // Map session role to assistant role
  const userRole: UserRole = sessionRole === 'admin' ? 'admin' : sessionRole === 'visitor' ? 'visitor' : 'student';
  
  // Load state on mount
  useEffect(() => {
    const savedOpen = loadOpenState();
    const savedHistory = loadChatHistory();
    setIsOpen(savedOpen);
    if (savedHistory.length > 0) {
      setMessages(savedHistory);
    } else {
      // Welcome message
      setMessages([{
        role: 'assistant',
        content: `Hello! I'm your School Portal assistant. I can help you navigate the portal and answer questions about ${userRole === 'admin' ? 'managing the system' : 'finding information'}.\n\nWhat would you like to know?`,
        timestamp: Date.now()
      }]);
    }
  }, []);
  
  // Save state when it changes
  useEffect(() => {
    saveOpenState(isOpen);
  }, [isOpen]);
  
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);
  
  // Auto-scroll to bottom - deferred to next frame for reliability
  useEffect(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  }, [messages]);
  
  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  
  const handleSend = (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: textToSend,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSuggestions([]);
    
    // Generate response
    const response = generateResponse(
      textToSend,
      userRole,
      contextData.isLoading ? undefined : {
        latestNotices: contextData.latestNotices,
        homeworkSummary: contextData.homeworkSummary,
        todayRoutine: contextData.todayRoutine,
        scheduleSummary: contextData.scheduleSummary
      }
    );
    
    // Add assistant response
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: response.text,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    
    // Store action for rendering
    if (response.action) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `__ACTION__${JSON.stringify(response.action)}`,
        timestamp: Date.now()
      }]);
    }
    
    // Show suggestions if provided
    if (response.suggestions) {
      setSuggestions(response.suggestions);
    }
  };
  
  const handleInputChange = (value: string) => {
    setInput(value);
    
    // Generate "Did you mean?" suggestions
    if (value.trim().length > 3) {
      const availableIntents = guidanceContent
        .filter(c => !c.role || c.role.includes(userRole))
        .map(c => ({
          intent: c.intent,
          keywords: c.keywords,
          question: c.keywords[0] // Use first keyword as question text
        }));
      
      const didYouMean = getSuggestions(value, availableIntents);
      if (didYouMean.length > 0) {
        setSuggestions(didYouMean.map(s => s.text));
      } else {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };
  
  const handleClearChat = () => {
    clearChatHistory();
    setMessages([{
      role: 'assistant',
      content: `Chat cleared! I'm here to help. What would you like to know?`,
      timestamp: Date.now()
    }]);
    setSuggestions([]);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };
  
  const handleActionClick = (path: string) => {
    navigate({ to: path });
  };
  
  const renderMessage = (msg: ChatMessage) => {
    // Check if it's an action message
    if (msg.content.startsWith('__ACTION__')) {
      const action = JSON.parse(msg.content.replace('__ACTION__', ''));
      return (
        <div className="flex justify-start mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleActionClick(action.path)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            {action.label} →
          </Button>
        </div>
      );
    }
    
    return (
      <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
        <div
          className={`max-w-[80%] rounded-lg px-4 py-2 ${
            msg.role === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
        </div>
      </div>
    );
  };
  
  return (
    <>
      {/* Floating button */}
      <Button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white z-50 transition-transform hover:scale-110"
        aria-label="Open assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </Button>
      
      {/* Chat panel */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-t-lg flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">Portal Assistant</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearChat}
                className="h-8 w-8 text-white hover:bg-white/20"
                aria-label="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggle}
                className="h-8 w-8 text-white hover:bg-white/20"
                aria-label="Close assistant"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Messages - plain scrollable div */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 min-h-0"
          >
            {messages.map((msg, idx) => (
              <div key={idx}>{renderMessage(msg)}</div>
            ))}
          </div>
          
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-4 pb-2 flex-shrink-0">
              <p className="text-xs text-gray-500 mb-2">Did you mean:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSend(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input */}
          <div className="p-4 border-t flex-shrink-0">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="resize-none min-h-[60px]"
                rows={2}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line, Esc to close
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
