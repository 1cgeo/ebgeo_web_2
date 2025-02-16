// Path: mapSig\features\vectorInfo\featureUtils.ts
import {
  BLACKLIST_SUFFIXES,
  GEOMETRY_PREFERENCE_ORDER,
  PROPERTY_BLACKLIST,
  type VectorFeature,
} from './types';

export function sortFeatures(features: VectorFeature[]): VectorFeature[] {
  return [...features].sort((a, b) => {
    const aPriority = a.source?.startsWith('cobter_')
      ? 6
      : GEOMETRY_PREFERENCE_ORDER.indexOf(a.geometry.type);
    const bPriority = b.source?.startsWith('cobter_')
      ? 6
      : GEOMETRY_PREFERENCE_ORDER.indexOf(b.geometry.type);

    return (aPriority ?? -1) - (bPriority ?? -1);
  });
}

export function cleanSourceName(source: string): string {
  return source.replace(/_10k|_25k|_50k|_100k|_250k/g, '');
}

export function filterProperties(properties: Record<string, unknown>) {
  return Object.entries(properties)
    .filter(([key]) => {
      return (
        !PROPERTY_BLACKLIST.includes(key) &&
        !BLACKLIST_SUFFIXES.some(suffix => key.endsWith(suffix))
      );
    })
    .map(([key, value]) => ({
      key: key.endsWith('_value') ? key.slice(0, -6) : key,
      value,
    }));
}
