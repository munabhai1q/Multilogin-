import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bookmark, Category } from "@shared/schema";
import { Eye, EyeOff } from "lucide-react";

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Bookmark, "id" | "userId" | "createdAt">) => void;
  bookmark: Bookmark | null;
  categories: Category[];
}

const BookmarkModal = ({ isOpen, onClose, onSave, bookmark, categories }: BookmarkModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [name, setName] = useState(bookmark?.name || "");
  const [url, setUrl] = useState(bookmark?.url || "");
  const [username, setUsername] = useState(bookmark?.username || "");
  const [password, setPassword] = useState(bookmark?.password || "");
  const [categoryId, setCategoryId] = useState<string>(bookmark?.categoryId?.toString() || "");
  
  // Reset form when modal opens/closes or bookmark changes
  const resetForm = () => {
    setName(bookmark?.name || "");
    setUrl(bookmark?.url || "");
    setUsername(bookmark?.username || "");
    setPassword(bookmark?.password || "");
    setCategoryId(bookmark?.categoryId?.toString() || "");
    setShowPassword(false);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim() || !url.trim()) return;
    
    // Ensure URL has a protocol
    let urlWithProtocol = url;
    if (!/^https?:\/\//i.test(url)) {
      urlWithProtocol = `https://${url}`;
    }
    
    onSave({
      name,
      url: urlWithProtocol,
      username,
      password,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
    });
    
    resetForm();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
      resetForm();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{bookmark ? "Edit Bookmark" : "Add New Bookmark"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <Input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <div className="relative col-span-3">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={categoryId}
                onValueChange={(value) => setCategoryId(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Bookmark</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookmarkModal;
