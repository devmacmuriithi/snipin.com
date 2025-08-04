import { useState, useEffect, useRef } from "react";
import { Search, MessageSquare, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'snip' | 'whisper';
  createdAt: string;
  author?: string;
}

interface SearchResults {
  snips: SearchResult[];
  whispers: SearchResult[];
}

export default function SearchAutocomplete() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search API call
  const { data: searchResults, isLoading } = useQuery<SearchResults>({
    queryKey: ["/api/search", debouncedQuery],
    queryFn: async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: debouncedQuery.length >= 2,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page or handle search
      console.log("Searching for:", searchQuery);
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsOpen(value.length >= 2);
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setSearchQuery("");
    // Navigate to the result
    if (result.type === 'snip') {
      window.location.href = `/snip/${result.id}`;
    } else {
      window.location.href = `/whisper/${result.id}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const hasResults = searchResults && (searchResults.snips.length > 0 || searchResults.whispers.length > 0);

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search SnipIn"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => searchQuery.length >= 2 && setIsOpen(true)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-full focus:bg-white focus:shadow-md transition-all duration-200"
          />
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && debouncedQuery.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching...
            </div>
          ) : hasResults ? (
            <div className="py-2">
              {/* Snips Section */}
              {searchResults!.snips.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-100 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2 text-purple-600" />
                    Snips
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    {searchResults!.snips.map((snip) => (
                      <div
                        key={snip.id}
                        onClick={() => handleResultClick(snip)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {snip.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {snip.content}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {snip.author && `by ${snip.author} • `}{formatDate(snip.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Whispers Section */}
              {searchResults!.whispers.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-100 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                    Whispers
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    {searchResults!.whispers.map((whisper) => (
                      <div
                        key={whisper.id}
                        onClick={() => handleResultClick(whisper)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {whisper.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {whisper.content}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDate(whisper.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No results found for "{debouncedQuery}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}