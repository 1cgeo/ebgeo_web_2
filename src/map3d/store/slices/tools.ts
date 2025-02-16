import { type StateCreator } from 'zustand';
import { z } from 'zod';

const toolStateSchema = z.object({
  id: z.string(),
  active: z.boolean(),
  options: z.record(z.any()).optional(),
});

export type ToolState = z.infer<typeof toolStateSchema>;

export interface ToolsSlice {
  activeTool: string | null;
  toolStates: Record<string, ToolState>;
  setActiveTool: (toolId: string | null) => void;
  updateToolState: (toolId: string, updates: Partial<ToolState>) => void;
  resetTools: () => void;
}

export const createToolsSlice: StateCreator<ToolsSlice> = (set) => ({
  activeTool: null,
  toolStates: {},

  setActiveTool: (toolId) => set((state) => {
    const newToolStates = Object.entries(state.toolStates).reduce(
      (acc, [id, toolState]) => ({
        ...acc,
        [id]: { ...toolState, active: id === toolId },
      }),
      {}
    );

    return {
      activeTool: toolId,
      toolStates: newToolStates,
    };
  }),

  updateToolState: (toolId, updates) => set((state) => ({
    toolStates: {
      ...state.toolStates,
      [toolId]: {
        ...state.toolStates[toolId],
        ...updates,
      },
    },
  })),

  resetTools: () => set({
    activeTool: null,
    toolStates: {},
  }),
});