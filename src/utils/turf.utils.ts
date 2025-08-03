// Path: utils\turf.utils.ts

import * as turf from '@turf/turf';
import { Position, Feature, FeatureCollection, Geometry } from 'geojson';
import { ExtendedFeature } from '../features/data-access/schemas/feature.schema';

// Tipos para operações geoespaciais
export type DistanceUnit = 'meters' | 'kilometers' | 'miles' | 'feet' | 'nautical';
export type AreaUnit = 'meters' | 'kilometers' | 'hectares' | 'acres' | 'miles' | 'feet';

/**
 * Operações de medição
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
    switch (unit) {
      case 'kilometers':
        return areaInMeters / 1000000;
      case 'hectares':
        return areaInMeters / 10000;
      case 'acres':
        return areaInMeters / 4046.86;
      case 'miles':
        return areaInMeters / 2589988.11;
      case 'feet':
        return areaInMeters / 0.092903;
      default:
        return areaInMeters;
    }
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
 * Operações espaciais
 */
export const spatial = {
  /**
   * Verificar se um ponto está dentro de um polígono
   */
  pointInPolygon: (point: Position, polygon: Position[][]): boolean => {
    const pt = turf.point(point);
    const poly = turf.polygon(polygon);
    return turf.booleanPointInPolygon(pt, poly);
  },

  /**
   * Verificar se duas geometrias se intersectam
   */
  intersects: (geometry1: Geometry, geometry2: Geometry): boolean => {
    try {
      return turf.booleanIntersects(geometry1 as any, geometry2 as any);
    } catch {
      return false;
    }
  },

  /**
   * Verificar se uma geometria está contida em outra
   */
  within: (geometry1: Geometry, geometry2: Geometry): boolean => {
    try {
      return turf.booleanWithin(geometry1 as any, geometry2 as any);
    } catch {
      return false;
    }
  },

  /**
   * Calcular interseção entre duas geometrias
   */
  intersection: (geometry1: Geometry, geometry2: Geometry): Feature | null => {
    try {
      return turf.intersect(geometry1 as any, geometry2 as any);
    } catch {
      return null;
    }
  },

  /**
   * Criar buffer ao redor de uma geometria
   */
  buffer: (geometry: Geometry, radius: number, unit: DistanceUnit = 'meters'): Feature | null => {
    try {
      return turf.buffer(geometry as any, radius, { units: unit });
    } catch {
      return null;
    }
  },

  /**
   * Encontrar features dentro de um raio
   */
  withinRadius: (
    features: ExtendedFeature[],
    center: Position,
    radius: number,
    unit: DistanceUnit = 'meters'
  ): ExtendedFeature[] => {
    const centerPoint = turf.point(center);
    
    return features.filter(feature => {
      try {
        const featureCenter = turf.centroid(feature.geometry as any);
        const distance = turf.distance(centerPoint, featureCenter, { units: unit });
        return distance <= radius;
      } catch {
        return false;
      }
    });
  },

  /**
   * Encontrar features dentro de um bounding box
   */
  withinBBox: (
    features: ExtendedFeature[],
    bbox: [number, number, number, number]
  ): ExtendedFeature[] => {
    return features.filter(feature => {
      try {
        const featureBBox = turf.bbox(feature.geometry as any);
        return (
          featureBBox[0] >= bbox[0] && // minX
          featureBBox[1] >= bbox[1] && // minY
          featureBBox[2] <= bbox[2] && // maxX
          featureBBox[3] <= bbox[3]    // maxY
        );
      } catch {
        return false;
      }
    });
  },

  /**
   * Encontrar a feature mais próxima de um ponto
   */
  nearest: (
    features: ExtendedFeature[],
    point: Position
  ): { feature: ExtendedFeature; distance: number } | null => {
    if (features.length === 0) return null;

    let nearest: ExtendedFeature | null = null;
    let minDistance = Infinity;

    const targetPoint = turf.point(point);

    features.forEach(feature => {
      try {
        const featureCenter = turf.centroid(feature.geometry as any);
        const distance = turf.distance(targetPoint, featureCenter, { units: 'meters' });
        
        if (distance < minDistance) {
          minDistance = distance;
          nearest = feature;
        }
      } catch {
        // Ignorar features com geometria inválida
      }
    });

    return nearest ? { feature: nearest, distance: minDistance } : null;
  },
};

/**
 * Operações de transformação
 */
export const transform = {
  /**
   * Simplificar geometria (reduzir número de vértices)
   */
  simplify: (geometry: Geometry, tolerance: number = 0.01, highQuality: boolean = false): Geometry => {
    try {
      const simplified = turf.simplify(geometry as any, { tolerance, highQuality });
      return simplified.geometry;
    } catch {
      return geometry;
    }
  },

  /**
   * Suavizar geometria
   */
  smooth: (coordinates: Position[], iterations: number = 1): Position[] => {
    if (coordinates.length < 3) return coordinates;

    let smoothed = [...coordinates];

    for (let iter = 0; iter < iterations; iter++) {
      const newCoords: Position[] = [];
      
      for (let i = 0; i < smoothed.length; i++) {
        if (i === 0 || i === smoothed.length - 1) {
          // Manter primeiro e último pontos
          newCoords.push(smoothed[i]);
        } else {
          // Calcular média ponderada
          const prev = smoothed[i - 1];
          const curr = smoothed[i];
          const next = smoothed[i + 1];
          
          const newX = (prev[0] + 2 * curr[0] + next[0]) / 4;
          const newY = (prev[1] + 2 * curr[1] + next[1]) / 4;
          
          newCoords.push([newX, newY]);
        }
      }
      
      smoothed = newCoords;
    }

    return smoothed;
  },

  /**
   * Reprojetar coordenadas (simplificado - apenas offset)
   */
  translate: (geometry: Geometry, distance: number, direction: number): Geometry => {
    try {
      const transformed = turf.transformTranslate(geometry as any, distance, direction, { units: 'meters' });
      return transformed.geometry;
    } catch {
      return geometry;
    }
  },

  /**
   * Rotacionar geometria
   */
  rotate: (geometry: Geometry, angle: number, pivot?: Position): Geometry => {
    try {
      const transformed = turf.transformRotate(geometry as any, angle, { pivot });
      return transformed.geometry;
    } catch {
      return geometry;
    }
  },

  /**
   * Escalar geometria
   */
  scale: (geometry: Geometry, factor: number, origin?: Position): Geometry => {
    try {
      const transformed = turf.transformScale(geometry as any, factor, { origin });
      return transformed.geometry;
    } catch {
      return geometry;
    }
  },
};

/**
 * Operações de análise
 */
export const analysis = {
  /**
   * Verificar auto-interseção em polígono
   */
  hasSelfIntersection: (coordinates: Position[][]): boolean => {
    try {
      const polygon = turf.polygon(coordinates);
      // Tentar criar buffer muito pequeno - se falhar, pode ter auto-interseção
      turf.buffer(polygon, 0.001, { units: 'meters' });
      return false;
    } catch {
      return true;
    }
  },

  /**
   * Verificar se polígono é válido
   */
  isValidPolygon: (coordinates: Position[][]): boolean => {
    try {
      const polygon = turf.polygon(coordinates);
      
      // Verificar área
      const area = turf.area(polygon);
      if (area === 0) return false;
      
      // Verificar auto-interseção
      return !analysis.hasSelfIntersection(coordinates);
    } catch {
      return false;
    }
  },

  /**
   * Calcular convex hull de um conjunto de pontos
   */
  convexHull: (points: Position[]): Position[] | null => {
    try {
      const pointFeatures = points.map(p => turf.point(p));
      const featureCollection = turf.featureCollection(pointFeatures);
      const hull = turf.convex(featureCollection);
      
      if (hull && hull.geometry.type === 'Polygon') {
        return hull.geometry.coordinates[0];
      }
      
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Calcular envelope (bounding box) de features
   */
  envelope: (features: ExtendedFeature[]): Position[][] | null => {
    try {
      const featureCollection = turf.featureCollection(features as any);
      const env = turf.envelope(featureCollection);
      
      if (env.geometry.type === 'Polygon') {
        return env.geometry.coordinates;
      }
      
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Agrupar pontos próximos (clustering simples)
   */
  clusterPoints: (
    points: Position[],
    maxDistance: number,
    unit: DistanceUnit = 'meters'
  ): Position[][] => {
    const clusters: Position[][] = [];
    const used = new Set<number>();

    points.forEach((point, index) => {
      if (used.has(index)) return;

      const cluster = [point];
      used.add(index);

      // Encontrar pontos próximos
      points.forEach((otherPoint, otherIndex) => {
        if (used.has(otherIndex)) return;

        const distance = measurements.distance(point, otherPoint, unit);
        if (distance <= maxDistance) {
          cluster.push(otherPoint);
          used.add(otherIndex);
        }
      });

      clusters.push(cluster);
    });

    return clusters;
  },
};

/**
 * Operações de conversão
 */
export const conversion = {
  /**
   * Converter features para FeatureCollection
   */
  toFeatureCollection: (features: ExtendedFeature[]): FeatureCollection => {
    return turf.featureCollection(features as any);
  },

  /**
   * Converter polígono para linha
   */
  polygonToLine: (coordinates: Position[][]): Position[] => {
    try {
      const polygon = turf.polygon(coordinates);
      const line = turf.polygonToLine(polygon);
      return line.geometry.coordinates as Position[];
    } catch {
      return coordinates[0] || [];
    }
  },

  /**
   * Converter linha para pontos
   */
  lineToPoints: (coordinates: Position[], distance?: number): Position[] => {
    try {
      const line = turf.lineString(coordinates);
      
      if (distance) {
        // Pontos em intervalos específicos
        const length = turf.length(line, { units: 'meters' });
        const points: Position[] = [];
        
        for (let i = 0; i <= length; i += distance) {
          const point = turf.along(line, i, { units: 'meters' });
          points.push(point.geometry.coordinates as Position);
        }
        
        return points;
      } else {
        // Apenas vértices
        return coordinates;
      }
    } catch {
      return coordinates;
    }
  },

  /**
   * Dividir linha em segmentos
   */
  lineSegments: (coordinates: Position[]): Position[][] => {
    const segments: Position[][] = [];
    
    for (let i = 0; i < coordinates.length - 1; i++) {
      segments.push([coordinates[i], coordinates[i + 1]]);
    }
    
    return segments;
  },
};

/**
 * Utilitários de snap
 */
export const snap = {
  /**
   * Encontrar vértice mais próximo para snap
   */
  nearestVertex: (
    point: Position,
    features: ExtendedFeature[],
    tolerance: number = 10 // pixels
  ): { position: Position; featureId: string; vertexIndex: number } | null => {
    let nearest: { position: Position; featureId: string; vertexIndex: number } | null = null;
    let minDistance = Infinity;

    features.forEach(feature => {
      const vertices = extractVertices(feature.geometry);
      
      vertices.forEach((vertex, index) => {
        const distance = measurements.distance(point, vertex, 'meters');
        
        if (distance < minDistance) {
          minDistance = distance;
          nearest = {
            position: vertex,
            featureId: feature.id,
            vertexIndex: index,
          };
        }
      });
    });

    // Converter tolerância de pixels para metros (aproximado)
    const toleranceMeters = tolerance * 0.1; // Aproximação simples
    
    return nearest && minDistance <= toleranceMeters ? nearest : null;
  },

  /**
   * Encontrar ponto mais próximo em uma linha para snap
   */
  nearestPointOnLine: (
    point: Position,
    lineCoordinates: Position[]
  ): Position => {
    try {
      const targetPoint = turf.point(point);
      const line = turf.lineString(lineCoordinates);
      const snapped = turf.nearestPointOnLine(line, targetPoint);
      return snapped.geometry.coordinates as Position;
    } catch {
      return point;
    }
  },

  /**
   * Snap para grid
   */
  toGrid: (point: Position, gridSize: number): Position => {
    const [lng, lat] = point;
    
    // Converter para metros (aproximado)
    const meterToDegreeLng = 1 / 111320;
    const meterToDegreeLat = 1 / 110540;
    
    const gridSizeLng = gridSize * meterToDegreeLng;
    const gridSizeLat = gridSize * meterToDegreeLat;
    
    const snappedLng = Math.round(lng / gridSizeLng) * gridSizeLng;
    const snappedLat = Math.round(lat / gridSizeLat) * gridSizeLat;
    
    return [snappedLng, snappedLat];
  },
};

/**
 * Função auxiliar para extrair vértices de uma geometria
 */
function extractVertices(geometry: Geometry): Position[] {
  const vertices: Position[] = [];

  switch (geometry.type) {
    case 'Point':
      vertices.push(geometry.coordinates as Position);
      break;
    case 'LineString':
      vertices.push(...geometry.coordinates);
      break;
    case 'Polygon':
      // Adicionar vértices de todos os anéis
      geometry.coordinates.forEach(ring => {
        vertices.push(...ring.slice(0, -1)); // Remover último ponto (fechamento)
      });
      break;
  }

  return vertices;
}

/**
 * Export consolidado
 */
export const geoUtils = {
  measurements,
  spatial,
  transform,
  analysis,
  conversion,
  snap,
};