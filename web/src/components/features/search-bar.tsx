import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useMudAutocomplete } from '@/hooks/use-muds';
import { useFilterStore } from '@/stores/filter-store';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (query: string) => void;
  onSearch?: (query: string) => void;
  showAutocomplete?: boolean;
}

export function SearchBar({
  className,
  placeholder = 'Search MUDs...',
  value,
  onChange,
  onSearch,
  showAutocomplete = true,
}: SearchBarProps) {
  // Support both controlled and uncontrolled modes
  const [internalQuery, setInternalQuery] = useState('');
  const query = value !== undefined ? value : internalQuery;
  const setQuery = onChange || setInternalQuery;

  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setQuery: setFilterQuery } = useFilterStore();

  const { data: suggestions, isLoading } = useMudAutocomplete(showAutocomplete ? query : '');

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (newValue: string) => {
    setQuery(newValue);
    setIsOpen(showAutocomplete && newValue.length >= 2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      if (onSearch) {
        onSearch(query);
      } else {
        setFilterQuery(query);
        navigate(`/browse?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/muds/${slug}`);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => showAutocomplete && query.length >= 2 && setIsOpen(true)}
            className="pl-10 pr-10 bg-secondary/50 border-border focus:bg-background"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
      </form>

      {/* Autocomplete dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1">
          <Command className="rounded-lg border shadow-lg bg-popover">
            <CommandList>
              {!isLoading && suggestions?.length === 0 && (
                <CommandEmpty>
                  No MUDs found. Press Enter to search.
                </CommandEmpty>
              )}
              {suggestions && suggestions.length > 0 && (
                <CommandGroup heading="Suggestions">
                  {suggestions.map((mud) => (
                    <CommandItem
                      key={mud.id}
                      value={mud.name}
                      onSelect={() => handleSelect(mud.slug)}
                      className="cursor-pointer"
                    >
                      <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{mud.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
