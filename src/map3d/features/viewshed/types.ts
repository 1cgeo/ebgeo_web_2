// Path: map3d\features\viewshed\types.ts
import { z } from 'zod';

// Estado da ferramenta simplificado
export enum ViewshedToolState {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
}

// Declaração global para o módulo cesiumViewshed
declare global {
  interface Window {
    cesiumViewshed?: any;
  }
}
