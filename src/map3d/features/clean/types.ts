// Path: map3d\features\clean\types.ts
import { z } from 'zod';

// Schema para configuração do botão clean
export const cleanConfigSchema = z
  .object({
    icon: z.string().default('/images/icon-clear.svg'),
    tooltip: z.string().default('Limpar medições e análises'),
  })
  .strict();

// Type inferido
export type CleanConfig = z.infer<typeof cleanConfigSchema>;

// Configuração padrão
export const defaultCleanConfig: CleanConfig = {
  icon: '/images/icon-clear.svg',
  tooltip: 'Limpar medições e análises',
};
