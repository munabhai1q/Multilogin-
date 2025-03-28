import { useState, useEffect } from 'react';
import { X, Maximize, Minimize, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmbeddedViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  name: string;
}

export function EmbeddedViewerModal({ isOpen, onClose, url, name }: EmbeddedViewerModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(Date.now());

  useEffect(() => {
    // Reset loading state when URL changes
    if (isOpen) {
      setIsLoading(true);
      setIframeKey(Date.now());
    }
  }, [url, isOpen]);

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(Date.now());
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div 
        className={`relative rounded-xl spiderman-card shadow-2xl flex flex-col overflow-hidden ${
          isFullscreen ? 'w-full h-full' : 'w-full max-w-6xl max-h-[90vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-red-900/30">
          <h2 className="text-xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent truncate max-w-[70%]">
            {name}
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={handleRefresh}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={handleToggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 rounded-full"
              onClick={onClose}
              title="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Iframe container */}
        <div className="relative flex-1 overflow-hidden bg-white">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-t-2 border-b-2 border-red-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-white">Loading website...</p>
              </div>
            </div>
          )}
          <iframe
            key={iframeKey}
            src={url}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            title={`Embedded view of ${name}`}
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
            referrerPolicy="no-referrer"
          ></iframe>
        </div>
      </div>
    </div>
  );
}