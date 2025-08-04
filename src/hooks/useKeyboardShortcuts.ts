// Path: hooks\useKeyboardShortcuts.ts
import { useEffect } from 'react';
import { useAppDispatch } from '@/store';
import { drawingActions } from '@/store/slices/drawingSlice';
import { KEYBOARD_SHORTCUTS } from '@/constants/app.constants';

type KeyboardShortcut = {
  key: string;
  action: () => void;
  description: string;
  category: 'ferramentas' | 'edição' | 'outros';
};

export const useKeyboardShortcuts = () => {
  const dispatch = useAppDispatch();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: KEYBOARD_SHORTCUTS.SELECT_TOOL,
      action: () => dispatch(drawingActions.setActiveTool('select')),
      description: 'Selecionar',
      category: 'ferramentas',
    },
    {
      key: KEYBOARD_SHORTCUTS.POINT_TOOL,
      action: () => dispatch(drawingActions.setActiveTool('point')),
      description: 'Ponto',
      category: 'ferramentas',
    },
    {
      key: KEYBOARD_SHORTCUTS.LINE_TOOL,
      action: () => dispatch(drawingActions.setActiveTool('line')),
      description: 'Linha',
      category: 'ferramentas',
    },
    {
      key: KEYBOARD_SHORTCUTS.POLYGON_TOOL,
      action: () => dispatch(drawingActions.setActiveTool('polygon')),
      description: 'Polígono',
      category: 'ferramentas',
    },
    {
      key: KEYBOARD_SHORTCUTS.RECTANGLE_TOOL,
      action: () => dispatch(drawingActions.setActiveTool('rectangle')),
      description: 'Retângulo',
      category: 'ferramentas',
    },
    {
      key: KEYBOARD_SHORTCUTS.CIRCLE_TOOL,
      action: () => dispatch(drawingActions.setActiveTool('circle')),
      description: 'Círculo',
      category: 'ferramentas',
    },
    {
      key: KEYBOARD_SHORTCUTS.TRASH_TOOL,
      action: () => dispatch(drawingActions.setActiveTool('trash')),
      description: 'Lixeira',
      category: 'ferramentas',
    },
    {
      key: KEYBOARD_SHORTCUTS.GROUP_TOOL,
      action: () => dispatch(drawingActions.groupSelectedFeatures()),
      description: 'Agrupar',
      category: 'edição',
    },
    {
      key: KEYBOARD_SHORTCUTS.UNGROUP_TOOL,
      action: () => dispatch(drawingActions.ungroupSelectedFeatures()),
      description: 'Desagrupar',
      category: 'edição',
    },
    {
      key: KEYBOARD_SHORTCUTS.UNDO_TOOL,
      action: () => dispatch(drawingActions.undo()),
      description: 'Desfazer',
      category: 'edição',
    },
    {
      key: KEYBOARD_SHORTCUTS.REDO_TOOL,
      action: () => dispatch(drawingActions.redo()),
      description: 'Refazer',
      category: 'edição',
    },
    {
      key: KEYBOARD_SHORTCUTS.SAVE_TOOL,
      action: () => dispatch(drawingActions.saveFeatures()),
      description: 'Salvar',
      category: 'outros',
    },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcuts.find(s => s.key === event.key.toLowerCase());
      if (shortcut) {
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, shortcuts]);

  return shortcuts;
};
