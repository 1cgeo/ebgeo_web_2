// Path: mapSig\features\mouseCoordinates\types.ts
import { z } from 'zod';

// Tipos de formatos de coordenadas disponíveis
export const coordinateFormatSchema = z.enum([
  'decimal', // Formato decimal (ex: 45.12345, -75.67890)
  'dms', // Graus, minutos, segundos (ex: 45° 7' 24.42" N, 75° 40' 44.04" W)
  'utm', // Universal Transverse Mercator (ex: 18T 445123 5000000)
  'mgrs', // Military Grid Reference System (ex: 18TXM 45123 00000)
]);

export type CoordinateFormat = z.infer<typeof coordinateFormatSchema>;

// Configuração do display de coordenadas
export const coordinateConfigSchema = z.object({
  format: coordinateFormatSchema,
  precision: z.number().int().min(0).max(6).default(5),
  visible: z.boolean().default(true),
});

export type CoordinateConfig = z.infer<typeof coordinateConfigSchema>;

// Coordenadas em formato decimal
export const decimalCoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export type DecimalCoordinates = z.infer<typeof decimalCoordinatesSchema>;

// Tipos de eventos de coordenadas
export const mouseEventSchema = z.object({
  coordinates: decimalCoordinatesSchema,
  timestamp: z.number(),
});

export type MouseEvent = z.infer<typeof mouseEventSchema>;

// Validação de coordenadas
export function validateDecimalCoordinates(
  coords: unknown,
): DecimalCoordinates {
  return decimalCoordinatesSchema.parse(coords);
}

// Validação de configuração
export function validateCoordinateConfig(config: unknown): CoordinateConfig {
  return coordinateConfigSchema.parse(config);
}
