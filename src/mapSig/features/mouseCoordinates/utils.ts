// Path: mapSig\features\mouseCoordinates\utils.ts
import mgrs from 'mgrs';
import proj4 from 'proj4';

import { type DecimalCoordinates } from './types';

// Define projeção WGS84
const wgs84Proj = 'EPSG:4326';

// Funções para formatar coordenadas em diferentes sistemas

// Formata coordenadas decimais (ex: 45.12345, -75.67890)
export function formatDecimal(
  coords: DecimalCoordinates,
  precision: number,
): string {
  return `Lat: ${coords.lat.toFixed(precision)}°, Lng: ${coords.lng.toFixed(precision)}°`;
}

// Converte decimal para Graus, Minutos, Segundos
function decimalToDMS(value: number, isLat: boolean): string {
  const absolute = Math.abs(value);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);

  const direction = isLat ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W';

  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

// Formata coordenadas em DMS (ex: 45° 7' 24.42" N, 75° 40' 44.04" W)
export function formatDMS(coords: DecimalCoordinates): string {
  const latDMS = decimalToDMS(coords.lat, true);
  const lngDMS = decimalToDMS(coords.lng, false);
  return `${latDMS}, ${lngDMS}`;
}

// Formata coordenadas em UTM (ex: 18T 445123 5000000)
export function formatUTM(coords: DecimalCoordinates): string {
  try {
    // Calcula a zona UTM baseada na longitude
    const zone = Math.floor((coords.lng + 180) / 6) + 1;
    const hemisphere = coords.lat >= 0 ? 'N' : 'S';
    const utmProj = `+proj=utm +zone=${zone} +${hemisphere} +datum=WGS84 +units=m +no_defs`;

    // Converte WGS84 para UTM
    const utmCoords = proj4(wgs84Proj, utmProj, [coords.lng, coords.lat]);

    // Formata saída UTM
    return `${zone}${hemisphere} ${Math.round(utmCoords[0])}E ${Math.round(utmCoords[1])}N`;
  } catch (error) {
    console.error('Erro ao converter para UTM:', error);
    return 'UTM: Erro na conversão';
  }
}

// Formata coordenadas em MGRS (ex: 18TXM 45123 00000)
export function formatMGRS(coords: DecimalCoordinates): string {
  try {
    // Converte coordenadas WGS84 para MGRS
    const mgrsString = mgrs.forward([coords.lng, coords.lat], 5); // Precisão de 5 dígitos

    // Formata saída MGRS separando a designação de grid e os dígitos
    const gridDesignation = mgrsString.substring(0, 5);
    const easting = mgrsString.substring(5, 10);
    const northing = mgrsString.substring(10);

    return `${gridDesignation} ${easting} ${northing}`;
  } catch (error) {
    console.error('Erro ao converter para MGRS:', error);
    return 'MGRS: Erro na conversão';
  }
}

// Função principal que formata coordenadas no formato especificado
export function formatCoordinates(
  coords: DecimalCoordinates,
  format: 'decimal' | 'dms' | 'utm' | 'mgrs',
  precision: number = 5,
): string {
  switch (format) {
    case 'decimal':
      return formatDecimal(coords, precision);
    case 'dms':
      return formatDMS(coords);
    case 'utm':
      return formatUTM(coords);
    case 'mgrs':
      return formatMGRS(coords);
    default:
      return formatDecimal(coords, precision);
  }
}
