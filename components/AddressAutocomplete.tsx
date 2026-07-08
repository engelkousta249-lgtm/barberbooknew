'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface AddressData {
  fullAddress: string;
  street: string;
  streetNumber: string;
  city: string;
  postalCode: string;
  lat?: number;
  lng?: number;
}

interface AddressAutocompleteProps {
  onAddressChange: (data: AddressData) => void;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    postcode?: string;
  };
}

export default function AddressAutocomplete({
  onAddressChange,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions from Nominatim
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
          query
        )}&countrycodes=gr&limit=8`,
        {
          headers: {
            'Accept-Language': 'el',
          },
        }
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSelectedAddress(null);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (value.trim().length >= 2) {
        fetchSuggestions(value);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  };

  const parseAddress = (result: NominatimResult): AddressData => {
    const addr = result.address;
    const street = addr.road || '';
    const streetNumber = addr.house_number || '';
    const city = addr.city || addr.town || addr.village || '';
    const postalCode = addr.postcode || '';

    return {
      fullAddress: result.display_name,
      street,
      streetNumber,
      city,
      postalCode,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
  };

  const handleSelect = (result: NominatimResult) => {
    const addressData = parseAddress(result);
    setSelectedAddress(addressData);
    setInputValue(addressData.fullAddress);
    setShowSuggestions(false);
    setSuggestions([]);
    onAddressChange(addressData);
  };

  const handleFieldChange = (field: keyof Omit<AddressData, 'fullAddress' | 'lat' | 'lng'>, value: string) => {
    if (selectedAddress) {
      const updated = {
        ...selectedAddress,
        [field]: value,
      };
      updated.fullAddress = `${updated.street} ${updated.streetNumber}, ${updated.postalCode} ${updated.city}`.trim();
      setSelectedAddress(updated);
      setInputValue(updated.fullAddress);
      onAddressChange(updated);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Input Field */}
      <div className="relative">
        <div className="absolute left-4 top-3.5 text-[#3b7bff] pointer-events-none text-base">
          📍
        </div>

        <input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0 || inputValue.length >= 2) {
              setShowSuggestions(true);
            }
          }}
          placeholder="Αναζήτησε διεύθυνση..."
          className="w-full bg-[#101c33] border border-white/10 rounded-xl px-4 py-3.5 pl-12 text-sm text-[#eaeef6] placeholder-[#5a6a7a] focus:outline-none focus:border-[#3b7bff] focus:ring-1 focus:ring-[#3b7bff]/30 transition"
        />

        {loading && (
          <div className="absolute right-4 top-3.5 text-[#8a97ac]">
            <div className="animate-spin text-base">⟳</div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-[#0b1424] border border-white/10 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => {
            const addr = suggestion.address;
            const mainText = `${addr.road || ''} ${addr.house_number || ''}`.trim();
            const secondaryText = `${addr.postcode || ''} ${addr.city || addr.town || addr.village || ''}`.trim();

            return (
              <button
                key={index}
                onClick={() => handleSelect(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-[#1a2a3a] border-b border-white/5 last:border-b-0 transition"
              >
                <div className="flex items-start gap-3">
                  <span className="text-[#3b7bff] mt-0.5 text-base flex-shrink-0">📍</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#cfe0ff] font-medium text-sm">
                      {mainText || 'Διεύθυνση'}
                    </div>
                    <div className="text-[#8a97ac] text-xs mt-0.5">
                      {secondaryText}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Address Details Fields - Responsive Grid */}
      {selectedAddress && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-white/10">
          {/* Street */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-[#8a97ac] mb-2">
              Οδός
            </label>
            <input
              type="text"
              value={selectedAddress.street}
              onChange={(e) => handleFieldChange('street', e.target.value)}
              placeholder="π.χ. Αντωνίου Μηλιαέα"
              className="w-full bg-[#101c33] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#eaeef6] placeholder-[#5a6a7a] focus:outline-none focus:border-[#3b7bff] focus:ring-1 focus:ring-[#3b7bff]/30 transition"
            />
          </div>

          {/* Street Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#8a97ac] mb-2">
              Αριθμός
            </label>
            <input
              type="text"
              value={selectedAddress.streetNumber}
              onChange={(e) => handleFieldChange('streetNumber', e.target.value)}
              placeholder="π.χ. 2"
              className="w-full bg-[#101c33] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#eaeef6] placeholder-[#5a6a7a] focus:outline-none focus:border-[#3b7bff] focus:ring-1 focus:ring-[#3b7bff]/30 transition"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#8a97ac] mb-2">
              Πόλη
            </label>
            <input
              type="text"
              value={selectedAddress.city}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              placeholder="π.χ. Ηράκλειο"
              className="w-full bg-[#101c33] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#eaeef6] placeholder-[#5a6a7a] focus:outline-none focus:border-[#3b7bff] focus:ring-1 focus:ring-[#3b7bff]/30 transition"
            />
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#8a97ac] mb-2">
              ΤΚ
            </label>
            <input
              type="text"
              value={selectedAddress.postalCode}
              onChange={(e) => handleFieldChange('postalCode', e.target.value)}
              placeholder="π.χ. 71306"
              className="w-full bg-[#101c33] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#eaeef6] placeholder-[#5a6a7a] focus:outline-none focus:border-[#3b7bff] focus:ring-1 focus:ring-[#3b7bff]/30 transition"
            />
          </div>
        </div>
      )}
    </div>
  );
}
