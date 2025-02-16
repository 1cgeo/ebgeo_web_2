// Path: map3d\features\identify\api.ts
import { env } from '@/shared/config/env';

import { type Coordinates, type FeatureInfo, apiResponseSchema } from './types';

const IDENTIFY_ENDPOINT = `${env.VITE_API_URL}/feicoes`;

export async function fetchFeatureInfo(
  coordinates: Coordinates,
): Promise<FeatureInfo> {
  const { lat, lon, height } = coordinates;

  const response = await fetch(
    `${IDENTIFY_ENDPOINT}?lat=${lat}&lon=${lon}&z=${height}`,
  );

  if (!response.ok) {
    throw new Error('Falha ao buscar informações da feição');
  }

  const data = await response.json();
  const validatedData = apiResponseSchema.parse(data);

  if (!validatedData.success) {
    throw new Error('Resposta da API inválida');
  }

  return validatedData.data;
}
