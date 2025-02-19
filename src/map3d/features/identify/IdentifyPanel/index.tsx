// Path: map3d\features\identify\IdentifyPanel\index.tsx
import { type FC } from 'react';

import { useIdentifyStore } from '../store';
import { CloseButton, FeatureInfoContainer } from './styles';

export const FeatureInfoPanel: FC = () => {
  const { featureInfo, error, style, clearInfo } = useIdentifyStore();

  if (!featureInfo && !error) return null;

  let content;
  if (error) {
    content = (
      <p>
        <strong>Erro:</strong> {error}
      </p>
    );
  } else if (featureInfo?.message) {
    content = (
      <p>
        <strong>Aviso:</strong> {featureInfo.message}
      </p>
    );
  } else {
    content = (
      <>
        <h3>Informações da Feature</h3>
        {featureInfo?.nome && (
          <p>
            <strong>Nome:</strong> {featureInfo.nome}
          </p>
        )}
        {featureInfo?.municipio && (
          <p>
            <strong>Município:</strong> {featureInfo.municipio}
          </p>
        )}
        {featureInfo?.estado && (
          <p>
            <strong>Estado:</strong> {featureInfo.estado}
          </p>
        )}
        {featureInfo?.tipo && (
          <p>
            <strong>Tipo:</strong> {featureInfo.tipo}
          </p>
        )}
        {featureInfo?.altitude_base !== undefined && (
          <p>
            <strong>Altitude Base:</strong> {featureInfo.altitude_base} m
          </p>
        )}
        {featureInfo?.altitude_topo !== undefined && (
          <p>
            <strong>Altitude Topo:</strong> {featureInfo.altitude_topo} m
          </p>
        )}
      </>
    );
  }

  return (
    <FeatureInfoContainer
      $backgroundColor={style.panelBackgroundColor}
      $textColor={style.panelTextColor}
      $borderColor={style.panelBorderColor}
      $width={style.panelWidth}
    >
      <CloseButton onClick={clearInfo}>✕</CloseButton>
      {content}
    </FeatureInfoContainer>
  );
};
