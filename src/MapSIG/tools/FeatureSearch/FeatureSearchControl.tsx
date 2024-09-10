import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useMain } from '../../../contexts/MainContext';
import { usePanel } from '../../contexts/PanelContext';
import FeatureSearchPanel from './FeatureSearchPanel';
import styled from 'styled-components';

type Suggestion = {
  tipo: string;
  nome: string;
  municipio: string;
  estado: string;
  latitude: number;
  longitude: number;
};

type GenericMap = {
  getCenter: () => { lat: number; lng: number };
  flyTo: (options: { center: [number, number]; zoom: number; essential: boolean }) => void;
};

type GenericMarker = {
  setLngLat: (coords: [number, number]) => GenericMarker;
  addTo: (map: GenericMap) => GenericMarker;
  remove: () => void;
};

const SearchContainer = styled.div`
  position: absolute;
  top: 90px;
  right: 60px;
  z-index: 1000;
  background-color: white;
  padding: 5px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const SearchInput = styled.input`
  width: 300px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const SuggestionsList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 350px;
  overflow-y: auto;
  width: 300px;
`;

const SuggestionItem = styled.li`
  padding: 8px;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const FeatureSearchControl: React.FC = () => {
  const { map, maplibregl } = useMain();
  const { openPanel, setOpenPanel } = usePanel();
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<Suggestion | null>(null);
  const [marker, setMarker] = useState<GenericMarker | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const suggestionTimeoutRef = useRef<number | null>(null);

  const apiUrl = 'http://localhost:3000/busca';

  useEffect(() => {
    return () => {
      if (marker) {
        marker.remove();
      }
    };
  }, [marker]);

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: number;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const getSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3 || !map) return;

      try {
        const center = map.getCenter();
        const response = await fetch(`${apiUrl}?q=${encodeURIComponent(query)}&lat=${center.lat}&lon=${center.lng}`);
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    }, 300),
    [map]
  );

  useEffect(() => {
    getSuggestions(query);
  }, [query, getSuggestions]);

  const selectFeature = (feature: Suggestion) => {
    setQuery('');
    setSuggestions([]);

    if (marker) {
      marker.remove();
    }

    if (map) {
        const newMarker = new maplibregl.Marker()
          .setLngLat([feature.longitude, feature.latitude])
          .addTo(map);
  
        setMarker(newMarker);
  
        map.flyTo({
          center: [feature.longitude, feature.latitude],
          zoom: 14,
          essential: true
        });
    }

    setSelectedFeature(feature);
    setOpenPanel('featureSearch');
  };

  const handleClosePanel = () => {
    setSelectedFeature(null);
    setOpenPanel(null);
    if (marker) {
      marker.remove();
      setMarker(null);
    }
  };

  const handleInputBlur = () => {
    // Delay the closing of suggestions to allow time for clicking on a suggestion
    suggestionTimeoutRef.current = window.setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleInputFocus = () => {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }
    selectFeature(suggestion);
  };

  useEffect(() => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [suggestions]);

  return (
    <SearchContainer>
      <SearchInput
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={handleInputBlur}
        onFocus={handleInputFocus}
        placeholder="Busque por nome"
      />
      {showSuggestions && suggestions.length > 0 && (
        <SuggestionsList>
          {suggestions.map((suggestion) => (
            <SuggestionItem
              key={suggestion.nome}
              onMouseDown={(e) => e.preventDefault()} // Prevent onBlur from firing before click
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <strong>{suggestion.tipo}:</strong> {suggestion.nome} ({suggestion.municipio}, {suggestion.estado})
            </SuggestionItem>
          ))}
        </SuggestionsList>
      )}
      {openPanel === 'featureSearch' && selectedFeature && (
        <FeatureSearchPanel 
          feature={selectedFeature} 
          onClose={handleClosePanel}
        />
      )}
    </SearchContainer>
  );
};

export default FeatureSearchControl;