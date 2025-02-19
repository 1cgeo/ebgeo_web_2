// Path: map3d\features\identify\api.ts
import { env } from '@/shared/config/env';

import {
  type FeatureInfo,
  type IdentifyPosition,
  featureInfoSchema,
} from './types';

const IDENTIFY_ENDPOINT = `${env.VITE_API_URL}/feicoes`;

export async function fetchFeatureInfo(
  position: IdentifyPosition,
): Promise<FeatureInfo> {
  const { latitude, longitude, height } = position;

  const response = await fetch(
    `${IDENTIFY_ENDPOINT}?lat=${latitude}&lon=${longitude}&z=${height}`,
  );

  if (!response.ok) {
    throw new Error(`Erro na resposta do servidor: ${response.status}`);
  }

  const data = await response.json();
  return featureInfoSchema.parse(data);
}
