import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useMain } from '../../../contexts/MainContext';
import { usePanel } from '../../contexts/PanelContext';
import FeatureSearchPanel from './FeatureSearchPanel';
import styled from 'styled-components';
import config from '../../../config';
import Tool from '../Tool';
import {
  Suggestion,
  GenericMarker
} from "../../../ts/types/mapSig.types";


const SearchContainer = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  top: 5px;
  right: 60px;
  z-index: 1000;
  background-color: white;
  padding: 5px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: ${props => props.$isVisible ? 'block' : 'none'};
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
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const suggestionTimeoutRef = useRef<number | null>(null);

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
        const response = await fetch(`${config.endpoints.featureSearch}?q=${encodeURIComponent(query)}&lat=${center.lat}&lon=${center.lng}`);
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

  const toggleSearch = useCallback(() => {
    
    setIsSearchVisible(prev => !prev);
  }, []);

  useEffect(() => {
    if (isSearchVisible) {
      // Focus the input when search becomes visible
      const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, [isSearchVisible]);

  return (
    <>
      <Tool
        id="tool-featureSearch"
        image="/images/search-globe.svg"
        active={true}
        inUse={isSearchVisible}
        tooltip="Buscar por nomes geográficos"
        onClick={toggleSearch}
      />
      <SearchContainer $isVisible={isSearchVisible}>
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
                key={`${suggestion.nome} ${suggestion.municipio} ${suggestion.estado}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <strong>{suggestion.tipo}:</strong> {suggestion.nome} ({suggestion.municipio}, {suggestion.estado})
              </SuggestionItem>
            ))}
          </SuggestionsList>
        )}
      </SearchContainer>
      {openPanel === 'featureSearch' && selectedFeature && (
        <FeatureSearchPanel 
          feature={selectedFeature} 
          onClose={handleClosePanel}
        />
      )}
    </>
  );
};

export default FeatureSearchControl;