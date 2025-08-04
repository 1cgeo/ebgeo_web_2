// Path: utils\format.utils.ts
import { Position } from 'geojson';

/**
 * Formatação de coordenadas
 */
export const formatCoordinates = {
  /**
   * Formatar coordenadas como decimal (padrão brasileiro)
   */
  decimal: (longitude: number, latitude: number): string => {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  },

  /**
   * Formatar posição como string decimal
   */
  position: (position: Position): string => {
    const [lng, lat] = position;
    return formatCoordinates.decimal(lng, lat);
  },
};

/**
 * Formatação de distâncias (sempre em metros/quilômetros)
 */
export const formatDistance = {
  /**
   * Formatar distância automaticamente
   */
  auto: (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(2)} km`;
    }
  },

  /**
   * Formatar em metros
   */
  meters: (meters: number): string => {
    return `${Math.round(meters).toLocaleString()} m`;
  },

  /**
   * Formatar em quilômetros
   */
  kilometers: (meters: number): string => {
    return `${(meters / 1000).toFixed(2)} km`;
  },
};

/**
 * Formatação de áreas (sempre em metros quadrados/quilômetros quadrados)
 */
export const formatArea = {
  /**
   * Formatar área automaticamente
   */
  auto: (sqMeters: number): string => {
    if (sqMeters < 10000) {
      return `${Math.round(sqMeters).toLocaleString()} m²`;
    } else {
      return `${(sqMeters / 1000000).toFixed(2)} km²`;
    }
  },

  /**
   * Formatar em metros quadrados
   */
  squareMeters: (sqMeters: number): string => {
    return `${Math.round(sqMeters).toLocaleString()} m²`;
  },

  /**
   * Formatar em quilômetros quadrados
   */
  squareKilometers: (sqMeters: number): string => {
    return `${(sqMeters / 1000000).toFixed(2)} km²`;
  },
};

/**
 * Formatação de datas
 */
export const formatDate = {
  /**
   * Formatar data/hora brasileira
   */
  brazilian: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('pt-BR');
  },

  /**
   * Formatar apenas data brasileira
   */
  dateOnly: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR');
  },

  /**
   * Formatar data relativa (ex: "há 2 horas")
   */
  relative: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'Agora';
    } else if (diffMinutes < 60) {
      return `Há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else {
      return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    }
  },
};

/**
 * Formatação de números
 */
export const formatNumber = {
  /**
   * Formatar número com separadores brasileiros
   */
  brazilian: (num: number): string => {
    return num.toLocaleString('pt-BR');
  },

  /**
   * Formatar como porcentagem
   */
  percentage: (value: number, total: number): string => {
    const percentage = (value / total) * 100;
    return `${percentage.toFixed(1)}%`;
  },

  /**
   * Formatar tamanho de arquivo
   */
  fileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};

/**
 * Formatação de geometrias
 */
export const formatGeometry = {
  /**
   * Formatar array de posições
   */
  positions: (positions: Position[]): string[] => {
    return positions.map(pos => formatCoordinates.position(pos));
  },

  /**
   * Formatar tipo de geometria para exibição
   */
  type: (geometryType: string): string => {
    const types: Record<string, string> = {
      Point: 'Ponto',
      LineString: 'Linha',
      Polygon: 'Polígono',
    };

    return types[geometryType] || geometryType;
  },
};
