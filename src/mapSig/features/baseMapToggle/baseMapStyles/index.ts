import { ortoBaseMapStyle, type OrtoMapStyle } from './ortoBaseMapStyles';
import { topoBaseMapStyle, type TopoMapStyle } from './topoBaseMapStyles';

export const baseMapStyles = {
  orto: ortoBaseMapStyle,
  topo: topoBaseMapStyle,
} as const;

export type BaseMapStyles = {
  orto: OrtoMapStyle;
  topo: TopoMapStyle;
};

export type BaseMapStyleType = keyof BaseMapStyles;