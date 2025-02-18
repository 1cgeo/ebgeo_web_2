// Path: mapSig\features\mouseCoordinates\MouseCoordinatesDisplay\index.tsx
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SettingsIcon from '@mui/icons-material/Settings';
import { Tooltip } from '@mui/material';
import debounce from 'lodash/debounce';

import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { FormatSelector } from '../FormatSelector';
import { useMouseCoordinatesStore } from '../store';
import { formatCoordinates } from '../utils';
import {
  CoordinatesContainer,
  CoordinatesText,
  CopyButton,
  SettingsButton,
} from './styles';

export const MouseCoordinatesDisplay: FC = () => {
  const { map } = useMapsStore();
  const [copied, setCopied] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);

  const {
    coordinates,
    config,
    updateCoordinates,
    isFormatSelectorOpen,
    openFormatSelector,
    closeFormatSelector,
  } = useMouseCoordinatesStore();

  // Criar um handler de mouse move com debounce para melhor performance
  const debouncedUpdateCoordinates = useMemo(
    () =>
      debounce((lat: number, lng: number) => {
        updateCoordinates({ lat, lng });
      }, 50),
    [updateCoordinates],
  );

  // Handler para atualizar as coordenadas quando o mouse se move
  const handleMouseMove = useCallback(
    (e: { lngLat: { lng: number; lat: number } }) => {
      debouncedUpdateCoordinates(e.lngLat.lat, e.lngLat.lng);
    },
    [debouncedUpdateCoordinates],
  );

  // Registrar/remover o evento de mousemove
  useEffect(() => {
    if (!map) return;

    map.on('mousemove', handleMouseMove);

    return () => {
      map.off('mousemove', handleMouseMove);
      debouncedUpdateCoordinates.cancel(); // Limpar o debounce na desmontagem
    };
  }, [map, handleMouseMove, debouncedUpdateCoordinates]);

  // Formatar as coordenadas para exibição
  const displayText = formatCoordinates(
    coordinates,
    config.format,
    config.precision,
  );

  // Copiar coordenadas para a área de transferência
  const handleCopy = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(displayText)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
        .catch(err => {
          console.error('Falha ao copiar texto: ', err);
        });
    } else {
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = displayText;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (err) {
        console.error('Falha ao copiar texto: ', err);
      }
      document.body.removeChild(textArea);
    }
  }, [displayText]);

  // Abrir seletor de formato
  const handleOpenFormatSelector = useCallback(() => {
    openFormatSelector();
  }, [openFormatSelector]);

  return (
    <>
      <CoordinatesContainer $visible={config.visible && !!map}>
        <CoordinatesText>{displayText}</CoordinatesText>

        <Tooltip title={copied ? 'Copiado!' : 'Copiar coordenadas'} arrow>
          <CopyButton onClick={handleCopy} size="small" color="primary">
            <ContentCopyIcon fontSize="inherit" />
          </CopyButton>
        </Tooltip>

        <Tooltip title="Configurações" arrow>
          <SettingsButton
            onClick={handleOpenFormatSelector}
            size="small"
            ref={settingsButtonRef}
          >
            <SettingsIcon fontSize="inherit" />
          </SettingsButton>
        </Tooltip>
      </CoordinatesContainer>

      <FormatSelector
        anchorEl={isFormatSelectorOpen ? settingsButtonRef.current : null}
        onClose={closeFormatSelector}
      />
    </>
  );
};
