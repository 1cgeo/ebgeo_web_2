// Path: mapSig\features\textTool\store.ts
import { nanoid } from 'nanoid';
import { create } from 'zustand';

import { getMap } from '../../store';
import { type TextAttributes, defaultTextAttributes } from './types';

interface TextToolState {
  texts: TextAttributes[];
  selectedText: TextAttributes | null;
  isActive: boolean;
  isPanelOpen: boolean;

  // Ações - UI
  setActive: (active: boolean) => void;
  addText: (coordinates: { lng: number; lat: number }) => void;
  updateText: (id: string, attributes: Partial<TextAttributes>) => void;
  deleteText: (id: string) => void;
  selectText: (text: TextAttributes | null) => void;
  openPanel: () => void;
  closePanel: () => void;
  reset: () => void;
}

export const useTextToolStore = create<TextToolState>((set) => ({
  texts: [],
  selectedText: null,
  isActive: false,
  isPanelOpen: false,

  setActive: active => {
    const map = getMap();
    if (map) {
      map.getCanvas().style.cursor = active ? 'crosshair' : '';
    }
    set({ isActive: active });
  },

  addText: coordinates => {
    const newText: TextAttributes = {
      id: nanoid(),
      ...defaultTextAttributes,
      coordinates,
    };

    set(state => ({
      texts: [...state.texts, newText],
      selectedText: newText,
      isPanelOpen: true,
    }));
  },

  updateText: (id, attributes) => {
    set(state => ({
      texts: state.texts.map(text =>
        text.id === id ? { ...text, ...attributes } : text,
      ),
      selectedText:
        state.selectedText?.id === id
          ? { ...state.selectedText, ...attributes }
          : state.selectedText,
    }));
  },

  deleteText: id => {
    set(state => ({
      texts: state.texts.filter(text => text.id !== id),
      selectedText: state.selectedText?.id === id ? null : state.selectedText,
      isPanelOpen: state.selectedText?.id === id ? false : state.isPanelOpen,
    }));
  },

  selectText: text =>
    set({
      selectedText: text,
      isPanelOpen: !!text,
    }),

  openPanel: () => set({ isPanelOpen: true }),

  closePanel: () =>
    set({
      isPanelOpen: false,
      selectedText: null,
    }),

  reset: () => {
    set({
      texts: [],
      selectedText: null,
      isActive: false,
      isPanelOpen: false,
    });
  },
}));
