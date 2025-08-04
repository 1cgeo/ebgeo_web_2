// Path: features\data-access\schemas\layer.schema.ts

import { z } from 'zod';

// Schema para configuração de camada
export const LayerConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nome da camada é obrigatório'),
  visible: z.boolean().default(true),
  opacity: z.number().min(0).max(1).default(1),
  zIndex: z.number().int().min(0).default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Tipo inferido do schema
export type LayerConfig = z.infer<typeof LayerConfigSchema>;

// Função de validação
export const validateLayerConfig = (layer: unknown): LayerConfig => {
  return LayerConfigSchema.parse(layer);
};

// Função para criar camada padrão
export const createDefaultLayer = (
  name: string,
  options: Partial<LayerConfig> = {}
): LayerConfig => {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  return LayerConfigSchema.parse({
    id,
    name,
    visible: true,
    opacity: 1,
    zIndex: 0,
    createdAt: now,
    updatedAt: now,
    ...options,
  });
};
