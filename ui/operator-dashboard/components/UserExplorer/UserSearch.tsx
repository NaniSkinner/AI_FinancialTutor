// User Search Component
// Allows operators to search for users by ID
// Features debounced auto-search for better UX

import React, { useState, useEffect } from "react";
import { Button } from "@/components/Common/Button";
import { useDebounce } from "@/hooks/useDebounce";

interface Props {
  onUserSelect: (userId: string) => void;
}

export function UserSearch({ onUserSelect }: Props) {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  // Auto-search when debounced value changes
  useEffect(() => {
    const trimmedInput = debouncedSearch.trim();
    if (trimmedInput && trimmedInput.length >= 3) {
      // Only auto-search if at least 3 characters
      onUserSelect(trimmedInput);
    }
  }, [debouncedSearch, onUserSelect]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = searchInput.trim();
    if (trimmedInput) {
      onUserSelect(trimmedInput);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Enter user ID (e.g., user_123)..."
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
      />
      <Button type="submit">Search</Button>
      {searchInput && (
        <span className="text-xs text-gray-500 self-center">
          Auto-searching...
        </span>
      )}
    </form>
  );
}
