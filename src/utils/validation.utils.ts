// Path: utils\validation.utils.ts
import { Position, Geometry } from 'geojson';
import { ExtendedFeature } from '../features/data-access/schemas/feature.schema';

// Tipos para resultados de validação
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Verificar se um valor é uma posição válida
 */
function isValidPosition(value: any): value is Position {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  );
}

/**
 * Validação básica de coordenadas
 */
export const validateCoordinates = {
  /**
   * Validar uma posição (longitude, latitude)
   */
  position: (position: Position): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(position) || position.length < 2) {
      errors.push('Posição deve ter longitude e latitude');
      return { valid: false, errors, warnings };
    }

    const lng = position[0];
    const lat = position[1];

    // Validar tipos e valores válidos
    if (typeof lng !== 'number' || typeof lat !== 'number' || !isFinite(lng) || !isFinite(lat)) {
      errors.push('Longitude e latitude devem ser números válidos');
      return { valid: false, errors, warnings };
    }

    // Validar limites básicos
    if (lng < -180 || lng > 180) {
      errors.push(`Longitude fora dos limites (-180 a 180): ${lng}`);
    }

    if (lat < -90 || lat > 90) {
      errors.push(`Latitude fora dos limites (-90 a 90): ${lat}`);
    }

    return { valid: errors.length === 0, errors, warnings };
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
        errors.push(`Posição ${index}: ${result.errors.join(', ')}`);
      }
    });

    return { valid: errors.length === 0, errors, warnings };
  },
};

/**
 * Validação de geometrias básica
 */
export const validateGeometry = {
  /**
   * Validar geometria Point
   */
  point: (geometry: any): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (geometry.type !== 'Point') {
      errors.push('Tipo deve ser Point');
      return { valid: false, errors, warnings };
    }

    if (!isValidPosition(geometry.coordinates)) {
      errors.push('Coordenadas do ponto inválidas');
      return { valid: false, errors, warnings };
    }

    const coordResult = validateCoordinates.position(geometry.coordinates);
    return {
      valid: coordResult.valid,
      errors: [...errors, ...coordResult.errors],
      warnings: [...warnings, ...coordResult.warnings],
    };
  },

  /**
   * Validar geometria LineString
   */
  lineString: (geometry: any): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (geometry.type !== 'LineString') {
      errors.push('Tipo deve ser LineString');
      return { valid: false, errors, warnings };
    }

    if (!Array.isArray(geometry.coordinates)) {
      errors.push('Coordenadas devem ser um array');
      return { valid: false, errors, warnings };
    }

    if (geometry.coordinates.length < 2) {
      errors.push('LineString deve ter pelo menos 2 pontos');
      return { valid: false, errors, warnings };
    }

    const coordResult = validateCoordinates.positions(geometry.coordinates);
    return {
      valid: coordResult.valid,
      errors: [...errors, ...coordResult.errors],
      warnings: [...warnings, ...coordResult.warnings],
    };
  },

  /**
   * Validar geometria Polygon
   */
  polygon: (geometry: any): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (geometry.type !== 'Polygon') {
      errors.push('Tipo deve ser Polygon');
      return { valid: false, errors, warnings };
    }

    if (!Array.isArray(geometry.coordinates) || geometry.coordinates.length === 0) {
      errors.push('Polígono deve ter pelo menos um anel de coordenadas');
      return { valid: false, errors, warnings };
    }

    // Validar anel exterior
    const outerRing = geometry.coordinates[0];
    if (!Array.isArray(outerRing) || outerRing.length < 4) {
      errors.push('Anel exterior deve ter pelo menos 4 pontos');
      return { valid: false, errors, warnings };
    }

    // Verificar se o anel está fechado
    const firstPoint = outerRing[0];
    const lastPoint = outerRing[outerRing.length - 1];
    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      errors.push('Anel do polígono deve estar fechado (primeiro ponto = último ponto)');
    }

    // Validar coordenadas do anel exterior
    const coordResult = validateCoordinates.positions(outerRing);
    if (!coordResult.valid) {
      errors.push(...coordResult.errors);
    }

    return { valid: errors.length === 0, errors, warnings };
  },

  /**
   * Validar geometria genérica
   */
  generic: (geometry: Geometry): ValidationResult => {
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
 * Validação básica de features
 */
export const validateFeature = {
  /**
   * Validar feature básica
   */
  basic: (feature: ExtendedFeature): ValidationResult => {
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
    }

    // Validar geometria
    if (!feature.geometry) {
      errors.push('Feature deve ter geometria');
    } else {
      const geometryResult = validateGeometry.generic(feature.geometry);
      if (!geometryResult.valid) {
        errors.push(...geometryResult.errors.map(err => `Geometria: ${err}`));
      }
      warnings.push(...geometryResult.warnings);
    }

    return { valid: errors.length === 0, errors, warnings };
  },
};

/**
 * Validação de strings básica
 */
export const validateString = {
  /**
   * Verificar se string não está vazia
   */
  notEmpty: (value: string, fieldName: string = 'Campo'): ValidationResult => {
    const errors: string[] = [];

    if (!value || value.trim().length === 0) {
      errors.push(`${fieldName} não pode estar vazio`);
    }

    return { valid: errors.length === 0, errors, warnings: [] };
  },

  /**
   * Verificar comprimento de string
   */
  length: (
    value: string,
    minLength: number,
    maxLength: number,
    fieldName: string = 'Campo'
  ): ValidationResult => {
    const errors: string[] = [];

    if (value.length < minLength) {
      errors.push(`${fieldName} deve ter pelo menos ${minLength} caracteres`);
    }

    if (value.length > maxLength) {
      errors.push(`${fieldName} deve ter no máximo ${maxLength} caracteres`);
    }

    return { valid: errors.length === 0, errors, warnings: [] };
  },
};
