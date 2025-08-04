// Path: features\data-access\schemas\map.schema.ts

import { z } from 'zod';

// Schema para posição geográfica
const PositionSchema = z
  .tuple([z.number(), z.number()])
  .or(z.tuple([z.number(), z.number(), z.number()]));

// Schema para configuração de mapa
export const MapConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nome do mapa é obrigatório'),
  description: z.string().optional(),
  layerIds: z.array(z.string().uuid()).default([]),
  center: PositionSchema.default([-51.2177, -30.0346]), // Porto Alegre
  zoom: z.number().min(0).max(22).default(10),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Tipo inferido do schema
export type MapConfig = z.infer<typeof MapConfigSchema>;

// Função de validação
export const validateMapConfig = (map: unknown): MapConfig => {
  return MapConfigSchema.parse(map);
};

// Função para criar mapa padrão
export const createDefaultMap = (name: string, options: Partial<MapConfig> = {}): MapConfig => {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  return MapConfigSchema.parse({
    id,
    name,
    description: '',
    layerIds: [],
    center: [-51.2177, -30.0346], // Porto Alegre
    zoom: 10,
    createdAt: now,
    updatedAt: now,
    ...options,
  });
};
