// Path: map3d\features\identify\types.ts
import { z } from 'zod';

// Schema para informações de feature
export const featureInfoSchema = z.object({
  nome: z.string().optional(),
  municipio: z.string().optional(),
  estado: z.string().optional(),
  tipo: z.string().optional(),
  altitude_base: z.number().optional(),
  altitude_topo: z.number().optional(),
  message: z.string().optional(),
});

// Schema para posição de identificação
export const identifyPositionSchema = z.object({
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  height: z.number(),
});

// Schema para configurações de estilo do painel
export const identifyStyleSchema = z.object({
  panelBackgroundColor: z.string().default('#ffffff'),
  panelTextColor: z.string().default('#000000'),
  panelBorderColor: z.string().default('#cccccc'),
  panelWidth: z.number().min(200).max(600).default(300),
});

// Type inferidos
export type FeatureInfo = z.infer<typeof featureInfoSchema>;
export type IdentifyPosition = z.infer<typeof identifyPositionSchema>;
export type IdentifyStyle = z.infer<typeof identifyStyleSchema>;

// Estado da ferramenta
export enum IdentifyToolState {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  LOADING = 'loading',
  ERROR = 'error',
}
