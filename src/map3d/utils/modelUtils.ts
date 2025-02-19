// Path: map3d\utils\modelUtils.ts
import { env } from '@/shared/config/env';

import { type Model3D } from '../types';

export function getModelUrl(type: Model3D['type'], path: string): string {
  const baseUrl = env.VITE_SOURCE_MODELS_URL;

  switch (type) {
    case 'Tiles 3D':
      return `${baseUrl}/3d/${path}`;
    case 'Modelos 3D':
      return `${baseUrl}/3d/${path}`;
    case 'Nuvem de Pontos':
      return `${baseUrl}/point-cloud/${path}`;
    default:
      throw new Error(`Tipo de modelo não suportado: ${type}`);
  }
}

export function getModelThumbnailUrl(model: Model3D): string {
  return getModelUrl(model.type, model.thumbnail);
}

export function getModelSourceUrl(model: Model3D): string {
  return getModelUrl(model.type, model.url);
}
