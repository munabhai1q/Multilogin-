import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ollmaStatus, setOllamaStatus] = useState<'unknown' | 'running' | 'not-running'>('unknown');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: 'Hey there! I\'m WebSense, your friendly Spider-Bookmark AI assistant. With great power comes great organization! How can I help you manage your web of bookmarks today?'
        }
      ]);
    }
  }, [isOpen, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message to the chat
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Format messages for the API
      const apiMessages = messages.concat(userMessage).map(({ role, content }) => ({
        role,
        content
      }));
      
      // Send request to the backend
      const response = await apiRequest('POST', '/api/chat', { messages: apiMessages });
      const data = await response.json();
      
      if (data.success) {
        // Add assistant response to chat
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.content }
        ]);
        setOllamaStatus('running');
      } else {
        // Add error response to chat but make it look nicer
        setMessages(prev => [
          ...prev,
          { 
            role: 'assistant', 
            content: data.content || "I'm having trouble connecting to my brain right now. If you want to use the AI features, you'll need to install Ollama locally and run it. Visit ollama.com for instructions." 
          }
        ]);
        setOllamaStatus('not-running');
        
        // Show toast only for unexpected errors
        if (data.error && !data.error.includes("Failed to fetch") && !data.error.includes("Ollama API error")) {
          toast({
            title: 'Error',
            description: data.error,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: "I'm having trouble connecting to my brain right now. If you want to use the AI features, you'll need to install Ollama locally and run it. Visit ollama.com for instructions."
        }
      ]);
      setOllamaStatus('not-running');
      
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to the AI service. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-xl spiderman-card shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-red-900/30">
          <h2 className="text-xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
            WebSense AI Assistant
          </h2>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Chat container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-red-900/30 text-white rounded-tr-none'
                    : 'bg-blue-900/30 text-white rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Ollama Status Banner - Only show if not running */}
        {ollmaStatus === 'not-running' && (
          <div className="px-4 py-2 bg-yellow-900/30 border-t border-yellow-800 flex items-center">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
            <p className="text-sm text-yellow-200">
              To use AI features, install <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Ollama</a> and run it locally
            </p>
          </div>
        )}
        
        {/* Input area */}
        <div className="p-4 border-t border-gray-700/50">
          <div className="flex space-x-2">
            <Input
              className="flex-1 bg-gray-900/30 border-gray-700 text-white"
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
            />
            <Button
              className="bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600"
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}