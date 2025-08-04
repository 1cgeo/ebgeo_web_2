// Path: features\drawing\lib\DrawingManager.ts

import maplibregl from 'maplibre-gl';
import { ExtendedFeature } from '../../data-access/schemas/feature.schema';
import { DrawingTool } from '../../../types/feature.types';

// Interfaces para configuração e callbacks
export interface DrawingManagerConfig {
  defaultTool: DrawingTool;
  enableKeyboardShortcuts: boolean;
  toolConfig: {
    snapToVertices: boolean;
    snapToEdges: boolean;
    snapTolerance: number;
    showCoordinates: boolean;
    allowUndo: boolean;
  };
}

export interface DrawingManagerCallbacks {
  onFeatureCreated: (feature: ExtendedFeature) => void;
  onFeatureUpdated: (feature: ExtendedFeature) => void;
  onFeatureDeleted: (featureId: string) => void;
  onToolChanged: (tool: DrawingTool) => void;
  onStatusChange: (status: string) => void;
  onError: (error: string) => void;
}

// CORREÇÃO: Interface para tracking de event listeners
interface EventListenerTracker {
  element: EventTarget;
  event: string;
  handler: EventListener;
  options?: boolean | AddEventListenerOptions;
}

// CORREÇÃO: Interface para tools tracking
interface ToolTracker {
  tool: any; // AbstractTool instance
  initialized: boolean;
}

/**
 * Gerenciador principal do sistema de desenho
 */
export class DrawingManager {
  private map: maplibregl.Map;
  private config: DrawingManagerConfig;
  private callbacks: DrawingManagerCallbacks;

  // Estado do manager
  private isEnabled: boolean = false;
  private isInitialized: boolean = false;
  private isDestroyed: boolean = false;

  // Ferramentas disponíveis
  private tools: Map<DrawingTool, ToolTracker> = new Map();
  private activeTool: any | null = null; // AbstractTool instance

  // CORREÇÃO: Event listeners tracking
  private eventListeners: Set<EventListenerTracker> = new Set();
  private keyboardHandler: ((e: KeyboardEvent) => void) | null = null;

  // CORREÇÃO: Abort controller para cleanup assíncrono
  private abortController: AbortController | null = null;

  constructor(
    map: maplibregl.Map,
    config: DrawingManagerConfig,
    callbacks: DrawingManagerCallbacks
  ) {
    this.map = map;
    this.config = config;
    this.callbacks = callbacks;

    // CORREÇÃO: Criar abort controller para operações assíncronas
    this.abortController = new AbortController();

    this.initialize();
  }

  /**
   * Inicializar o Drawing Manager
   */
  private initialize(): void {
    if (this.isDestroyed) {
      console.warn('Tentativa de inicializar DrawingManager destruído');
      return;
    }

    try {
      console.log('Inicializando Drawing Manager...');

      // Registrar ferramentas disponíveis
      this.registerTools();

      // Configurar event listeners se habilitado
      if (this.config.enableKeyboardShortcuts) {
        this.setupKeyboardShortcuts();
      }

      // CORREÇÃO: Configurar listeners de cleanup automático
      this.setupCleanupListeners();

      // Ativar ferramenta padrão
      this.setActiveTool(this.config.defaultTool);

      this.isInitialized = true;
      this.isEnabled = true;

      console.log('Drawing Manager inicializado com sucesso');
      this.callbacks.onStatusChange('Drawing Manager inicializado');
    } catch (error) {
      console.error('Erro ao inicializar Drawing Manager:', error);
      this.callbacks.onError(
        `Falha na inicialização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * CORREÇÃO: Registrar ferramentas com tracking robusto
   */
  private registerTools(): void {
    // Por simplicidade, apenas registrar placeholders
    // Na implementação real, seria feito import das classes das ferramentas
    const toolTypes: DrawingTool[] = ['select', 'point', 'line', 'polygon', 'text'];

    toolTypes.forEach(toolType => {
      this.tools.set(toolType, {
        tool: null, // Seria a instância da ferramenta
        initialized: false,
      });
    });

    console.log(`${this.tools.size} ferramentas registradas`);
  }

  /**
   * CORREÇÃO: Configurar atalhos de teclado com tracking
   */
  private setupKeyboardShortcuts(): void {
    if (this.isDestroyed) return;

    this.keyboardHandler = (e: KeyboardEvent) => {
      if (this.isDestroyed || !this.isEnabled) return;

      // Verificar se não está em um input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      this.handleKeyboardShortcut(e);
    };

    this.addTrackedEventListener(document, 'keydown', this.keyboardHandler, { passive: false });
  }

  /**
   * CORREÇÃO: Configurar listeners de cleanup automático
   */
  private setupCleanupListeners(): void {
    if (this.isDestroyed) return;

    // Cleanup quando a aba fica oculta
    this.addTrackedEventListener(document, 'visibilitychange', () => {
      if (document.hidden && this.activeTool) {
        this.deactivateCurrentTool();
      }
    });

    // Cleanup antes do unload
    this.addTrackedEventListener(window, 'beforeunload', () => {
      this.destroy();
    });

    // CORREÇÃO: Cleanup quando o mapa é removido
    this.addTrackedEventListener(
      this.map.getContainer(),
      'DOMNodeRemoved',
      () => {
        this.destroy();
      },
      { passive: true }
    );
  }

  /**
   * CORREÇÃO: Método helper para adicionar e trackear event listeners
   */
  private addTrackedEventListener(
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    if (this.isDestroyed) {
      console.warn('Tentativa de adicionar listener em DrawingManager destruído');
      return;
    }

    const tracker: EventListenerTracker = {
      element,
      event,
      handler,
      options,
    };

    try {
      // CORREÇÃO: Usar abort controller se disponível
      const listenerOptions = this.abortController
        ? {
            ...options,
            signal: this.abortController.signal,
          }
        : options;

      element.addEventListener(event, handler, listenerOptions);
      this.eventListeners.add(tracker);
    } catch (error) {
      console.error('Erro ao adicionar event listener:', error);
    }
  }

  /**
   * CORREÇÃO: Método helper para remover event listener específico
   */
  private removeTrackedEventListener(tracker: EventListenerTracker): void {
    try {
      tracker.element.removeEventListener(tracker.event, tracker.handler, tracker.options);
      this.eventListeners.delete(tracker);
    } catch (error) {
      console.warn('Erro ao remover event listener:', error);
    }
  }

  /**
   * Manipular atalhos de teclado
   */
  private handleKeyboardShortcut(e: KeyboardEvent): void {
    if (this.isDestroyed) return;

    const key = e.key.toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;

    // Atalhos básicos
    switch (key) {
      case 'escape':
        if (this.activeTool) {
          this.deactivateCurrentTool();
        }
        break;

      case 's':
        if (!ctrl) {
          this.setActiveTool('select');
          e.preventDefault();
        }
        break;

      case 'p':
        if (!ctrl) {
          this.setActiveTool('point');
          e.preventDefault();
        }
        break;

      case 'l':
        if (!ctrl) {
          this.setActiveTool('line');
          e.preventDefault();
        }
        break;

      case 'o':
        if (!ctrl) {
          this.setActiveTool('polygon');
          e.preventDefault();
        }
        break;

      case 't':
        if (!ctrl) {
          this.setActiveTool('text');
          e.preventDefault();
        }
        break;
    }
  }

  /**
   * Definir ferramenta ativa
   */
  setActiveTool(tool: DrawingTool): boolean {
    if (this.isDestroyed || !this.isEnabled) {
      console.warn('DrawingManager não está disponível');
      return false;
    }

    try {
      // Desativar ferramenta atual
      this.deactivateCurrentTool();

      // Verificar se a ferramenta existe
      const toolTracker = this.tools.get(tool);
      if (!toolTracker) {
        console.warn(`Ferramenta não registrada: ${tool}`);
        return false;
      }

      // CORREÇÃO: Lazy loading e inicialização segura da ferramenta
      if (!toolTracker.initialized) {
        console.log(`Inicializando ferramenta: ${tool}`);
        // Aqui seria feita a inicialização real da ferramenta
        toolTracker.initialized = true;
      }

      this.activeTool = toolTracker.tool;

      // Ativar a ferramenta (se implementada)
      if (this.activeTool && typeof this.activeTool.activate === 'function') {
        this.activeTool.activate();
      }

      console.log(`Ferramenta ativa: ${tool}`);
      this.callbacks.onToolChanged(tool);
      this.callbacks.onStatusChange(`Ferramenta ${tool} ativada`);

      return true;
    } catch (error) {
      console.error('Erro ao ativar ferramenta:', error);
      this.callbacks.onError(
        `Falha ao ativar ferramenta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
      return false;
    }
  }

  /**
   * CORREÇÃO: Desativar ferramenta atual com cleanup robusto
   */
  private deactivateCurrentTool(): void {
    if (this.activeTool) {
      try {
        // Chamar método de desativação se disponível
        if (typeof this.activeTool.deactivate === 'function') {
          this.activeTool.deactivate();
        }

        // CORREÇÃO: Limpar qualquer estado de desenho
        if (typeof this.activeTool.reset === 'function') {
          this.activeTool.reset();
        }

        console.log('Ferramenta anterior desativada');
      } catch (error) {
        console.warn('Erro ao desativar ferramenta:', error);
      }

      this.activeTool = null;
    }
  }

  /**
   * Obter informações sobre a ferramenta ativa
   */
  getActiveToolInfo(): {
    name: string;
    description: string;
    isDrawing: boolean;
    canFinish: boolean;
  } | null {
    if (!this.activeTool || this.isDestroyed) return null;

    return {
      name: this.activeTool.getName?.() || 'Desconhecida',
      description: this.activeTool.getDescription?.() || '',
      isDrawing: this.activeTool.drawing || false,
      canFinish: this.activeTool.canFinish || false,
    };
  }

  /**
   * Verificar se está desenhando
   */
  isDrawing(): boolean {
    return this.activeTool?.drawing || false;
  }

  /**
   * Habilitar/desabilitar o manager
   */
  setEnabled(enabled: boolean): void {
    if (this.isDestroyed) {
      console.warn('Tentativa de habilitar DrawingManager destruído');
      return;
    }

    if (this.isEnabled === enabled) return;

    this.isEnabled = enabled;

    if (!enabled) {
      this.deactivateCurrentTool();
    }

    this.callbacks.onStatusChange(
      enabled ? 'Drawing Manager habilitado' : 'Drawing Manager desabilitado'
    );
  }

  /**
   * CORREÇÃO: Cleanup robusto e completo
   */
  destroy(): void {
    if (this.isDestroyed) {
      console.warn('DrawingManager já foi destruído');
      return;
    }

    console.log('Destruindo Drawing Manager...');
    this.isDestroyed = true;
    this.isEnabled = false;

    // Desativar ferramenta atual
    this.deactivateCurrentTool();

    // CORREÇÃO: Cancelar operações assíncronas
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    // CORREÇÃO: Limpar todas as ferramentas
    this.tools.forEach((toolTracker, toolType) => {
      if (toolTracker.tool && typeof toolTracker.tool.destroy === 'function') {
        try {
          toolTracker.tool.destroy();
        } catch (error) {
          console.warn(`Erro ao destruir ferramenta ${toolType}:`, error);
        }
      }
    });
    this.tools.clear();

    // CORREÇÃO: Remover todos os event listeners trackeados
    const listenersToRemove = Array.from(this.eventListeners);
    listenersToRemove.forEach(tracker => {
      this.removeTrackedEventListener(tracker);
    });

    // CORREÇÃO: Remover keyboard handler especificamente
    if (this.keyboardHandler) {
      try {
        document.removeEventListener('keydown', this.keyboardHandler);
        this.keyboardHandler = null;
      } catch (error) {
        console.warn('Erro ao remover keyboard handler:', error);
      }
    }

    // Verificar se todos os listeners foram removidos
    if (this.eventListeners.size > 0) {
      console.warn(`${this.eventListeners.size} event listeners não foram removidos corretamente`);
      this.eventListeners.clear();
    }

    // Limpar referências
    this.activeTool = null;
    this.isInitialized = false;

    console.log('Drawing Manager destruído com sucesso');
    this.callbacks.onStatusChange('Drawing Manager destruído');
  }

  // Getters para estado
  get enabled(): boolean {
    return this.isEnabled;
  }

  get initialized(): boolean {
    return this.isInitialized;
  }

  get destroyed(): boolean {
    return this.isDestroyed;
  }

  get availableTools(): DrawingTool[] {
    return Array.from(this.tools.keys());
  }

  /**
   * CORREÇÃO: Método para verificar estado dos event listeners (debug)
   */
  getListenersInfo(): {
    count: number;
    details: { element: string; event: string }[];
  } {
    return {
      count: this.eventListeners.size,
      details: Array.from(this.eventListeners).map(tracker => ({
        element: tracker.element.constructor.name,
        event: tracker.event,
      })),
    };
  }

  /**
   * CORREÇÃO: Método para verificar estado das ferramentas (debug)
   */
  getToolsInfo(): {
    registered: number;
    initialized: number;
    active: string | null;
  } {
    const initializedCount = Array.from(this.tools.values()).filter(
      tracker => tracker.initialized
    ).length;

    return {
      registered: this.tools.size,
      initialized: initializedCount,
      active: this.activeTool?.getName?.() || null,
    };
  }
}

/**
 * Factory function para criar o manager
 */
export const createDrawingManager = (
  map: maplibregl.Map,
  config: Partial<DrawingManagerConfig>,
  callbacks: DrawingManagerCallbacks
): DrawingManager => {
  const defaultConfig: DrawingManagerConfig = {
    defaultTool: 'select',
    enableKeyboardShortcuts: true,
    toolConfig: {
      snapToVertices: true,
      snapToEdges: false,
      snapTolerance: 10,
      showCoordinates: true,
      allowUndo: true,
    },
  };

  const finalConfig = { ...defaultConfig, ...config };
  return new DrawingManager(map, finalConfig, callbacks);
};
