import { Feature, FeatureType } from '../../contexts/MapFeaturesContext';

export interface TextFeature extends Omit<Feature, 'properties'> {
  properties: {
    text: string;
    size: number;
    color: string;
    backgroundColor: string;
    rotation: number;
    justify: 'left' | 'center' | 'right';
    source: FeatureType;
  };
}