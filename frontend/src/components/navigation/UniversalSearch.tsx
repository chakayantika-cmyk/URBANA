import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2, Compass } from 'lucide-react';
import { GeocodeResult, LocationState } from '../../types';
import { api } from '../../services/api';

interface UniversalSearchProps {
  onSelectLocation: (loc: LocationState) => void;
  selectedLocation: LocationState | null;
}

const QUICK_LOCATIONS = [
  { label: 'MG Road, Bengaluru', query: 'MG Road, Bengaluru, India' },
  { label: 'Connaught Place, New Delhi', query: 'Connaught Place, New Delhi, India' },
  { label: 'Times Square, New York', query: 'Times Square, New York, USA' },
  { label: 'Oxford Street, London', query: 'Oxford Street, London, UK' },
  { label: '12 Park Street, Kolkata', query: '12 Park Street, Kolkata, India' },
];

export const UniversalSearch: React.FC<UniversalSearchProps> = ({
  onSelectLocation,
  selectedLocation
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync query when selectedLocation changes externally
  useEffect(() => {
    if (selectedLocation && !isOpen) {
      setQuery(selectedLocation.address);
    }
  }, [selectedLocation, isOpen]);

  // Debounced geocoding search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await api.searchAddress(query, 6);
        setSuggestions(results);
        setIsOpen(true);
      } catch (err) {
        console.error('Geocoding failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: GeocodeResult) => {
    const locState: LocationState = {
      address: result.display_name,
      display_name: result.display_name,
      latitude: result.latitude,
      longitude: result.longitude,
      city: result.city,
      district: result.district,
      state: result.state,
      country: result.country,
      postal_code: result.postal_code,
      bounding_box: result.bounding_box
    };
    onSelectLocation(locState);
    setQuery(result.display_name);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-xl" ref={dropdownRef}>
      {/* Search Input Box */}
      <div className="relative flex items-center bg-white border border-[#E5E5E2] shadow-sm hover:border-[#111111] transition-colors">
        <div className="pl-4 pr-2 text-[#6F6F6F]">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#8B0000]" />
          ) : (
            <Search className="w-4 h-4 text-[#111111]" />
          )}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search any address, city, landmark or coordinates..."
          className="w-full py-3 pr-10 text-[14px] text-[#111111] placeholder-[#8E8E88] bg-transparent outline-none tracking-tight font-medium"
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 text-[#6F6F6F] hover:text-[#111111] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dynamic Dropdown Suggestions */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E5E5E2] shadow-lg z-50 max-h-[380px] overflow-y-auto">
          {/* Quick presets if query is short */}
          {query.length < 2 && (
            <div className="p-3 bg-[#FAF9F7] border-b border-[#E5E5E2]">
              <div className="text-[11px] font-semibold tracking-wider uppercase text-[#6F6F6F] mb-2 flex items-center gap-1">
                <Compass className="w-3 h-3 text-[#8B0000]" /> Global Test Locations
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_LOCATIONS.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(loc.query);
                    }}
                    className="text-[12px] px-2.5 py-1 bg-white border border-[#E5E5E2] hover:border-[#111111] text-[#111111] transition-all font-medium"
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          {suggestions.length > 0 ? (
            <div className="divide-y divide-[#E5E5E2]">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(item)}
                  className="w-full px-4 py-3 text-left hover:bg-[#F7F7F5] transition-colors flex items-start gap-3 group"
                >
                  <MapPin className="w-4 h-4 text-[#8B0000] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[#111111] truncate tracking-tight">
                      {item.city || item.district || item.display_name.split(',')[0]}
                    </p>
                    <p className="text-[11px] text-[#6F6F6F] truncate mt-0.5">
                      {item.display_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.country && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-[#EFEFEA] text-[#111111] font-mono">
                          {item.country}
                        </span>
                      )}
                      <span className="text-[10px] text-[#8E8E88] font-mono">
                        {item.latitude.toFixed(4)}°, {item.longitude.toFixed(4)}°
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 && !isLoading ? (
            <div className="p-4 text-center text-[12px] text-[#6F6F6F]">
              No locations found. Try entering a city name or latitude, longitude.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
