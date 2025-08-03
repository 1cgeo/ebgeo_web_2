// Path: utils\validation.utils.ts

import { Position, Geometry } from 'geojson';
import { ExtendedFeature } from '../features/data-access/schemas/feature.schema';
import { DATA_LIMITS, VALIDATION_CONFIG } from '../constants/app.constants';

// Tipos para resultados de validação
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface GeometryValidationResult extends ValidationResult {
  geometryType?: string;
  coordinateCount?: number;
  bounds?: [number, number, number, number];
}

/**
 * Validação de coordenadas
 */
export const validateCoordinates = {
  /**
   * Validar uma posição (longitude, latitude)
   */
  position: (position: Position): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(position)) {
      errors.push('Posição deve ser um array');
      return { valid: false, errors, warnings };
    }

    if (position.length < 2) {
      errors.push('Posição deve ter pelo menos longitude e latitude');
      return { valid: false, errors, warnings };
    }

    const [lng, lat] = position;

    // Validar tipos
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      errors.push('Longitude e latitude devem ser números');
      return { valid: false, errors, warnings };
    }

    // Validar NaN e Infinity
    if (!isFinite(lng) || !isFinite(lat)) {
      errors.push('Longitude e latitude devem ser números válidos');
      return { valid: false, errors, warnings };
    }

    // Validar limites
    if (lng < -180 || lng > 180) {
      errors.push(`Longitude fora dos limites válidos (-180 a 180): ${lng}`);
    }

    if (lat < -90 || lat > 90) {
      errors.push(`Latitude fora dos limites válidos (-90 a 90): ${lat}`);
    }

    // Validar precisão (warning)
    const lngDecimals = (lng.toString().split('.')[1] || '').length;
    const latDecimals = (lat.toString().split('.')[1] || '').length;
    
    if (lngDecimals > DATA_LIMITS.maxCoordinatePrecision || latDecimals > DATA_LIMITS.maxCoordinatePrecision) {
      warnings.push(`Precisão muito alta nas coordenadas (máximo ${DATA_LIMITS.maxCoordinatePrecision} casas decimais)`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },

  /**
   * Validar array de posições
   */
  positions: (positions: Position[]): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(positions)) {
      errors.push('Coordenadas devem ser um array');
      return { valid: false, errors, warnings };
    }

    if (positions.length === 0) {
      errors.push('Array de coordenadas não pode estar vazio');
      return { valid: false, errors, warnings };
    }

    // Validar cada posição
    positions.forEach((position, index) => {
      const result = validateCoordinates.position(position);
      if (!result.valid) {
        errors.push(...result.errors.map(error => `Posição ${index}: ${error}`));
      }
      warnings.push(...result.warnings.map(warning => `Posição ${index}: ${warning}`));
    });

    // Verificar duplicatas próximas
    for (let i = 0; i < positions.length - 1; i++) {
      const [lng1, lat1] = positions[i];
      const [lng2, lat2] = positions[i + 1];
      const distance = Math.sqrt((lng2 - lng1) ** 2 + (lat2 - lat1) ** 2);
      
      if (distance < VALIDATION_CONFIG.geometryTolerance) {
        warnings.push(`Pontos ${i} e ${i + 1} são muito próximos`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },
};

/**
 * Validação de geometrias
 */
export const validateGeometry = {
  /**
   * Validar geometria Point
   */
  point: (geometry: any): GeometryValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (geometry.type !== 'Point') {
      errors.push('Tipo de geometria deve ser Point');
      return { valid: false, errors, warnings };
    }

    const coordResult = validateCoordinates.position(geometry.coordinates);
    errors.push(...coordResult.errors);
    warnings.push(...coordResult.warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      geometryType: 'Point',
      coordinateCount: 1,
    };
  },

  /**
   * Validar geometria LineString
   */
  lineString: (geometry: any): GeometryValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (geometry.type !== 'LineString') {
      errors.push('Tipo de geometria deve ser LineString');
      return { valid: false, errors, warnings };
    }

    if (!Array.isArray(geometry.coordinates)) {
      errors.push('Coordenadas da linha devem ser um array');
      return { valid: false, errors, warnings };
    }

    const coordinates = geometry.coordinates;

    // Verificar número mínimo de pontos
    if (coordinates.length < DATA_LIMITS.minVerticesPerLineString) {
      errors.push(`Linha deve ter pelo menos ${DATA_LIMITS.minVerticesPerLineString} pontos`);
    }

    // Verificar número máximo de pontos
    if (coordinates.length > DATA_LIMITS.maxVerticesPerLineString) {
      errors.push(`Linha não pode ter mais de ${DATA_LIMITS.maxVerticesPerLineString} pontos`);
    }

    // Validar coordenadas
    const coordResult = validateCoordinates.positions(coordinates);
    errors.push(...coordResult.errors);
    warnings.push(...coordResult.warnings);

    // Verificar auto-interseção se habilitada
    if (VALIDATION_CONFIG.validateTopology && coordinates.length > 3) {
      const hasIntersection = checkLineIntersection(coordinates);
      if (hasIntersection) {
        warnings.push('Linha possui auto-interseção');
      }
    }

    // Calcular bounds
    let bounds: [number, number, number, number] | undefined;
    if (coordinates.length > 0) {
      bounds = calculateBounds(coordinates);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      geometryType: 'LineString',
      coordinateCount: coordinates.length,
      bounds,
    };
  },

  /**
   * Validar geometria Polygon
   */
  polygon: (geometry: any): GeometryValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (geometry.type !== 'Polygon') {
      errors.push('Tipo de geometria deve ser Polygon');
      return { valid: false, errors, warnings };
    }

    if (!Array.isArray(geometry.coordinates)) {
      errors.push('Coordenadas do polígono devem ser um array');
      return { valid: false, errors, warnings };
    }

    if (geometry.coordinates.length === 0) {
      errors.push('Polígono deve ter pelo menos um anel');
      return { valid: false, errors, warnings };
    }

    // Validar anel exterior
    const outerRing = geometry.coordinates[0];
    if (!Array.isArray(outerRing)) {
      errors.push('Anel exterior deve ser um array');
      return { valid: false, errors, warnings };
    }

    // Verificar número mínimo de pontos (incluindo fechamento)
    if (outerRing.length < DATA_LIMITS.minVerticesPerPolygon + 1) {
      errors.push(`Polígono deve ter pelo menos ${DATA_LIMITS.minVerticesPerPolygon + 1} pontos (incluindo fechamento)`);
    }

    // Verificar número máximo de pontos
    if (outerRing.length > DATA_LIMITS.maxVerticesPerPolygon + 1) {
      errors.push(`Polígono não pode ter mais de ${DATA_LIMITS.maxVerticesPerPolygon + 1} pontos`);
    }

    // Verificar fechamento do anel
    if (outerRing.length >= 2) {
      const first = outerRing[0];
      const last = outerRing[outerRing.length - 1];
      
      if (!Array.isArray(first) || !Array.isArray(last)) {
        errors.push('Pontos do anel devem ser arrays');
      } else {
        const [lng1, lat1] = first;
        const [lng2, lat2] = last;
        const distance = Math.sqrt((lng2 - lng1) ** 2 + (lat2 - lat1) ** 2);
        
        if (distance > VALIDATION_CONFIG.geometryTolerance) {
          errors.push('Anel do polígono deve ser fechado (primeiro e último pontos devem ser iguais)');
        }
      }
    }

    // Validar coordenadas
    const coordResult = validateCoordinates.positions(outerRing);
    errors.push(...coordResult.errors);
    warnings.push(...coordResult.warnings);

    // Verificar orientação (deve ser anti-horário para anel exterior)
    if (outerRing.length >= 4) {
      const area = calculateSignedArea(outerRing);
      if (area < 0) {
        warnings.push('Anel exterior deve ter orientação anti-horária');
      }
    }

    // Validar anéis interiores (buracos)
    let totalCoordinates = outerRing.length;
    for (let i = 1; i < geometry.coordinates.length; i++) {
      const innerRing = geometry.coordinates[i];
      
      if (!Array.isArray(innerRing)) {
        errors.push(`Anel interior ${i} deve ser um array`);
        continue;
      }

      totalCoordinates += innerRing.length;

      // Validar fechamento
      if (innerRing.length >= 2) {
        const first = innerRing[0];
        const last = innerRing[innerRing.length - 1];
        
        if (Array.isArray(first) && Array.isArray(last)) {
          const [lng1, lat1] = first;
          const [lng2, lat2] = last;
          const distance = Math.sqrt((lng2 - lng1) ** 2 + (lat2 - lat1) ** 2);
          
          if (distance > VALIDATION_CONFIG.geometryTolerance) {
            errors.push(`Anel interior ${i} deve ser fechado`);
          }
        }
      }

      // Verificar orientação (deve ser horário para anéis interiores)
      if (innerRing.length >= 4) {
        const area = calculateSignedArea(innerRing);
        if (area > 0) {
          warnings.push(`Anel interior ${i} deve ter orientação horária`);
        }
      }

      // Validar coordenadas do anel interior
      const innerCoordResult = validateCoordinates.positions(innerRing);
      errors.push(...innerCoordResult.errors.map(error => `Anel interior ${i}: ${error}`));
      warnings.push(...innerCoordResult.warnings.map(warning => `Anel interior ${i}: ${warning}`));
    }

    // Calcular bounds
    let bounds: [number, number, number, number] | undefined;
    if (outerRing.length > 0) {
      bounds = calculateBounds(outerRing);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      geometryType: 'Polygon',
      coordinateCount: totalCoordinates,
      bounds,
    };
  },

  /**
   * Validar geometria genérica
   */
  generic: (geometry: Geometry): GeometryValidationResult => {
    switch (geometry.type) {
      case 'Point':
        return validateGeometry.point(geometry);
      case 'LineString':
        return validateGeometry.lineString(geometry);
      case 'Polygon':
        return validateGeometry.polygon(geometry);
      default:
        return {
          valid: false,
          errors: [`Tipo de geometria não suportado: ${geometry.type}`],
          warnings: [],
        };
    }
  },
};

/**
 * Validação de features
 */
export const validateFeature = {
  /**
   * Validar feature completa
   */
  complete: (feature: ExtendedFeature): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar estrutura básica
    if (!feature.id) {
      errors.push('Feature deve ter um ID');
    }

    if (feature.type !== 'Feature') {
      errors.push('Tipo deve ser Feature');
    }

    if (!feature.properties) {
      errors.push('Feature deve ter propriedades');
    } else {
      // Validar propriedades obrigatórias
      if (!feature.properties.layerId) {
        errors.push('Feature deve ter um layerId');
      }

      if (!feature.properties.createdAt) {
        errors.push('Feature deve ter data de criação');
      }

      if (!feature.properties.updatedAt) {
        errors.push('Feature deve ter data de atualização');
      }

      // Validar tamanhos de propriedades
      if (feature.properties.name && feature.properties.name.length > DATA_LIMITS.maxFeatureNameLength) {
        errors.push(`Nome muito longo (máximo ${DATA_LIMITS.maxFeatureNameLength} caracteres)`);
      }

      if (feature.properties.description && feature.properties.description.length > DATA_LIMITS.maxFeatureDescriptionLength) {
        errors.push(`Descrição muito longa (máximo ${DATA_LIMITS.maxFeatureDescriptionLength} caracteres)`);
      }

      // Contar propriedades customizadas
      const customPropsCount = Object.keys(feature.properties).filter(key => 
        !['id', 'layerId', 'name', 'description', 'style', 'createdAt', 'updatedAt', 'ownerId'].includes(key)
      ).length;

      if (customPropsCount > DATA_LIMITS.maxPropertiesCount) {
        warnings.push(`Muitas propriedades customizadas (máximo recomendado: ${DATA_LIMITS.maxPropertiesCount})`);
      }
    }

    // Validar geometria
    if (!feature.geometry) {
      if (!VALIDATION_CONFIG.allowEmptyGeometries) {
        errors.push('Feature deve ter geometria');
      }
    } else {
      const geomResult = validateGeometry.generic(feature.geometry);
      errors.push(...geomResult.errors);
      warnings.push(...geomResult.warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },

  /**
   * Validar propriedades da feature
   */
  properties: (properties: any): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!properties || typeof properties !== 'object') {
      errors.push('Propriedades devem ser um objeto');
      return { valid: false, errors, warnings };
    }

    // Validar propriedades obrigatórias
    const requiredProps = ['id', 'layerId', 'createdAt', 'updatedAt'];
    for (const prop of requiredProps) {
      if (!properties[prop]) {
        errors.push(`Propriedade obrigatória ausente: ${prop}`);
      }
    }

    // Validar formato de datas
    if (properties.createdAt && !isValidISODate(properties.createdAt)) {
      errors.push('createdAt deve ser uma data ISO válida');
    }

    if (properties.updatedAt && !isValidISODate(properties.updatedAt)) {
      errors.push('updatedAt deve ser uma data ISO válida');
    }

    // Validar consistência de datas
    if (properties.createdAt && properties.updatedAt) {
      const created = new Date(properties.createdAt);
      const updated = new Date(properties.updatedAt);
      
      if (updated < created) {
        errors.push('updatedAt não pode ser anterior a createdAt');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },
};

/**
 * Funções auxiliares
 */

// Verificar se é uma data ISO válida
function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && dateString.includes('T');
}

// Calcular área assinada de um polígono (para verificar orientação)
function calculateSignedArea(coordinates: Position[]): number {
  let area = 0;
  const n = coordinates.length;
  
  for (let i = 0; i < n - 1; i++) {
    const [x1, y1] = coordinates[i];
    const [x2, y2] = coordinates[i + 1];
    area += (x2 - x1) * (y2 + y1);
  }
  
  return area / 2;
}

// Calcular bounds de um array de coordenadas
function calculateBounds(coordinates: Position[]): [number, number, number, number] {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of coordinates) {
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }

  return [minLng, minLat, maxLng, maxLat];
}

// Verificar auto-interseção em linha (simplificado)
function checkLineIntersection(coordinates: Position[]): boolean {
  // Implementação simplificada - verifica apenas alguns casos óbvios
  if (coordinates.length < 4) return false;

  for (let i = 0; i < coordinates.length - 3; i++) {
    for (let j = i + 2; j < coordinates.length - 1; j++) {
      if (j === coordinates.length - 1 && i === 0) continue; // Pular fechamento do polígono
      
      const seg1 = [coordinates[i], coordinates[i + 1]];
      const seg2 = [coordinates[j], coordinates[j + 1]];
      
      if (segmentsIntersect(seg1[0], seg1[1], seg2[0], seg2[1])) {
        return true;
      }
    }
  }

  return false;
}

// Verificar se dois segmentos se intersectam
function segmentsIntersect(p1: Position, p2: Position, p3: Position, p4: Position): boolean {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const [x3, y3] = p3;
  const [x4, y4] = p4;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-10) return false; // Paralelos

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

/**
 * Validação de dados de entrada do usuário
 */
export const validateInput = {
  /**
   * Validar nome
   */
  name: (name: string, maxLength: number = 100): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push('Nome é obrigatório');
    } else if (name.length > maxLength) {
      errors.push(`Nome muito longo (máximo ${maxLength} caracteres)`);
    } else if (name.trim() !== name) {
      warnings.push('Nome contém espaços extras no início ou fim');
    }

    return { valid: errors.length === 0, errors, warnings };
  },

  /**
   * Validar descrição
   */
  description: (description: string, maxLength: number = 1000): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (description && description.length > maxLength) {
      errors.push(`Descrição muito longa (máximo ${maxLength} caracteres)`);
    }

    return { valid: errors.length === 0, errors, warnings };
  },

  /**
   * Validar ID
   */
  id: (id: string): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!id) {
      errors.push('ID é obrigatório');
    } else {
      // Verificar formato UUID v4
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        warnings.push('ID não segue o formato UUID padrão');
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  },
};