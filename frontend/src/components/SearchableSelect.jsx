import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  allLabel = "All",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="input flex items-center justify-between gap-2 cursor-pointer text-left"
      >
        <span className={value ? "text-ink" : "text-ink-light"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleSelect("");
              }}
              className="p-0.5 rounded hover:bg-surface-muted text-ink-light hover:text-ink transition-colors"
              aria-label="Clear"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown size={16} className="text-ink-light" />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-surface-card border border-border rounded-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-light" />
              <input
                ref={inputRef}
                type="text"
                className="w-full rounded-md border border-border bg-white pl-8 pr-3 py-2 text-sm text-ink placeholder:text-ink-light focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                placeholder="Type to search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            <button
              type="button"
              onClick={() => handleSelect("")}
              className={`w-full text-left px-3 py-2.5 text-sm cursor-pointer transition-colors min-h-[44px] flex items-center ${
                !value
                  ? "bg-primary/5 text-primary font-medium"
                  : "text-ink hover:bg-surface-muted"
              }`}
            >
              {allLabel}
            </button>
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-sm text-ink-muted text-center">
                No matches found
              </div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => handleSelect(o.value)}
                  className={`w-full text-left px-3 py-2.5 text-sm cursor-pointer transition-colors min-h-[44px] flex items-center ${
                    value === o.value
                      ? "bg-primary/5 text-primary font-medium"
                      : "text-ink hover:bg-surface-muted"
                  }`}
                >
                  {o.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
