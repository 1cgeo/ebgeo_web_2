// Path: map3d\store\slices\tools.ts
import { z } from 'zod';
import { type StateCreator } from 'zustand';

import { useMapsStore } from '@/shared/store/mapsStore';

const toolStateSchema = z.object({
  id: z.string(),
  isActive: z.boolean(),
});

export type ToolState = z.infer<typeof toolStateSchema>;

export interface ToolsSlice {
  activeTool: string | null;
  setActiveTool: (toolId: string | null) => void;
  clearActiveTool: () => void;
}

export const createToolsSlice: StateCreator<ToolsSlice> = set => ({
  activeTool: null,

  setActiveTool: toolId => {
    // Acessa o cesiumMap para atualizar o cursor
    const map = useMapsStore.getState().cesiumMap;
    if (map) {
      map.container.style.cursor = toolId ? 'crosshair' : 'default';
    }
    set({ activeTool: toolId });
  },

  clearActiveTool: () => {
    // Reseta o cursor
    const map = useMapsStore.getState().cesiumMap;
    if (map) {
      map.container.style.cursor = 'default';
    }
    set({ activeTool: null });
  },
});
