import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Plus, Trash, Download, PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

interface ChatTab {
  id: string;
  name: string;
  messages: Message[];
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [chatTabs, setChatTabs] = useState<ChatTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize with a default tab
  useEffect(() => {
    if (isOpen && chatTabs.length === 0) {
      const newTabId = generateTabId();
      setChatTabs([
        {
          id: newTabId,
          name: 'New Chat',
          messages: [
            {
              role: 'assistant',
              content: 'Hey there! I\'m WebSense, your friendly Spider-Bookmark AI assistant. With great power comes great organization! How can I help you manage your web of bookmarks today?'
            }
          ]
        }
      ]);
      setActiveTabId(newTabId);
    }
  }, [isOpen, chatTabs.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatTabs, activeTabId]);

  // Helper to generate unique tab IDs
  const generateTabId = (): string => {
    return `tab-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  // Create a new chat tab
  const handleNewChat = () => {
    const newTabId = generateTabId();
    setChatTabs(prev => [
      ...prev,
      {
        id: newTabId,
        name: `Chat ${prev.length + 1}`,
        messages: [
          {
            role: 'assistant',
            content: 'Ready for a new chat! What bookmark questions can I help with today?'
          }
        ]
      }
    ]);
    setActiveTabId(newTabId);
    setInput('');
  };

  // Get the current active chat tab
  const getActiveTab = (): ChatTab | undefined => {
    return chatTabs.find(tab => tab.id === activeTabId);
  };

  // Send a message in the current chat
  const handleSendMessage = async () => {
    if (!input.trim() || !activeTabId) return;
    
    const activeTab = getActiveTab();
    if (!activeTab) return;
    
    // Add user message to the chat
    const userMessage: Message = { role: 'user', content: input };
    setChatTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, messages: [...tab.messages, userMessage] }
        : tab
    ));
    setInput('');
    setIsLoading(true);
    
    try {
      // Format messages for the API
      const apiMessages = activeTab.messages.concat(userMessage).map(({ role, content }) => ({
        role,
        content
      }));
      
      // Send request to the backend
      const response = await apiRequest('POST', '/api/chat', { messages: apiMessages });
      const data = await response.json();
      
      if (data.success) {
        // Add assistant response to chat
        setChatTabs(prev => prev.map(tab => 
          tab.id === activeTabId 
            ? { ...tab, messages: [...tab.messages, { role: 'assistant', content: data.content }] }
            : tab
        ));
      } else {
        // Add error response to chat but make it look nicer
        setChatTabs(prev => prev.map(tab => 
          tab.id === activeTabId 
            ? { ...tab, messages: [...tab.messages, { role: 'assistant', content: data.content || "I'm having trouble responding right now. Please try again in a moment." }] }
            : tab
        ));
        
        // Show toast only for unexpected errors
        if (data.error && !data.error.includes("Failed to fetch") && !data.error.includes("API error")) {
          toast({
            title: 'Error',
            description: data.error,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      setChatTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, messages: [...tab.messages, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment." }] }
          : tab
      ));
      
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to the AI service. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear the chat history in the current tab
  const handleClearChat = () => {
    setChatTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { 
            ...tab, 
            messages: [
              {
                role: 'assistant',
                content: 'Chat history cleared! What would you like to talk about now?'
              }
            ] 
          }
        : tab
    ));
  };

  // Save the chat history to a text file
  const handleSaveChat = () => {
    const activeTab = getActiveTab();
    if (!activeTab) return;
    
    const chatText = activeTab.messages
      .map(message => `${message.role === 'assistant' ? 'WebSense' : 'You'}: ${message.content}`)
      .join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `websense-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Chat Saved',
      description: 'Chat history has been saved to your device.',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-xl spiderman-card shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-red-900/30">
          <h2 className="text-xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
            WebSense AI Assistant
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs flex items-center text-green-400 hover:text-green-300 hover:bg-green-900/20"
              onClick={handleNewChat}
            >
              <PlusSquare className="h-4 w-4 mr-1" />
              New Chat
            </Button>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 rounded-full"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        {chatTabs.length > 0 && (
          <div className="border-b border-gray-700/50 bg-gray-900/20">
            <div className="flex items-center overflow-x-auto hide-scrollbar">
              <Tabs value={activeTabId} className="w-full" onValueChange={setActiveTabId}>
                <div className="flex items-center px-4">
                  <TabsList className="h-10 bg-transparent p-0 flex gap-2">
                    {chatTabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="text-sm data-[state=active]:bg-blue-900/30 data-[state=active]:text-white rounded-full px-3"
                      >
                        {tab.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-8 w-8 p-0 rounded-full"
                    onClick={handleNewChat}
                  >
                    <Plus className="h-4 w-4 text-blue-400" />
                  </Button>
                </div>
                {chatTabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="mt-0">
                    {/* Chat container */}
                    <div className="flex-1 overflow-y-auto p-4 h-[calc(65vh-8rem)] space-y-4 hide-scrollbar">
                      {tab.messages.map((message, index) => (
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
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="px-4 pt-2 pb-0 flex items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs flex items-center text-red-400 hover:text-red-300 hover:bg-red-900/20"
            onClick={handleClearChat}
          >
            <Trash className="h-3.5 w-3.5 mr-1" />
            Clear Chat
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs flex items-center text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
            onClick={handleSaveChat}
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Save Chat
          </Button>
        </div>
        
        {/* Input area */}
        <div className="p-4 border-t border-gray-700/50 mt-auto">
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