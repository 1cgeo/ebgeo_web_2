// Path: map3d\features\catalog\types.ts
import { z } from 'zod';

// Schema para tipos de modelos
export const modelTypeSchema = z.enum([
  'Tiles 3D',
  'Modelos 3D',
  'Nuvem de Pontos',
]);

// Schema base para modelos 3D
export const model3DBaseSchema = z
  .object({
    id: z.string(),
    nome: z.string(),
    descricao: z.string(),
    tipo: modelTypeSchema,
    url: z.string(),
    thumbnail: z.string(),
    data_criacao: z.string(),
    municipio: z.string(),
    estado: z.string(),
    palavras_chave: z.array(z.string()),
    coordenadas: z
      .object({
        lat: z.number(),
        lon: z.number(),
        altura: z.number(),
      })
      .strict(),
    visivel: z.boolean().default(true),
  })
  .strict();

// Schema específico para Tiles 3D
export const tiles3DSchema = model3DBaseSchema
  .extend({
    tipo: z.literal('Tiles 3D'),
    offset_altura: z.number(),
    erro_maximo_tela: z.number(),
  })
  .strict();

// Schema específico para Modelos 3D
export const modelos3DSchema = model3DBaseSchema
  .extend({
    tipo: z.literal('Modelos 3D'),
    heading: z.number(),
    pitch: z.number(),
    roll: z.number(),
  })
  .strict();

// Schema específico para Nuvem de Pontos
export const nuvemPontosSchema = model3DBaseSchema
  .extend({
    tipo: z.literal('Nuvem de Pontos'),
    estilo: z.record(z.any()),
  })
  .strict();

// Schema para resposta da API
export const catalogResponseSchema = z
  .object({
    data: z.array(
      z.discriminatedUnion('tipo', [
        tiles3DSchema,
        modelos3DSchema,
        nuvemPontosSchema,
      ]),
    ),
    total: z.number(),
    pagina: z.number(),
    por_pagina: z.number(),
  })
  .strict();

// Schema para parâmetros de busca
export const searchParamsSchema = z
  .object({
    query: z.string().optional(),
    pagina: z.number().min(1).default(1),
    por_pagina: z.number().min(1).max(50).default(10),
  })
  .strict();

// Types inferidos
export type ModelType = z.infer<typeof modelTypeSchema>;
export type Model3DBase = z.infer<typeof model3DBaseSchema>;
export type Tiles3D = z.infer<typeof tiles3DSchema>;
export type Modelos3D = z.infer<typeof modelos3DSchema>;
export type NuvemPontos = z.infer<typeof nuvemPontosSchema>;
export type CatalogResponse = z.infer<typeof catalogResponseSchema>;
export type SearchParams = z.infer<typeof searchParamsSchema>;

// Type helper para qualquer tipo de modelo
export type Model3D = Tiles3D | Modelos3D | NuvemPontos;

// Configurações padrão
export const defaultSearchParams: SearchParams = {
  pagina: 1,
  por_pagina: 10,
};
