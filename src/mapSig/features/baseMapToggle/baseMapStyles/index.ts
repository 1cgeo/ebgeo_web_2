// Path: mapSig\features\baseMapToggle\baseMapStyles\index.ts
import { type BaseMapStyles, type BaseMapType } from '../types';
import { ortoBaseMapStyle } from './ortoBaseMapStyles';
import { topoBaseMapStyle } from './topoBaseMapStyles';

export const baseMapStyles: BaseMapStyles = {
  orto: ortoBaseMapStyle,
  topo: topoBaseMapStyle,
};

export type BaseMapStyleType = BaseMapType;
