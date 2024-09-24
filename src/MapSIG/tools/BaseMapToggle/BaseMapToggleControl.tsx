import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useMain } from '../../../contexts/MainContext';
import topoBaseMapStyles from './topoBaseMapStyles';
import ortoBaseMapStyles from './ortoBaseMapStyles';

const ToggleButton = styled.div<{ $isOrtho: boolean }>`
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 80px;
  height: 80px;
  background-image: url(${props => props.$isOrtho ? '/images/imagem_topo.png' : '/images/imagem_orto.png'});
  background-size: cover;
  cursor: pointer;
  border-radius: 4px;
  transition: box-shadow 0.3s ease;
  z-index: 1000;
  border: 1px solid ${props => props.$isOrtho ? '#fff' : '#000'};
  &:hover {
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  }
`;

const HoverText = styled.div`
  position: absolute;
  bottom: 105px;
  left: 35px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.3s ease;
  z-index: 1001;
`;

const BaseMapToggleControl: React.FC = () => {
  const { map } = useMain();
  const [isOrtho, setIsOrtho] = useState(false);
  const [showHoverText, setShowHoverText] = useState(false);

  useEffect(() => {
    if (map) {
      map.setStyle(isOrtho ? ortoBaseMapStyles : topoBaseMapStyles);
    }
  }, [isOrtho, map]);

  const toggleBaseMap = () => {
    setIsOrtho(!isOrtho);
  };

  return (
    <>
      <ToggleButton
        $isOrtho={isOrtho}
        onClick={toggleBaseMap}
        onMouseEnter={() => setShowHoverText(true)}
        onMouseLeave={() => setShowHoverText(false)}
      />
      {showHoverText && (
        <HoverText>
          {isOrtho ? 'Mudar mapa para carta topográfica' : 'Mudar mapa para carta ortoimagem'}
        </HoverText>
      )}
    </>
  );
};

export default BaseMapToggleControl;