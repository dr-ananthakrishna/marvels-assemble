"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Search, X } from "lucide-react";

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  className = "",
  error = false,
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (option: string) => {
      onChange(option);
      setIsOpen(false);
      setSearch("");
    },
    [onChange]
  );

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (isOpen) setSearch("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-[#F5F5F7] rounded-xl border text-left flex items-center justify-between gap-2 transition-colors focus:outline-none ${
          error
            ? "border-red-400 bg-red-50"
            : isOpen
              ? "border-[#62C8DF]"
              : "border-transparent"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`truncate text-sm ${
            value ? "text-[#1A1A2E]" : "text-[#999999]"
          }`}
        >
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <div
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)}
              className="p-0.5 rounded-full hover:bg-[#E8E8ED] text-[#999999] hover:text-[#1A1A2E] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </div>
          )}
          <ChevronDown
            className={`w-4 h-4 text-[#999999] transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-[#E8E8ED] shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-[#E8E8ED]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 bg-[#F5F5F7] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#62C8DF] border-transparent"
              />
            </div>
          </div>

          {/* Options list */}
          <div
            ref={listRef}
            className="max-h-60 overflow-y-auto overscroll-contain"
          >
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-[#999999]">
                No results found
              </div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    option === value
                      ? "bg-[#62C8DF]/10 text-[#1A1A2E] font-medium"
                      : "text-[#1A1A2E] hover:bg-[#F5F5F7]"
                  }`}
                >
                  {option}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
