// Path: map3d\types.ts
import { z } from 'zod';

// SCHEMAS BÁSICOS
// Schema para handlers do Cesium
export const handlers3DSchema = z
  .object({
    cesiumMeasure: z.any(),
    cesiumViewshed: z.any(),
    cesiumLabel: z.any(),
  })
  .strict();

// Schema para posição da câmera
export const camera3DSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    height: z.number().min(0),
    heading: z.number().min(-180).max(180),
    pitch: z.number().min(-90).max(90),
    roll: z.number().min(-180).max(180),
  })
  .strict();

// Schema para configurações do mapa
export const map3DOptionsSchema = z
  .object({
    baseMap: z.boolean().default(true),
    terrain: z.boolean().default(true),
    lighting: z.boolean().default(true),
    atmosphere: z.boolean().default(true),
  })
  .strict();

// Schema para coordenadas cartesianas (usado por múltiplas features)
export const cartesian3Schema = z
  .object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  })
  .strict();

// Schema para retângulo de visualização
// Primeiro define o objeto com .strict() e depois aplica o refinamento
export const viewRectangleSchema = z
  .object({
    west: z.number().min(-180).max(180),
    south: z.number().min(-90).max(90),
    east: z.number().min(-180).max(180),
    north: z.number().min(-90).max(90),
  })
  .strict()
  .refine(rect => rect.west < rect.east && rect.south < rect.north, {
    message:
      'Coordenadas inválidas: west deve ser menor que east e south deve ser menor que north',
  });

// SCHEMAS PARA MODELOS 3D
// Schema para coordenadas
export const coordinatesSchema = z
  .object({
    lat: z.number(),
    lon: z.number(),
    height: z.number().optional(),
  })
  .strict();

// Schema para estilo
export const styleSchema = z
  .object({
    color: z.string().regex(/^#([0-9A-F]{6}|[0-9A-F]{8})$/i),
    opacity: z.number().min(0).max(1),
    width: z.number().min(1),
  })
  .strict();

// Schema base para modelos 3D
export const model3DBaseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.enum(['Tiles 3D', 'Modelos 3D', 'Nuvem de Pontos']),
    url: z.string(),
    thumbnail: z.string(),
    data_criacao: z.string(),
    municipio: z.string(),
    estado: z.string(),
    palavras_chave: z.array(z.string()),
    coordinates: coordinatesSchema,
    visible: z.boolean().default(true),
  })
  .strict();

// Schemas específicos para tipos de modelos
export const tiles3DSchema = model3DBaseSchema
  .extend({
    type: z.literal('Tiles 3D'),
    heightoffset: z.number(),
    maximumscreenspaceerror: z.number(),
  })
  .strict();

export const modelos3DSchema = model3DBaseSchema
  .extend({
    type: z.literal('Modelos 3D'),
    heading: z.number(),
    pitch: z.number(),
    roll: z.number(),
  })
  .strict();

export const nuvemPontosSchema = model3DBaseSchema
  .extend({
    type: z.literal('Nuvem de Pontos'),
    style: z.record(z.any()),
  })
  .strict();

export const model3DSchema = z.discriminatedUnion('type', [
  tiles3DSchema,
  modelos3DSchema,
  nuvemPontosSchema,
]);

// Schema para ferramentas
export const toolSchema = z
  .object({
    id: z.string(),
    active: z.boolean(),
    options: z.record(z.any()).optional(),
  })
  .strict();

// Schema para estado
export const stateSchema = z
  .object({
    activeTool: z.string().nullable(),
    models: z.array(model3DSchema),
    tools: z.record(toolSchema),
  })
  .strict();

// TYPES INFERIDOS
export type Handlers3D = z.infer<typeof handlers3DSchema>;
export type Camera3D = z.infer<typeof camera3DSchema>;
export type Map3DOptions = z.infer<typeof map3DOptionsSchema>;
export type Cartesian3 = z.infer<typeof cartesian3Schema>;
export type ViewRectangle = z.infer<typeof viewRectangleSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type Style = z.infer<typeof styleSchema>;
export type Model3DBase = z.infer<typeof model3DBaseSchema>;
export type Tiles3D = z.infer<typeof tiles3DSchema>;
export type Modelos3D = z.infer<typeof modelos3DSchema>;
export type NuvemPontos = z.infer<typeof nuvemPontosSchema>;
export type Model3D = z.infer<typeof model3DSchema>;
export type Tool = z.infer<typeof toolSchema>;
export type State = z.infer<typeof stateSchema>;

// CONSTANTES
export const DEFAULT_VIEW_RECTANGLE: ViewRectangle = {
  west: -44.449656,
  south: -22.455922,
  east: -44.449654,
  north: -22.45592,
};

export const DEFAULT_CAMERA: Camera3D = {
  latitude: -22.4546061,
  longitude: -44.4481491,
  height: 424.7,
  heading: 164,
  pitch: -2,
  roll: -1,
};

export const DEFAULT_OPTIONS: Map3DOptions = {
  baseMap: true,
  terrain: true,
  lighting: true,
  atmosphere: true,
};

// FUNÇÕES DE VALIDAÇÃO
export function validateCamera(camera: unknown): Camera3D {
  return camera3DSchema.parse(camera);
}

export function validateOptions(options: unknown): Map3DOptions {
  return map3DOptionsSchema.parse(options);
}

export function validateCartesian(point: unknown): Cartesian3 {
  return cartesian3Schema.parse(point);
}

export function validateViewRectangle(rect: unknown): ViewRectangle {
  return viewRectangleSchema.parse(rect);
}

export function validateModel(model: unknown): Model3D {
  return model3DSchema.parse(model);
}

// HELPERS PARA VERIFICAÇÃO DE TIPO
export function isTiles3D(model: Model3D): model is Tiles3D {
  return model.type === 'Tiles 3D';
}

export function isModelos3D(model: Model3D): model is Modelos3D {
  return model.type === 'Modelos 3D';
}

export function isNuvemPontos(model: Model3D): model is NuvemPontos {
  return model.type === 'Nuvem de Pontos';
}
