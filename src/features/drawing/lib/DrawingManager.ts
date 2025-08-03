// Path: features\drawing\lib\DrawingManager.ts

import maplibregl from 'maplibre-gl';
import { ExtendedFeature } from '../../data-access/schemas/feature.schema';
import { DrawingTool } from '../../../types/feature.types';
import { AbstractTool, ToolConfig, ToolCallbacks } from '../tools/AbstractTool';
import { PointTool } from '../tools/PointTool';
import { LineTool } from '../tools/LineTool';

// Interface para configuração do manager
export interface DrawingManagerConfig {
  defaultTool: DrawingTool;
  enableKeyboardShortcuts: boolean;
  toolConfig: ToolConfig;
}

// Interface para callbacks do manager
export interface DrawingManagerCallbacks {
  onFeatureCreated: (feature: ExtendedFeature) => void;
  onFeatureUpdated: (feature: ExtendedFeature) => void;
  onToolChanged: (tool: DrawingTool) => void;
  onError: (error: string) => void;
  onStatusChange: (status: string) => void;
}

// Classe principal que gerencia todas as ferramentas de desenho
export class DrawingManager {
  private map: maplibregl.Map;
  private config: DrawingManagerConfig;
  private callbacks: DrawingManagerCallbacks;
  
  // Ferramentas disponíveis
  private tools: Map<DrawingTool, AbstractTool> = new Map();
  private activeTool: AbstractTool | null = null;
  private activeLayerId: string | null = null;
  
  // Estado do manager
  private isEnabled: boolean = false;
  private isInitialized: boolean = false;

  constructor(
    map: maplibregl.Map,
    config: DrawingManagerConfig,
    callbacks: DrawingManagerCallbacks
  ) {
    this.map = map;
    this.config = config;
    this.callbacks = callbacks;
    
    this.initialize();
  }

  // Inicializar o manager e suas ferramentas
  private initialize(): void {
    if (this.isInitialized) return;

    try {
      // Criar callbacks para as ferramentas
      const toolCallbacks: ToolCallbacks = {
        onFeatureComplete: (feature) => {
          this.callbacks.onFeatureCreated(feature);
        },
        onFeatureUpdate: (feature) => {
          this.callbacks.onFeatureUpdated(feature);
        },
        onCancel: () => {
          this.callbacks.onStatusChange('Operação cancelada');
        },
        onError: (error) => {
          this.callbacks.onError(error);
        },
        onStatusChange: (status) => {
          this.callbacks.onStatusChange(status);
        },
      };

      // Criar instâncias das ferramentas
      this.tools.set('point', new PointTool(this.map, this.config.toolConfig, toolCallbacks));
      this.tools.set('line', new LineTool(this.map, this.config.toolConfig, toolCallbacks));

      // Configurar atalhos de teclado se habilitado
      if (this.config.enableKeyboardShortcuts) {
        this.setupKeyboardShortcuts();
      }

      this.isInitialized = true;
      this.callbacks.onStatusChange('Drawing Manager inicializado');
      
      // Ativar ferramenta padrão
      this.setActiveTool(this.config.defaultTool);
      
    } catch (error) {
      this.callbacks.onError(`Erro ao inicializar Drawing Manager: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // Ativar/desativar o manager
  enable(): void {
    if (!this.isInitialized) {
      this.callbacks.onError('Drawing Manager não foi inicializado');
      return;
    }

    this.isEnabled = true;
    if (this.activeTool) {
      this.activeTool.activate();
    }
    this.callbacks.onStatusChange('Drawing Manager ativado');
  }

  disable(): void {
    this.isEnabled = false;
    if (this.activeTool) {
      this.activeTool.deactivate();
    }
    this.callbacks.onStatusChange('Drawing Manager desativado');
  }

  // Gerenciamento de ferramentas
  setActiveTool(tool: DrawingTool): void {
    if (!this.isInitialized) {
      this.callbacks.onError('Drawing Manager não foi inicializado');
      return;
    }

    // Desativar ferramenta atual
    if (this.activeTool) {
      this.activeTool.deactivate();
    }

    // Ativar nova ferramenta
    const newTool = this.tools.get(tool);
    if (!newTool) {
      this.callbacks.onError(`Ferramenta ${tool} não encontrada`);
      return;
    }

    this.activeTool = newTool;
    
    // Configurar camada ativa na ferramenta
    if (this.activeLayerId) {
      this.setActiveLayerForTool(this.activeLayerId);
    }

    // Ativar se o manager estiver habilitado
    if (this.isEnabled) {
      this.activeTool.activate();
    }

    this.callbacks.onToolChanged(tool);
    this.callbacks.onStatusChange(`Ferramenta ${newTool.getName()} selecionada`);
  }

  getActiveTool(): DrawingTool | null {
    return this.activeTool?.getToolType() || null;
  }

  // Gerenciamento de camadas
  setActiveLayer(layerId: string): void {
    this.activeLayerId = layerId;
    this.setActiveLayerForTool(layerId);
    this.callbacks.onStatusChange(`Camada ativa: ${layerId}`);
  }

  getActiveLayer(): string | null {
    return this.activeLayerId;
  }

  private setActiveLayerForTool(layerId: string): void {
    // Configurar camada ativa em todas as ferramentas que suportam
    this.tools.forEach(tool => {
      if (tool instanceof PointTool || tool instanceof LineTool) {
        (tool as any).setActiveLayer(layerId);
      }
    });
  }

  // Configuração de ferramentas
  updateToolConfig(config: Partial<ToolConfig>): void {
    this.config.toolConfig = { ...this.config.toolConfig, ...config };
    
    // Atualizar configuração em todas as ferramentas
    this.tools.forEach(tool => {
      (tool as any).config = this.config.toolConfig;
    });

    this.callbacks.onStatusChange('Configurações de ferramentas atualizadas');
  }

  getToolConfig(): ToolConfig {
    return { ...this.config.toolConfig };
  }

  // Atalhos de teclado
  private setupKeyboardShortcuts(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!this.isEnabled) return;

      // Verificar se não está em um input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'p':
          this.setActiveTool('point');
          e.preventDefault();
          break;
        case 'l':
          this.setActiveTool('line');
          e.preventDefault();
          break;
        case 's':
          this.setActiveTool('select');
          e.preventDefault();
          break;
        case 'escape':
          this.cancelCurrentOperation();
          e.preventDefault();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Armazenar referência para cleanup
    (this as any).keyboardHandler = handleKeyDown;
  }

  // Operações de controle
  cancelCurrentOperation(): void {
    if (this.activeTool && this.activeTool.drawing) {
      (this.activeTool as any).cancel();
      this.callbacks.onStatusChange('Operação cancelada');
    }
  }

  finishCurrentOperation(): void {
    if (this.activeTool && this.activeTool.drawing) {
      (this.activeTool as any).finishDrawing();
    }
  }

  // Informações sobre o estado atual
  getCurrentToolInfo(): {
    name: string;
    description: string;
    isDrawing: boolean;
    canFinish?: boolean;
  } | null {
    if (!this.activeTool) return null;

    return {
      name: this.activeTool.getName(),
      description: this.activeTool.getDescription(),
      isDrawing: this.activeTool.drawing,
      canFinish: (this.activeTool as any).canFinish,
    };
  }

  isDrawing(): boolean {
    return this.activeTool?.drawing || false;
  }

  // Métodos para criação programática
  createPoint(position: [number, number], properties?: any): ExtendedFeature | null {
    const pointTool = this.tools.get('point') as PointTool;
    if (!pointTool) {
      this.callbacks.onError('Ferramenta de ponto não disponível');
      return null;
    }

    return pointTool.createPointAt(position, properties);
  }

  createLine(positions: [number, number][], properties?: any): ExtendedFeature | null {
    const lineTool = this.tools.get('line') as LineTool;
    if (!lineTool) {
      this.callbacks.onError('Ferramenta de linha não disponível');
      return null;
    }

    return lineTool.createLineFromPoints(positions, properties);
  }

  // Cleanup
  destroy(): void {
    // Desativar ferramenta atual
    if (this.activeTool) {
      this.activeTool.deactivate();
    }

    // Remover event listeners
    if ((this as any).keyboardHandler) {
      document.removeEventListener('keydown', (this as any).keyboardHandler);
    }

    // Limpar ferramentas
    this.tools.clear();
    this.activeTool = null;
    this.isEnabled = false;
    this.isInitialized = false;

    this.callbacks.onStatusChange('Drawing Manager destruído');
  }

  // Getters para estado
  get enabled(): boolean {
    return this.isEnabled;
  }

  get initialized(): boolean {
    return this.isInitialized;
  }

  get availableTools(): DrawingTool[] {
    return Array.from(this.tools.keys());
  }
}

// Factory function para criar o manager
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