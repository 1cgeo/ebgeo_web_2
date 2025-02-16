import { type StateCreator } from 'zustand';

export interface PanelSlice {
  isPanelOpen: boolean;
  panelContent: React.ReactNode | null;
  openPanel: (content: React.ReactNode) => void;
  closePanel: () => void;
}

export const createPanelSlice: StateCreator<PanelSlice> = (set) => ({
  isPanelOpen: false,
  panelContent: null,
  
  openPanel: (content) => set({
    isPanelOpen: true,
    panelContent: content
  }),
  
  closePanel: () => set({
    isPanelOpen: false,
    panelContent: null
  })
});