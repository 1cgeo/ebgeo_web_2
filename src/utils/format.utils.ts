// Path: utils\format.utils.ts

import { Position } from 'geojson';

// Tipos para formatação de coordenadas
export type CoordinateFormat = 'decimal' | 'dms' | 'utm';
export type DistanceUnit = 'meters' | 'kilometers' | 'feet' | 'miles' | 'nautical';
export type AreaUnit = 'sqmeters' | 'sqkilometers' | 'hectares' | 'sqfeet' | 'sqmiles' | 'acres';

// Interface para coordenadas DMS
export interface DMSCoordinate {
  degrees: number;
  minutes: number;
  seconds: number;
  direction: 'N' | 'S' | 'E' | 'W';
}

// Interface para coordenadas UTM
export interface UTMCoordinate {
  zone: number;
  hemisphere: 'N' | 'S';
  easting: number;
  northing: number;
}

/**
 * Formatar coordenadas em diferentes formatos
 */
export const formatCoordinates = {
  /**
   * Formatar como decimal com precisão especificada
   */
  decimal: (lng: number, lat: number, precision: number = 6): string => {
    return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
  },

  /**
   * Formatar como graus, minutos e segundos
   */
  dms: (lng: number, lat: number): string => {
    const latDMS = decimalToDMS(lat, 'lat');
    const lngDMS = decimalToDMS(lng, 'lng');

    return `${formatDMS(latDMS)} ${formatDMS(lngDMS)}`;
  },

  /**
   * Formatar para exibição simples
   */
  simple: (lng: number, lat: number): string => {
    return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
  },

  /**
   * Formatar com rótulos
   */
  labeled: (lng: number, lat: number, precision: number = 4): string => {
    return `Lat: ${lat.toFixed(precision)}°, Lng: ${lng.toFixed(precision)}°`;
  },
};

/**
 * Converter coordenadas decimais para DMS
 */
export const decimalToDMS = (decimal: number, type: 'lat' | 'lng'): DMSCoordinate => {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesFloat = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = (minutesFloat - minutes) * 60;

  let direction: 'N' | 'S' | 'E' | 'W';
  if (type === 'lat') {
    direction = decimal >= 0 ? 'N' : 'S';
  } else {
    direction = decimal >= 0 ? 'E' : 'W';
  }

  return {
    degrees,
    minutes,
    seconds,
    direction,
  };
};

/**
 * Converter DMS para decimal
 */
export const dmsToDecimal = (dms: DMSCoordinate): number => {
  const decimal = dms.degrees + dms.minutes / 60 + dms.seconds / 3600;
  return dms.direction === 'S' || dms.direction === 'W' ? -decimal : decimal;
};

/**
 * Formatar DMS como string
 */
export const formatDMS = (dms: DMSCoordinate): string => {
  return `${dms.degrees}°${dms.minutes.toString().padStart(2, '0')}'${dms.seconds.toFixed(2).padStart(5, '0')}"${dms.direction}`;
};

/**
 * Formatação de distâncias
 */
export const formatDistance = {
  /**
   * Formatar distância automaticamente (metros ou quilômetros)
   */
  auto: (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else if (meters < 10000) {
      return `${(meters / 1000).toFixed(1)} km`;
    } else {
      return `${Math.round(meters / 1000)} km`;
    }
  },

  /**
   * Formatar em unidade específica
   */
  inUnit: (meters: number, unit: DistanceUnit): string => {
    const conversions = {
      meters: { factor: 1, symbol: 'm' },
      kilometers: { factor: 1000, symbol: 'km' },
      feet: { factor: 0.3048, symbol: 'ft' },
      miles: { factor: 1609.344, symbol: 'mi' },
      nautical: { factor: 1852, symbol: 'nmi' },
    };

    const conversion = conversions[unit];
    const value = meters / conversion.factor;

    if (value < 10) {
      return `${value.toFixed(2)} ${conversion.symbol}`;
    } else if (value < 100) {
      return `${value.toFixed(1)} ${conversion.symbol}`;
    } else {
      return `${Math.round(value)} ${conversion.symbol}`;
    }
  },

  /**
   * Formatar com precisão específica
   */
  precise: (meters: number, precision: number = 2): string => {
    return `${meters.toFixed(precision)} m`;
  },
};

/**
 * Formatação de áreas
 */
export const formatArea = {
  /**
   * Formatar área automaticamente
   */
  auto: (sqMeters: number): string => {
    if (sqMeters < 10000) {
      return `${Math.round(sqMeters)} m²`;
    } else if (sqMeters < 1000000) {
      return `${(sqMeters / 10000).toFixed(1)} ha`;
    } else {
      return `${(sqMeters / 1000000).toFixed(2)} km²`;
    }
  },

  /**
   * Formatar em unidade específica
   */
  inUnit: (sqMeters: number, unit: AreaUnit): string => {
    const conversions = {
      sqmeters: { factor: 1, symbol: 'm²' },
      sqkilometers: { factor: 1000000, symbol: 'km²' },
      hectares: { factor: 10000, symbol: 'ha' },
      sqfeet: { factor: 0.092903, symbol: 'ft²' },
      sqmiles: { factor: 2589988.11, symbol: 'mi²' },
      acres: { factor: 4046.86, symbol: 'ac' },
    };

    const conversion = conversions[unit];
    const value = sqMeters / conversion.factor;

    if (value < 10) {
      return `${value.toFixed(3)} ${conversion.symbol}`;
    } else if (value < 100) {
      return `${value.toFixed(2)} ${conversion.symbol}`;
    } else if (value < 1000) {
      return `${value.toFixed(1)} ${conversion.symbol}`;
    } else {
      return `${Math.round(value).toLocaleString()} ${conversion.symbol}`;
    }
  },
};

/**
 * Formatação de datas
 */
export const formatDate = {
  /**
   * Formatar data brasileira
   */
  brazilian: (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  },

  /**
   * Formatar data e hora brasileira
   */
  brazilianDateTime: (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleString('pt-BR');
  },

  /**
   * Formatar para ISO string
   */
  iso: (date: Date | string): string => {
    const d = new Date(date);
    return d.toISOString();
  },

  /**
   * Formatar tempo relativo
   */
  relative: (date: Date | string): string => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
      return 'agora mesmo';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else if (diffDays < 7) {
      return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
    } else {
      return formatDate.brazilian(d);
    }
  },
};

/**
 * Formatação de números
 */
export const formatNumber = {
  /**
   * Formatar com separadores brasileiros
   */
  brazilian: (number: number, decimals: number = 0): string => {
    return number.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  },

  /**
   * Formatar como percentual
   */
  percentage: (value: number, decimals: number = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  /**
   * Formatar tamanho de arquivo
   */
  fileSize: (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    const decimals = unitIndex === 0 ? 0 : 1;
    return `${size.toFixed(decimals)} ${units[unitIndex]}`;
  },

  /**
   * Formatar número compacto
   */
  compact: (number: number): string => {
    if (number < 1000) {
      return number.toString();
    } else if (number < 1000000) {
      return `${(number / 1000).toFixed(1)}K`;
    } else if (number < 1000000000) {
      return `${(number / 1000000).toFixed(1)}M`;
    } else {
      return `${(number / 1000000000).toFixed(1)}B`;
    }
  },
};

/**
 * Formatação de texto
 */
export const formatText = {
  /**
   * Truncar texto com reticências
   */
  truncate: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.substring(0, maxLength - 3)}...`;
  },

  /**
   * Capitalizar primeira letra
   */
  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  /**
   * Título (primeira letra de cada palavra)
   */
  title: (text: string): string => {
    return text.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  },

  /**
   * Slug para URLs
   */
  slug: (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9 -]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Espaços para hífen
      .replace(/-+/g, '-') // Múltiplos hífens para um
      .trim('-'); // Remove hífens do início e fim
  },
};

/**
 * Validação de formatos
 */
export const validateFormat = {
  /**
   * Validar coordenada decimal
   */
  coordinate: (value: number, type: 'lat' | 'lng'): boolean => {
    if (type === 'lat') {
      return value >= -90 && value <= 90;
    } else {
      return value >= -180 && value <= 180;
    }
  },

  /**
   * Validar email
   */
  email: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Validar URL
   */
  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Utilitários de formatação para geometrias
 */
export const formatGeometry = {
  /**
   * Formatar posição como string
   */
  position: (position: Position, format: CoordinateFormat = 'decimal'): string => {
    const [lng, lat] = position;

    switch (format) {
      case 'dms':
        return formatCoordinates.dms(lng, lat);
      case 'decimal':
      default:
        return formatCoordinates.decimal(lng, lat);
    }
  },

  /**
   * Formatar array de posições
   */
  positions: (positions: Position[], format: CoordinateFormat = 'decimal'): string[] => {
    return positions.map(pos => formatGeometry.position(pos, format));
  },

  /**
   * Formatar bounds
   */
  bounds: (bounds: [Position, Position], format: CoordinateFormat = 'decimal'): string => {
    const [sw, ne] = bounds;
    return `SW: ${formatGeometry.position(sw, format)}, NE: ${formatGeometry.position(ne, format)}`;
  },
};

/**
 * Formatação de áreas
 */
export const formatArea = {
  /**
   * Formatar área automaticamente (metros quadrados ou quilômetros quadrados)
   */
  auto: (sqMeters: number): string => {
    if (sqMeters < 1000) {
      return `${Math.round(sqMeters)} m²`;
    } else if (sqMeters < 10000) {
      return `${(sqMeters / 1000).toFixed(1)} km²`;
    } else if (sqMeters < 1000000) {
      return `${(sqMeters / 10000).toFixed(1)} ha`;
    } else {
      return `${(sqMeters / 1000000).toFixed(2)} km²`;
    }
  },

  /**
   * Formatar em unidade específica
   */
  inUnit: (sqMeters: number, unit: AreaUnit): string => {
    const conversions = {
      sqmeters: { factor: 1, symbol: 'm²' },
      sqkilometers: { factor: 1000000, symbol: 'km²' },
      hectares: { factor: 10000, symbol: 'ha' },
      sqfeet: { factor: 0.092903, symbol: 'ft²' },
      sqmiles: { factor: 2589988.110336, symbol: 'mi²' },
      acres: { factor: 4046.8564224, symbol: 'ac' },
    };

    const conversion = conversions[unit];
    const value = sqMeters / conversion.factor;

    if (value < 10) {
      return `${value.toFixed(2)} ${conversion.symbol}`;
    } else if (value < 100) {
      return `${value.toFixed(1)} ${conversion.symbol}`;
    } else {
      return `${Math.round(value).toLocaleString()} ${conversion.symbol}`;
    }
  },
};

/**
 * Validador de email melhorado
 */
export const validation = {
  /**
   * Validar email com regex mais robusta
   */
  email: (email: string): boolean => {
    const regex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return regex.test(email);
  },

  /**
   * Validar URL
   */
  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validar coordenadas
   */
  coordinates: (lng: number, lat: number): boolean => {
    return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
  },
};

/**
 * Utilitários de formatação para dados tabulares
 */
export const formatTable = {
  /**
   * Formatar valor para exibição em tabela
   */
  cellValue: (value: any, type: 'text' | 'number' | 'date' | 'coordinates' = 'text'): string => {
    if (value == null) return '';

    switch (type) {
      case 'date':
        return new Date(value).toLocaleString();
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value.toString();
      case 'coordinates':
        if (Array.isArray(value) && value.length >= 2) {
          const [lng, lat] = value;
          return formatCoordinates.decimal(lng, lat, 4);
        }
        return value.toString();
      default:
        return value.toString();
    }
  },

  /**
   * Truncar texto para exibição em tabela
   */
  truncate: (text: string, maxLength: number = 50): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },
};
