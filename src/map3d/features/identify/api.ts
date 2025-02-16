// Path: map3d\features\identify\api.ts
import { env } from '@/shared/config/env';

import { type Coordinates, type FeatureInfo, featureInfoSchema } from './types';

export async function fetchFeatureInfo(
  coordinates: Coordinates,
): Promise<FeatureInfo> {
  const { lat, lon, height } = coordinates;

  const response = await fetch(
    `${env.VITE_API_URL}/feicoes?lat=${lat}&lon=${lon}&z=${height}`,
  );

  if (!response.ok) {
    throw new Error('Falha ao buscar informações da feição');
  }

  const data = await response.json();
  return featureInfoSchema.parse(data);
}
