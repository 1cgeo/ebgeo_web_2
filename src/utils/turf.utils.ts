// Path: utils\turf.utils.ts
import * as turf from '@turf/turf';
import { Position, Geometry } from 'geojson';

// Tipos básicos para operações geoespaciais
export type DistanceUnit = 'meters' | 'kilometers';
export type AreaUnit = 'meters' | 'kilometers';

/**
 * Operações de medição essenciais
 */
export const measurements = {
  /**
   * Calcular distância entre dois pontos
   */
  distance: (point1: Position, point2: Position, unit: DistanceUnit = 'meters'): number => {
    const from = turf.point(point1);
    const to = turf.point(point2);
    return turf.distance(from, to, { units: unit });
  },

  /**
   * Calcular comprimento de uma linha
   */
  length: (coordinates: Position[], unit: DistanceUnit = 'meters'): number => {
    if (coordinates.length < 2) return 0;

    const line = turf.lineString(coordinates);
    return turf.length(line, { units: unit });
  },

  /**
   * Calcular área de um polígono
   */
  area: (coordinates: Position[][], unit: AreaUnit = 'meters'): number => {
    if (coordinates.length === 0 || coordinates[0].length < 4) return 0;

    const polygon = turf.polygon(coordinates);
    const areaInMeters = turf.area(polygon);

    // Converter para unidade desejada
    return unit === 'kilometers' ? areaInMeters / 1000000 : areaInMeters;
  },

  /**
   * Calcular perímetro de um polígono
   */
  perimeter: (coordinates: Position[][], unit: DistanceUnit = 'meters'): number => {
    if (coordinates.length === 0 || coordinates[0].length < 4) return 0;

    const polygon = turf.polygon(coordinates);
    const line = turf.polygonToLine(polygon);
    return turf.length(line, { units: unit });
  },

  /**
   * Calcular bearing (azimute) entre dois pontos
   */
  bearing: (point1: Position, point2: Position): number => {
    const from = turf.point(point1);
    const to = turf.point(point2);
    return turf.bearing(from, to);
  },

  /**
   * Calcular ponto médio entre dois pontos
   */
  midpoint: (point1: Position, point2: Position): Position => {
    const from = turf.point(point1);
    const to = turf.point(point2);
    const mid = turf.midpoint(from, to);
    return mid.geometry.coordinates as Position;
  },

  /**
   * Calcular centro (centroid) de uma geometria
   */
  centroid: (geometry: Geometry): Position => {
    const center = turf.centroid(geometry as any);
    return center.geometry.coordinates as Position;
  },

  /**
   * Calcular bounding box de uma geometria
   */
  bbox: (geometry: Geometry): [number, number, number, number] => {
    return turf.bbox(geometry as any);
  },
};

/**
 * Operações espaciais básicas
 */
export const spatial = {
  /**
   * Verificar se um ponto está dentro de um polígono
   */
  pointInPolygon: (point: Position, polygon: Position[][]): boolean => {
    try {
      const pt = turf.point(point);
      const poly = turf.polygon(polygon);
      return turf.booleanPointInPolygon(pt, poly);
    } catch {
      return false;
    }
  },

  /**
   * Verificar se uma geometria intersecta com outra
   */
  intersects: (geometry1: Geometry, geometry2: Geometry): boolean => {
    try {
      return turf.booleanIntersects(geometry1 as any, geometry2 as any);
    } catch {
      return false;
    }
  },

  /**
   * Calcular intersecção entre duas geometrias
   */
  intersection: (geometry1: Geometry, geometry2: Geometry): Geometry | null => {
    try {
      const result = turf.intersect(geometry1 as any, geometry2 as any);
      return result ? result.geometry : null;
    } catch {
      return null;
    }
  },

  /**
   * Criar buffer ao redor de uma geometria
   */
  buffer: (geometry: Geometry, radius: number, unit: DistanceUnit = 'meters'): Geometry | null => {
    try {
      const buffered = turf.buffer(geometry as any, radius, { units: unit });
      return buffered ? buffered.geometry : null;
    } catch {
      return null;
    }
  },

  /**
   * Verificar se um ponto está dentro de um raio de outro ponto
   */
  withinDistance: (
    point1: Position,
    point2: Position,
    distance: number,
    unit: DistanceUnit = 'meters'
  ): boolean => {
    try {
      const actualDistance = measurements.distance(point1, point2, unit);
      return actualDistance <= distance;
    } catch {
      return false;
    }
  },
};

/**
 * Utilitários geométricos
 */
export const geoUtils = {
  /**
   * Simplificar geometria (reduzir número de vértices)
   */
  simplify: (geometry: Geometry, tolerance: number = 0.01): Geometry => {
    try {
      const simplified = turf.simplify(geometry as any, { tolerance, highQuality: false });
      return simplified.geometry;
    } catch {
      return geometry;
    }
  },

  /**
   * Verificar se polígono é válido (não auto-intersectante)
   */
  isValidPolygon: (coordinates: Position[][]): boolean => {
    try {
      const polygon = turf.polygon(coordinates);
      // Tentar criar buffer pequeno - se falhar, pode ter problema
      turf.buffer(polygon, 0.001, { units: 'meters' });
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Calcular envelope (bounding box) como polígono
   */
  envelope: (geometry: Geometry): Position[][] | null => {
    try {
      const env = turf.envelope(geometry as any);
      if (env.geometry.type === 'Polygon') {
        return env.geometry.coordinates;
      }
      return null;
    } catch {
      return null;
    }
  },
};
