import { useState, useEffect } from 'react';
import { X, Maximize, Minimize, RefreshCw, ExternalLink } from 'lucide-react';
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
  const [loadProgress, setLoadProgress] = useState(0);
  const [showLoadingText, setShowLoadingText] = useState(true);

  useEffect(() => {
    // Reset loading state when URL changes
    if (isOpen) {
      setIsLoading(true);
      setLoadProgress(0);
      setShowLoadingText(true);
      setIframeKey(Date.now());
      
      // Simulate progress loading for better UX
      const interval = setInterval(() => {
        setLoadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + Math.floor(Math.random() * 10) + 1;
        });
      }, 200);
      
      // Hide loading text after a bit regardless
      const textTimer = setTimeout(() => {
        setShowLoadingText(false);
      }, 5000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(textTimer);
      };
    }
  }, [url, isOpen]);

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setLoadProgress(0);
    setShowLoadingText(true);
    setIframeKey(Date.now());
  };

  const handleIframeLoad = () => {
    setLoadProgress(100);
    setIsLoading(false);
  };
  
  const handleOpenExternal = () => {
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div 
        className={`relative rounded-xl spiderman-card shadow-2xl flex flex-col overflow-hidden ${
          isFullscreen 
            ? 'w-[95vw] h-[90vh] transform translate-y-0' 
            : 'w-[85vw] h-[72vh] max-w-5xl'
        }`}
        style={{
          transition: 'all 0.3s ease-in-out',
          boxShadow: '0 0 25px rgba(255, 0, 0, 0.15), 0 0 50px rgba(0, 0, 255, 0.1)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-red-900/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-700/30 text-red-500 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent truncate max-w-[70%]">
              {name}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
              onClick={handleOpenExternal}
              title="Open in New Tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full text-green-400 hover:text-green-300 hover:bg-green-900/20"
              onClick={handleRefresh}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20"
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
              className="h-8 w-8 p-0 rounded-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
              onClick={onClose}
              title="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* URL display bar */}
        <div className="px-3 py-1.5 bg-gray-900/50 border-b border-gray-700/30 text-gray-300 text-sm flex items-center">
          <span className="truncate flex-1">{url}</span>
        </div>
        
        {/* Iframe container */}
        <div className="relative flex-1 overflow-hidden bg-white">
          {/* Progress bar */}
          {isLoading && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 z-20">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-blue-500"
                style={{ 
                  width: `${loadProgress}%`,
                  transition: 'width 0.3s ease-out'
                }}
              />
            </div>
          )}
          
          {/* Loading overlay */}
          {isLoading && showLoadingText && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70 z-10">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-t-2 border-b-2 border-red-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-white">Loading {name}...</p>
                <p className="text-xs text-gray-400 mt-2">{Math.round(loadProgress)}%</p>
              </div>
            </div>
          )}
          
          {/* Iframe */}
          <iframe
            key={iframeKey}
            src={url}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            title={`Embedded view of ${name}`}
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
            referrerPolicy="no-referrer"
            style={{ 
              transform: isFullscreen ? 'scale(1)' : 'scale(0.985)',
              transformOrigin: 'center',
              transition: 'transform 0.3s ease-in-out'
            }}
          ></iframe>
        </div>
      </div>
    </div>
  );
}