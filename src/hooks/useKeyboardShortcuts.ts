// Path: hooks/useKeyboardShortcuts.ts

import { useEffect, useCallback, useMemo } from 'react';
import { useDrawingActions } from '../features/drawing/store/drawing.store';
import { useFeatureSelection } from '../features/selection/hooks/useFeatureSelection';
import { useUndoRedo } from '../features/transaction-history/hooks/useUndoRedo';

// Tipos para atalhos
interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void | Promise<void>;
  description: string;
  category: 'drawing' | 'selection' | 'navigation' | 'layers' | 'general';
  preventDefault?: boolean;
  enabled?: () => boolean;
}

// Categorias de atalhos
export type ShortcutCategory = KeyboardShortcut['category'];

// Hook principal
export const useKeyboardShortcuts = () => {
  // Store actions
  const drawingActions = useDrawingActions();
  
  // Selection
  const {
    selectedFeatureIds,
    deleteSelected,
    duplicateSelected,
    clearSelection,
  } = useFeatureSelection();

  // Undo/Redo
  const {
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo();

  // Estados derivados
  const hasSelection = selectedFeatureIds.length > 0;

  // Definir atalhos
  const shortcuts: KeyboardShortcut[] = useMemo(() => [
    // === FERRAMENTAS DE DESENHO ===
    {
      key: 's',
      action: () => drawingActions.setActiveTool('select'),
      description: 'Ferramenta de seleção',
      category: 'drawing',
    },
    {
      key: 'p',
      action: () => drawingActions.setActiveTool('point'),
      description: 'Ferramenta de ponto',
      category: 'drawing',
    },
    {
      key: 'l',
      action: () => drawingActions.setActiveTool('line'),
      description: 'Ferramenta de linha',
      category: 'drawing',
    },
    {
      key: 'o',
      action: () => drawingActions.setActiveTool('polygon'),
      description: 'Ferramenta de polígono',
      category: 'drawing',
    },
    {
      key: 't',
      action: () => drawingActions.setActiveTool('text'),
      description: 'Ferramenta de texto',
      category: 'drawing',
    },
    {
      key: 'm',
      action: () => drawingActions.setActiveTool('military-symbol'),
      description: 'Ferramenta de símbolo militar',
      category: 'drawing',
    },

    // === AÇÕES DE SELEÇÃO ===
    {
      key: 'a',
      ctrlKey: true,
      action: () => {
        // TODO: Implementar seleção de tudo
        console.log('Selecionar tudo');
      },
      description: 'Selecionar todas as features',
      category: 'selection',
      preventDefault: true,
    },
    {
      key: 'Escape',
      action: () => clearSelection(),
      description: 'Limpar seleção',
      category: 'selection',
      enabled: () => hasSelection,
    },
    {
      key: 'Delete',
      action: async () => {
        if (hasSelection) {
          const confirmed = window.confirm(
            `Deletar ${selectedFeatureIds.length} feature(s) selecionada(s)?`
          );
          if (confirmed) {
            await deleteSelected();
          }
        }
      },
      description: 'Deletar features selecionadas',
      category: 'selection',
      enabled: () => hasSelection,
    },
    {
      key: 'c',
      ctrlKey: true,
      action: async () => {
        if (hasSelection) {
          await duplicateSelected();
        }
      },
      description: 'Duplicar features selecionadas',
      category: 'selection',
      enabled: () => hasSelection,
      preventDefault: true,
    },

    // === UNDO/REDO ===
    {
      key: 'z',
      ctrlKey: true,
      action: async () => {
        if (canUndo) {
          await undo();
        }
      },
      description: 'Desfazer última ação',
      category: 'general',
      enabled: () => canUndo,
      preventDefault: true,
    },
    {
      key: 'y',
      ctrlKey: true,
      action: async () => {
        if (canRedo) {
          await redo();
        }
      },
      description: 'Refazer última ação',
      category: 'general',
      enabled: () => canRedo,
      preventDefault: true,
    },
    {
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
      action: async () => {
        if (canRedo) {
          await redo();
        }
      },
      description: 'Refazer última ação (alternativo)',
      category: 'general',
      enabled: () => canRedo,
      preventDefault: true,
    },

    // === NAVEGAÇÃO ===
    {
      key: 'Home',
      action: () => {
        // TODO: Implementar zoom to extent
        console.log('Zoom to extent');
      },
      description: 'Zoom para extensão total',
      category: 'navigation',
    },
    {
      key: 'f',
      action: () => {
        // TODO: Implementar fit view
        console.log('Fit view');
      },
      description: 'Ajustar vista às features selecionadas',
      category: 'navigation',
      enabled: () => hasSelection,
    },

    // === CAMADAS ===
    {
      key: 'l',
      ctrlKey: true,
      action: () => {
        // TODO: Implementar toggle layer manager
        console.log('Toggle layer manager');
      },
      description: 'Abrir/fechar gerenciador de camadas',
      category: 'layers',
      preventDefault: true,
    },
    {
      key: 'n',
      ctrlKey: true,
      action: () => {
        // TODO: Implementar nova camada
        console.log('Nova camada');
      },
      description: 'Criar nova camada',
      category: 'layers',
      preventDefault: true,
    },

    // === MAPAS ===
    {
      key: 'm',
      ctrlKey: true,
      action: () => {
        // TODO: Implementar map switcher
        console.log('Map switcher');
      },
      description: 'Trocar contexto de mapa',
      category: 'navigation',
      preventDefault: true,
    },

    // === GERAL ===
    {
      key: 's',
      ctrlKey: true,
      action: () => {
        // TODO: Implementar save
        console.log('Save');
      },
      description: 'Salvar trabalho atual',
      category: 'general',
      preventDefault: true,
    },
  ], [
    drawingActions,
    hasSelection,
    selectedFeatureIds.length,
    clearSelection,
    deleteSelected,
    duplicateSelected,
    undo,
    redo,
    canUndo,
    canRedo,
  ]);

  // Handler de teclas
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignorar se estiver digitando em input/textarea
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      return;
    }

    // Buscar atalho correspondente
    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
                     event.code === shortcut.key;
      
      const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey;
      const shiftMatch = !!shortcut.shiftKey === event.shiftKey;
      const altMatch = !!shortcut.altKey === event.altKey;
      
      return keyMatch && ctrlMatch && shiftMatch && altMatch;
    });

    if (matchingShortcut) {
      // Verificar se o atalho está habilitado
      if (matchingShortcut.enabled && !matchingShortcut.enabled()) {
        return;
      }

      // Prevenir comportamento padrão se necessário
      if (matchingShortcut.preventDefault) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Executar ação
      try {
        matchingShortcut.action();
      } catch (error) {
        console.error('Erro ao executar atalho:', error);
      }
    }
  }, [shortcuts]);

  // Registrar event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Utilitários para formatação
  const formatShortcut = useCallback((shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.altKey) parts.push('Alt');
    
    // Formatação especial para teclas específicas
    const keyLabel = shortcut.key === 'Escape' ? 'Esc' :
                    shortcut.key === 'Delete' ? 'Del' :
                    shortcut.key === ' ' ? 'Space' :
                    shortcut.key.length === 1 ? shortcut.key.toUpperCase() :
                    shortcut.key;
    
    parts.push(keyLabel);
    
    return parts.join(' + ');
  }, []);

  // Obter atalhos por categoria
  const getShortcutsByCategory = useCallback((category: ShortcutCategory) => {
    return shortcuts.filter(shortcut => shortcut.category === category);
  }, [shortcuts]);

  // Obter todas as categorias disponíveis
  const getCategories = useCallback((): ShortcutCategory[] => {
    const categories = new Set(shortcuts.map(s => s.category));
    return Array.from(categories).sort();
  }, [shortcuts]);

  // Verificar se um atalho está habilitado
  const isShortcutEnabled = useCallback((shortcut: KeyboardShortcut): boolean => {
    return shortcut.enabled ? shortcut.enabled() : true;
  }, []);

  // Obter descrição completa de um atalho
  const getShortcutDescription = useCallback((shortcut: KeyboardShortcut): string => {
    const keys = formatShortcut(shortcut);
    const enabled = isShortcutEnabled(shortcut);
    const status = enabled ? '' : ' (desabilitado)';
    
    return `${keys}: ${shortcut.description}${status}`;
  }, [formatShortcut, isShortcutEnabled]);

  return {
    shortcuts,
    getShortcutsByCategory,
    getCategories,
    formatShortcut,
    isShortcutEnabled,
    getShortcutDescription,
  };
};