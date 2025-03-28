import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Bookmark } from "@shared/schema";
import { format } from "date-fns";
import { Edit, Trash2, ExternalLink, Maximize2 } from "lucide-react";
import { EmbeddedViewerModal } from "./embedded-viewer-modal";

interface BookmarkCardProps {
  bookmark: Bookmark;
  category?: string;
  onEdit: () => void;
  onDelete: () => void;
}

const BookmarkCard = ({ bookmark, category, onEdit, onDelete }: BookmarkCardProps) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const formattedDate = bookmark.createdAt 
    ? format(new Date(bookmark.createdAt), "MMM d, yyyy")
    : "";
  
  const getDomainIcon = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.split('.')[0];
    } catch {
      return 'web';
    }
  };
  
  const icon = getDomainIcon(bookmark.url);
  
  const handleOpen = (url: string) => {
    window.open(url, '_blank');
  };

  const handleOpenEmbedded = () => {
    setIsViewerOpen(true);
  };

  const handleCloseEmbedded = () => {
    setIsViewerOpen(false);
  };

  return (
    <>
      <Card className="overflow-hidden spiderman-card spiderman-card-hover transition-all duration-300 spiderman-web-border">
        <div className="p-4 border-b border-gray-100/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-700/30 text-red-500 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-white">{bookmark.name}</h3>
            </div>
            {category && (
              <div className="text-xs px-2 py-1 bg-blue-900/50 text-blue-100 rounded-md border border-blue-500/30">
                {category}
              </div>
            )}
          </div>
          <a 
            href={bookmark.url}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-red-400 hover:text-red-300 hover:underline truncate block transition-colors"
          >
            {bookmark.url}
          </a>
        </div>
        <div className="px-4 py-3 flex items-center justify-between bg-gray-900/30">
          <div>
            <span className="text-xs text-gray-400">Added: {formattedDate}</span>
          </div>
          <div className="flex space-x-2">
            <button 
              className="p-1 rounded hover:bg-red-900/30 transition-colors" 
              title="Edit"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4 text-gray-300" />
            </button>
            <button 
              className="p-1 rounded hover:bg-red-900/30 transition-colors" 
              title="Delete"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 text-gray-300" />
            </button>
            <button 
              className="p-1 rounded hover:bg-blue-900/30 transition-colors" 
              title="View Embedded"
              onClick={handleOpenEmbedded}
            >
              <Maximize2 className="h-4 w-4 text-green-300" />
            </button>
            <button 
              className="p-1 rounded hover:bg-blue-900/30 transition-colors" 
              title="Open in New Tab"
              onClick={() => handleOpen(bookmark.url)}
            >
              <ExternalLink className="h-4 w-4 text-blue-300" />
            </button>
          </div>
        </div>
      </Card>

      {/* Embedded Viewer Modal */}
      <EmbeddedViewerModal
        isOpen={isViewerOpen}
        onClose={handleCloseEmbedded}
        url={bookmark.url}
        name={bookmark.name}
      />
    </>
  );
};

export default BookmarkCard;
