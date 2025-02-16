import { type StateCreator } from 'zustand';
import { z } from 'zod';

const toolSchema = z.object({
  id: z.string(),
  name: z.string(),
  isActive: z.boolean()
});

export type Tool = z.infer<typeof toolSchema>;

export interface ToolsSlice {
  activeTool: string | null;
  tools: Tool[];
  setActiveTool: (toolId: string | null) => void;
  registerTool: (tool: Omit<Tool, 'isActive'>) => void;
  unregisterTool: (toolId: string) => void;
}

export const createToolsSlice: StateCreator<ToolsSlice> = (set) => ({
  activeTool: null,
  tools: [],
  
  setActiveTool: (toolId) => set((state) => ({
    activeTool: toolId,
    tools: state.tools.map(tool => ({
      ...tool,
      isActive: tool.id === toolId
    }))
  })),
  
  registerTool: (tool) => set((state) => ({
    tools: [...state.tools, { ...tool, isActive: false }]
  })),
  
  unregisterTool: (toolId) => set((state) => ({
    tools: state.tools.filter(tool => tool.id !== toolId)
  }))
});