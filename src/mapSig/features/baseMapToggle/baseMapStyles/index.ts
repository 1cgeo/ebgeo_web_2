// Path: mapSig\features\baseMapToggle\baseMapStyles\index.ts
import { type OrtoMapStyle, ortoBaseMapStyle } from './ortoBaseMapStyles';
import { type TopoMapStyle, topoBaseMapStyle } from './topoBaseMapStyles';

export const baseMapStyles = {
  orto: ortoBaseMapStyle,
  topo: topoBaseMapStyle,
} as const;

export type BaseMapStyles = {
  orto: OrtoMapStyle;
  topo: TopoMapStyle;
};

export type BaseMapStyleType = keyof BaseMapStyles;
