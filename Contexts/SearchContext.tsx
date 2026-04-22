import React, { createContext, useContext, useState } from 'react';

interface SearchContextType {
  isSearchVisible: boolean;
  searchQuery: string;
  setSearchVisible: (visible: boolean) => void;
  setSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const setSearchVisible = (visible: boolean) => {
    setIsSearchVisible(visible);
    if (!visible) {
      setSearchQuery('');
    }
  };

  return (
    <SearchContext.Provider value={{
      isSearchVisible,
      searchQuery,
      setSearchVisible,
      setSearchQuery,
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}