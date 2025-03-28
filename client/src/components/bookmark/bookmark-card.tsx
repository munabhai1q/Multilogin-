import { Card } from "@/components/ui/card";
import { Bookmark } from "@shared/schema";
import { format } from "date-fns";
import { Edit, Trash2, ExternalLink } from "lucide-react";

interface BookmarkCardProps {
  bookmark: Bookmark;
  category?: string;
  onEdit: () => void;
  onDelete: () => void;
}

const BookmarkCard = ({ bookmark, category, onEdit, onDelete }: BookmarkCardProps) => {
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

  return (
    <Card className="overflow-hidden border border-gray-200">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">{bookmark.name}</h3>
          </div>
          {category && (
            <div className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-md">
              {category}
            </div>
          )}
        </div>
        <a 
          href={bookmark.url}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline truncate block"
        >
          {bookmark.url}
        </a>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-500">Added: {formattedDate}</span>
        </div>
        <div className="flex space-x-2">
          <button 
            className="p-1 rounded hover:bg-gray-100" 
            title="Edit"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 text-gray-500" />
          </button>
          <button 
            className="p-1 rounded hover:bg-gray-100" 
            title="Delete"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 text-gray-500" />
          </button>
          <button 
            className="p-1 rounded hover:bg-gray-100" 
            title="Open"
            onClick={() => handleOpen(bookmark.url)}
          >
            <ExternalLink className="h-4 w-4 text-primary" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default BookmarkCard;
