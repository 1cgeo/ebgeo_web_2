// Path: pages/Main.page.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  useTheme, 
  CircularProgress, 
  Alert, 
  Typography, 
  Fab, 
  Tooltip,
  Snackbar,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  Layers as LayersIcon,
  Map as MapIcon,
  Settings as SettingsIcon,
  SwapHoriz as TransferIcon,
  TableChart as TableIcon,
  Close as CloseIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

import { MapView } from '../features/core-map/components/MapView';
import { DrawingToolbar } from '../features/drawing/components/DrawingToolbar';
import { LayerManager } from '../features/layers/components/LayerManager';
import { MapContextSwitcher } from '../features/maps-contexts/components/MapContextSwitcher';
import { PropertiesPanel } from '../features/drawing/components/PropertiesPanel';
import { FeatureTransferDialog } from '../features/layers/components/FeatureTransferDialog';
import { AttributeTable } from '../features/layers/components/AttributeTable';
import { FeatureContextMenu } from '../features/selection/components/FeatureContextMenu';
import { KeyboardShortcutsHelp } from '../components/ui/KeyboardShortcutsHelp';

import { useMapInstance } from '../features/core-map/hooks/useMapInstance';
import { useFeatureSelection } from '../features/selection/hooks/useFeatureSelection';
import { useFeatureTransfer } from '../features/layers/hooks/useFeatureTransfer';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useDrawingStore } from '../features/drawing/store/drawing.store';
import { useMapsStore, useMapsActions, useMapsSelectors } from '../features/maps-contexts/store/maps.store';
import { useLayersStore, useLayersActions, useLayersSelectors } from '../features/layers/store/layers.store';
import { useCreateFeature, useUpdateFeature } from '../features/data-access/hooks/useMutateFeature';
import { useEnsureDefaultMap, useMapWithLayers } from '../features/data-access/hooks/useMaps';
import { DrawingManager, createDrawingManager } from '../features/drawing/lib/DrawingManager';
import { HotSource } from '../features/drawing/lib/HotSource';
import { ExtendedFeature } from '../features/data-access/schemas/feature.schema';

// Interface para notificações
interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export const MainPage: React.FC = () => {
  const theme = useTheme();
  
  // Estados locais da UI
  const [layerManagerOpen, setLayerManagerOpen] = useState(false);
  const [mapSwitcherOpen, setMapSwitcherOpen] = useState(false);
  const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(false);
  const [attributeTableOpen, setAttributeTableOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedLayerForTable, setSelectedLayerForTable] = useState<string>('');
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  
  // Estados do context menu
  const [contextMenu, setContextMenu] = useState<{
    open: boolean;
    anchorPosition: { top: number; left: number } | null;
    feature: ExtendedFeature | null;
  }>({
    open: false,
    anchorPosition: null,
    feature: null,
  });
  
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Estados do sistema de desenho
  const [drawingManager, setDrawingManager] = useState<DrawingManager | null>(null);
  const [hotSource, setHotSource] = useState<HotSource | null>(null);

  // Hooks do mapa
  const { map, isMapLoaded } = useMapInstance();
  
  // Hooks de seleção
  const { 
    selectedFeatures, 
    hasSelection,
    hasSingleSelection,
    selectionStats,
    selectAtPoint,
    selectById,
    handleMouseEnter, 
    handleMouseLeave,
    startEditing,
    stopEditing,
    clearSelection,
  } = useFeatureSelection();
  
  // Hook de transferência
  const featureTransfer = useFeatureTransfer();
  
  // Hook de shortcuts de teclado
  useKeyboardShortcuts({
    enabled: true,
    excludeInputs: true,
  });
  
  // Stores
  const { activeTool } = useDrawingStore();
  const mapsSelectors = useMapsSelectors();
  const layersSelectors = useLayersSelectors();
  const mapsActions = useMapsActions();
  const layersActions = useLayersActions();

  // Mutations
  const createFeature = useCreateFeature();
  const updateFeature = useUpdateFeature();

  // Queries
  const { 
    data: defaultMap, 
    isLoading: isLoadingDefaultMap, 
    error: defaultMapError 
  } = useEnsureDefaultMap();

  const activeMapId = useMapsStore(state => state.activeMapId);
  const {
    data: activeMapWithLayers,
    isLoading: isLoadingMapData,
    error: mapDataError,
  } = useMapWithLayers(activeMapId || '');

  // Inicialização do mapa padrão
  useEffect(() => {
    if (defaultMap && !activeMapId) {
      mapsActions.setActiveMapData(defaultMap);
    }
  }, [defaultMap, activeMapId, mapsActions]);

  // Configuração do DrawingManager
  useEffect(() => {
    if (isMapLoaded && map && !drawingManager) {
      const manager = createDrawingManager(map, {
        onCreate: async (feature: ExtendedFeature) => {
          try {
            await createFeature.mutateAsync(feature);
            showNotification('Feature criada com sucesso', 'success');
          } catch (error) {
            showNotification('Erro ao criar feature', 'error');
            console.error('Erro ao criar feature:', error);
          }
        },
        onUpdate: async (feature: ExtendedFeature) => {
          try {
            await updateFeature.mutateAsync({
              id: feature.id,
              updates: feature,
            });
            showNotification('Feature atualizada com sucesso', 'success');
          } catch (error) {
            showNotification('Erro ao atualizar feature', 'error');
            console.error('Erro ao atualizar feature:', error);
          }
        },
      });

      const hotSourceInstance = new HotSource(map);
      
      setDrawingManager(manager);
      setHotSource(hotSourceInstance);
    }
  }, [isMapLoaded, map, drawingManager, createFeature, updateFeature]);

  // Handlers para notificações
  const showNotification = useCallback((message: string, severity: NotificationState['severity']) => {
    setNotification({ open: true, message, severity });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Handlers para ações de feature
  const handleFeatureEdit = useCallback((feature: ExtendedFeature) => {
    startEditing(feature.id);
    setPropertiesPanelOpen(true);
  }, [startEditing]);

  // Handler para feature com clique direito (context menu)
  const handleFeatureRightClick = useCallback((
    feature: ExtendedFeature, 
    event: { x: number; y: number }
  ) => {
    setContextMenu({
      open: true,
      anchorPosition: { top: event.y, left: event.x },
      feature,
    });
  }, []);

  // Handler para fechar context menu
  const handleCloseContextMenu = useCallback(() => {
    setContextMenu({
      open: false,
      anchorPosition: null,
      feature: null,
    });
  }, []);

  // Handler para zoom para feature
  const handleZoomToFeature = useCallback((feature: ExtendedFeature) => {
    if (map) {
      // TODO: Implementar zoom para feature usando bounds da geometria
      console.log('Zoom para feature:', feature.id);
    }
  }, [map]);

  // Handler para mostrar info da feature
  const handleShowFeatureInfo = useCallback((feature: ExtendedFeature) => {
    setPropertiesPanelOpen(true);
    startEditing(feature.id);
  }, [startEditing]);

  const handleFeatureSelect = useCallback((point: { x: number; y: number }) => {
    selectAtPoint(point);
  }, [selectAtPoint]);

  // Handlers para camadas
  const handleLayerSelect = useCallback(() => {
    setLayerManagerOpen(true);
  }, []);

  const handleMapSwitch = useCallback(() => {
    setMapSwitcherOpen(true);
  }, []);

  // Handler para abrir tabela de atributos
  const handleOpenAttributeTable = useCallback((layerId?: string) => {
    const targetLayerId = layerId || layersSelectors.activeLayerId;
    if (targetLayerId) {
      setSelectedLayerForTable(targetLayerId);
      setAttributeTableOpen(true);
    } else {
      showNotification('Selecione uma camada primeiro', 'warning');
    }
  }, [layersSelectors.activeLayerId]);

  // Handler para transferência rápida
  const handleQuickTransfer = useCallback(() => {
    if (hasSelection) {
      featureTransfer.openTransferDialog();
    } else {
      showNotification('Selecione features primeiro', 'warning');
    }
  }, [hasSelection, featureTransfer]);

  // Ações do Speed Dial
  const speedDialActions = [
    {
      icon: <LayersIcon />,
      name: 'Gerenciar Camadas',
      onClick: () => setLayerManagerOpen(true),
    },
    {
      icon: <MapIcon />,
      name: 'Trocar Mapa',
      onClick: () => setMapSwitcherOpen(true),
    },
    {
      icon: <TableIcon />,
      name: 'Tabela de Atributos',
      onClick: () => handleOpenAttributeTable(),
      disabled: !layersSelectors.activeLayerId,
    },
    {
      icon: <TransferIcon />,
      name: 'Transferir Features',
      onClick: handleQuickTransfer,
      disabled: !hasSelection,
    },
    {
      icon: <HelpIcon />,
      name: 'Atalhos de Teclado',
      onClick: () => setHelpOpen(true),
    },
  ];

  // Loading states
  if (isLoadingDefaultMap || isLoadingMapData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        bgcolor="background.default"
      >
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Carregando aplicação...
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Inicializando mapa e dados
          </Typography>
        </Box>
      </Box>
    );
  }

  // Error states
  if (defaultMapError || mapDataError) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        bgcolor="background.default"
        p={3}
      >
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            Erro ao Carregar a Aplicação
          </Typography>
          <Typography variant="body2">
            {defaultMapError?.message || mapDataError?.message || 'Erro desconhecido'}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {/* Componente principal do mapa */}
      <MapView
        onFeatureClick={handleFeatureSelect}
        onFeatureRightClick={handleFeatureRightClick}
        onFeatureHover={handleMouseEnter}
        onFeatureLeave={handleMouseLeave}
        selectedFeatures={selectedFeatures}
        sx={{ height: '100%', width: '100%' }}
      />

      {/* Barra de ferramentas de desenho */}
      <DrawingToolbar
        onLayerSelect={handleLayerSelect}
        activeLayerName={layersSelectors.activeLayerName}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 1100,
        }}
      />

      {/* Informações de seleção */}
      {hasSelection && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1100,
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 1,
            boxShadow: 2,
            minWidth: 200,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Seleção Ativa
          </Typography>
          <Typography variant="body2">
            {selectionStats.count} feature(s) selecionada(s)
          </Typography>
          {selectionStats.layerCount > 1 && (
            <Typography variant="caption" color="textSecondary">
              Em {selectionStats.layerCount} camada(s)
            </Typography>
          )}
          <Box mt={1}>
            <Tooltip title="Transferir features selecionadas">
              <Fab
                size="small"
                color="primary"
                onClick={handleQuickTransfer}
                sx={{ mr: 1 }}
              >
                <TransferIcon />
              </Fab>
            </Tooltip>
            <Tooltip title="Limpar seleção">
              <Fab
                size="small"
                onClick={clearSelection}
              >
                <CloseIcon />
              </Fab>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* Speed Dial para ações rápidas */}
      <SpeedDial
        ariaLabel="Ações rápidas"
        sx={{ 
          position: 'absolute', 
          bottom: 32, 
          right: 32,
          zIndex: 1200,
        }}
        icon={<SpeedDialIcon />}
        open={speedDialOpen}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              action.onClick();
              setSpeedDialOpen(false);
            }}
            FabProps={{
              disabled: action.disabled,
            }}
          />
        ))}
      </SpeedDial>

      {/* Indicador de status do mapa */}
      {mapsSelectors.activeMapName && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            zIndex: 1100,
            bgcolor: 'background.paper',
            px: 2,
            py: 1,
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <Typography variant="caption" color="textSecondary">
            Mapa Ativo:
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {mapsSelectors.activeMapName}
          </Typography>
        </Box>
      )}

      {/* Gerenciador de Camadas */}
      <LayerManager
        open={layerManagerOpen}
        onClose={() => setLayerManagerOpen(false)}
      />

      {/* Seletor de Contexto de Mapa */}
      <MapContextSwitcher
        open={mapSwitcherOpen}
        onClose={() => setMapSwitcherOpen(false)}
      />

      {/* Painel de Propriedades */}
      <PropertiesPanel
        open={propertiesPanelOpen}
        onClose={() => setPropertiesPanelOpen(false)}
      />

      {/* Diálogo de Transferência de Features */}
      <FeatureTransferDialog
        open={featureTransfer.isDialogOpen}
        onClose={featureTransfer.closeTransferDialog}
        preSelectedFeatureIds={featureTransfer.preSelectedFeatureIds}
      />

      {/* Tabela de Atributos */}
      {selectedLayerForTable && (
        <AttributeTable
          open={attributeTableOpen}
          layerId={selectedLayerForTable}
          onClose={() => {
            setAttributeTableOpen(false);
            setSelectedLayerForTable('');
          }}
          onFeatureEdit={handleFeatureEdit}
        />
      )}

      {/* Context Menu para Features */}
      <FeatureContextMenu
        open={contextMenu.open}
        anchorPosition={contextMenu.anchorPosition}
        feature={contextMenu.feature}
        onClose={handleCloseContextMenu}
        onEdit={handleFeatureEdit}
        onZoomTo={handleZoomToFeature}
        onShowInfo={handleShowFeatureInfo}
      />

      {/* Ajuda de Atalhos de Teclado */}
      <KeyboardShortcutsHelp
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
      />

      {/* Sistema de notificações */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={closeNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ minWidth: 300 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};