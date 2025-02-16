// Path: map3d\features\identify\IdentifyPanel\index.tsx
import { CircularProgress, Typography } from '@mui/material';

import { type FC } from 'react';

import { useIdentifyStore } from '../store';
import { useIdentify } from '../useIdentify';
import { CloseButton, InfoGroup, PanelContainer } from './styles';

export const IdentifyPanel: FC = () => {
  const { isPanelOpen, featureInfo, error, closePanel } = useIdentifyStore();

  const { isLoading } = useIdentify();

  if (!isPanelOpen) return null;

  return (
    <PanelContainer>
      <CloseButton onClick={closePanel} />

      {isLoading ? (
        <CircularProgress size={24} />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : featureInfo?.message ? (
        <Typography>
          <strong>Aviso:</strong> {featureInfo.message}
        </Typography>
      ) : featureInfo ? (
        <>
          <Typography variant="h6" gutterBottom>
            Informações da Feição
          </Typography>

          <InfoGroup>
            <Typography>
              <strong>Nome:</strong> {featureInfo.nome}
            </Typography>
            <Typography>
              <strong>Município:</strong> {featureInfo.municipio}
            </Typography>
            <Typography>
              <strong>Estado:</strong> {featureInfo.estado}
            </Typography>
            <Typography>
              <strong>Tipo:</strong> {featureInfo.tipo}
            </Typography>
            {featureInfo.altitude_base !== undefined && (
              <Typography>
                <strong>Altitude Base:</strong> {featureInfo.altitude_base} m
              </Typography>
            )}
            {featureInfo.altitude_topo !== undefined && (
              <Typography>
                <strong>Altitude Topo:</strong> {featureInfo.altitude_topo} m
              </Typography>
            )}
          </InfoGroup>
        </>
      ) : null}
    </PanelContainer>
  );
};
