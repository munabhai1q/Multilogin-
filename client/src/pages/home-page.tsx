import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Bookmark, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BookmarkCard from "@/components/bookmark/bookmark-card";
import BookmarkModal from "@/components/bookmark/bookmark-modal";
import CategoryModal from "@/components/bookmark/category-modal";
import DeleteModal from "@/components/bookmark/delete-modal";
import { Loader2, LogOut, Menu, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMethod, setSortMethod] = useState<string>("newest");
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(null);
  
  // Modal states
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentBookmark, setCurrentBookmark] = useState<Bookmark | null>(null);
  const [bookmarkToDelete, setBookmarkToDelete] = useState<number | null>(null);

  // Fetch data
  const { 
    data: categories = [],
    isLoading: isCategoriesLoading 
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  const { 
    data: bookmarks = [],
    isLoading: isBookmarksLoading,
    refetch: refetchBookmarks
  } = useQuery<Bookmark[]>({
    queryKey: ["/api/bookmarks", currentCategoryId],
    queryFn: async () => {
      const url = currentCategoryId 
        ? `/api/bookmarks?categoryId=${currentCategoryId}` 
        : "/api/bookmarks";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to fetch bookmarks");
      }
      return res.json();
    }
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/categories", { name });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category created",
        description: "Your category has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create category",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Create bookmark mutation
  const createBookmarkMutation = useMutation({
    mutationFn: async (data: Omit<Bookmark, "id" | "userId" | "createdAt">) => {
      const res = await apiRequest("POST", "/api/bookmarks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: "Bookmark created",
        description: "Your bookmark has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create bookmark",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update bookmark mutation
  const updateBookmarkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Bookmark> }) => {
      const res = await apiRequest("PUT", `/api/bookmarks/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: "Bookmark updated",
        description: "Your bookmark has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update bookmark",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete bookmark mutation
  const deleteBookmarkMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/bookmarks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: "Bookmark deleted",
        description: "Your bookmark has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete bookmark",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter and sort bookmarks
  const filteredBookmarks = bookmarks.filter(bookmark => 
    bookmark.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    bookmark.url.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
    if (sortMethod === "newest") {
      // Safely handle potentially null dates
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    } else if (sortMethod === "alphabetical") {
      return a.name.localeCompare(b.name);
    } else if (sortMethod === "category") {
      const catA = a.categoryId || 0;
      const catB = b.categoryId || 0;
      return catA - catB;
    }
    return 0;
  });

  // Handle modal interactions
  const handleAddBookmark = () => {
    setCurrentBookmark(null);
    setBookmarkModalOpen(true);
  };
  
  const handleEditBookmark = (bookmark: Bookmark) => {
    setCurrentBookmark(bookmark);
    setBookmarkModalOpen(true);
  };
  
  const handleConfirmDeleteBookmark = (id: number) => {
    setBookmarkToDelete(id);
    setDeleteModalOpen(true);
  };
  
  const handleDeleteBookmark = () => {
    if (bookmarkToDelete) {
      deleteBookmarkMutation.mutate(bookmarkToDelete);
      setDeleteModalOpen(false);
    }
  };
  
  const handleSaveBookmark = (data: Omit<Bookmark, "id" | "userId" | "createdAt">) => {
    if (currentBookmark) {
      updateBookmarkMutation.mutate({
        id: currentBookmark.id,
        data
      });
    } else {
      createBookmarkMutation.mutate(data);
    }
    setBookmarkModalOpen(false);
  };
  
  const handleSaveCategory = (name: string) => {
    createCategoryMutation.mutate(name);
    setCategoryModalOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebarElement = document.getElementById('sidebar');
      const sidebarToggleElement = document.getElementById('sidebar-toggle');
      
      if (window.innerWidth < 768 && 
          isSidebarOpen && 
          sidebarElement && 
          sidebarToggleElement && 
          !sidebarElement.contains(event.target as Node) && 
          !sidebarToggleElement.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Current category name
  const currentCategoryName = currentCategoryId
    ? categories.find(cat => cat.id === currentCategoryId)?.name
    : "All Bookmarks";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="backdrop-blur-md bg-black/40 border-b border-red-900/30 shadow-lg z-10 spiderman-web-border">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center space-x-3">
            <button 
              id="sidebar-toggle"
              className="md:hidden text-red-500 hover:text-red-400 transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">SpiderBookmarks</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                className="flex items-center space-x-1 text-sm focus:outline-none"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <span className="hidden sm:inline-block text-white font-medium">{user?.username}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 spiderman-card rounded-md shadow-lg py-1">
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-red-900/30 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside 
          id="sidebar" 
          className={`spiderman-card shadow-lg w-64 flex-shrink-0 md:sticky fixed inset-y-0 left-0 z-20 md:z-0 md:transform-none transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4">
              <div className="mb-4">
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                  onClick={handleAddBookmark}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Bookmark
                </Button>
              </div>
              
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-red-400" />
                  <Input
                    type="text"
                    placeholder="Search bookmarks..."
                    className="pl-9 bg-gray-900/30 border-gray-700 text-white placeholder:text-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <nav>
                <div className="mb-2">
                  <h3 className="font-medium text-xs uppercase tracking-wider text-blue-300 px-3 py-2">Categories</h3>
                </div>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setCurrentCategoryId(null)}
                      className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentCategoryId === null 
                          ? "bg-red-900/30 text-white" 
                          : "text-gray-300 hover:bg-gray-800/30 hover:text-white"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`mr-3 h-5 w-5 ${currentCategoryId === null ? "text-red-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      All Bookmarks
                    </button>
                  </li>
                  
                  {/* Categories list */}
                  {isCategoriesLoading ? (
                    <li className="px-3 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                    </li>
                  ) : (
                    categories.map(category => (
                      <li key={category.id}>
                        <button
                          onClick={() => setCurrentCategoryId(category.id)}
                          className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            currentCategoryId === category.id 
                              ? "bg-blue-900/30 text-white" 
                              : "text-gray-300 hover:bg-gray-800/30 hover:text-white"
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className={`mr-3 h-5 w-5 ${currentCategoryId === category.id ? "text-blue-400" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          {category.name}
                        </button>
                      </li>
                    ))
                  )}
                  
                  <li>
                    <button
                      onClick={() => setCategoryModalOpen(true)}
                      className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800/30 hover:text-white rounded-md transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Add Category
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
            
            <div className="mt-auto p-4 border-t border-gray-700/50">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 hover:bg-red-900/30 hover:text-white rounded-md transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5 text-red-500" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-gray-300 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="mx-2 text-gray-500">/</span>
              <span className="text-white">{currentCategoryName}</span>
            </div>
            
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">{currentCategoryName}</h1>
              <div className="flex space-x-2">
                <Select
                  value={sortMethod}
                  onValueChange={(value) => setSortMethod(value)}
                >
                  <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-700">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="alphabetical">A-Z</SelectItem>
                    <SelectItem value="category">By Category</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="default" onClick={handleAddBookmark} className="bg-red-600 hover:bg-red-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Bookmark
                </Button>
              </div>
            </div>
            
            {/* Bookmark Grid */}
            {isBookmarksLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
              </div>
            ) : sortedBookmarks.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 w-20 h-20 rounded-full spiderman-card flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No bookmarks found</h3>
                <p className="text-gray-300 mb-6 max-w-sm">
                  {searchTerm 
                    ? "No bookmarks match your search criteria." 
                    : "With great power comes great organization. Add some bookmarks to get started!"}
                </p>
                <Button onClick={handleAddBookmark} className="bg-red-600 hover:bg-red-700 shadow-lg transition-all">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Bookmark
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {sortedBookmarks.map(bookmark => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    category={categories.find(c => c.id === bookmark.categoryId)?.name}
                    onEdit={() => handleEditBookmark(bookmark)}
                    onDelete={() => handleConfirmDeleteBookmark(bookmark.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation (only visible on small screens) */}
      <div className="md:hidden spiderman-card border-t border-red-900/30 fixed bottom-0 left-0 right-0 z-10">
        <div className="flex justify-around">
          <button className="flex flex-col items-center justify-center py-2 flex-1 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="text-xs mt-1 text-white">Bookmarks</span>
          </button>
          <button 
            className="flex flex-col items-center justify-center py-2 flex-1 text-blue-400 hover:text-blue-300 transition-colors"
            onClick={handleAddBookmark}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-xs mt-1 text-white">Add New</span>
          </button>
          <button 
            className="flex flex-col items-center justify-center py-2 flex-1 text-blue-400 hover:text-blue-300 transition-colors"
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="text-xs mt-1 text-white">Categories</span>
          </button>
        </div>
      </div>
      
      {/* Modals */}
      <BookmarkModal
        isOpen={bookmarkModalOpen}
        onClose={() => setBookmarkModalOpen(false)}
        onSave={handleSaveBookmark}
        bookmark={currentBookmark}
        categories={categories}
      />
      
      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategory}
      />
      
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteBookmark}
      />
    </div>
  );
}
