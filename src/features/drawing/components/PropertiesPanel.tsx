// Path: features\drawing\components\PropertiesPanel.tsx

import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  Divider,
  Slider,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Grid,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  ColorLens as ColorIcon,
} from '@mui/icons-material';

import { useFeatureSelection } from '../../selection/hooks/useFeatureSelection';
import { useUpdateFeature } from '../../data-access/hooks/useMutateFeature';
import { ExtendedFeature, FeatureStyle } from '../../data-access/schemas/feature.schema';

interface PropertiesPanelProps {
  open: boolean;
  onClose: () => void;
  className?: string;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  open,
  onClose,
  className,
}) => {
  const { selectedFeatures, selectionStats, hasSelection, hasSingleSelection } = useFeatureSelection();
  const updateFeature = useUpdateFeature();

  // Estado local para edição
  const [editedFeature, setEditedFeature] = useState<ExtendedFeature | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>(['basic', 'style']);

  // Feature ativa (primeira selecionada)
  const activeFeature = selectedFeatures[0] || null;

  // Sincronizar com feature selecionada
  useEffect(() => {
    if (hasSingleSelection && activeFeature) {
      setEditedFeature({ ...activeFeature });
      setIsDirty(false);
    } else {
      setEditedFeature(null);
      setIsDirty(false);
    }
  }, [activeFeature, hasSingleSelection]);

  // Handler para mudanças nos acordeões
  const handleAccordionChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean,
  ) => {
    setExpandedAccordions(prev => 
      isExpanded 
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    );
  };

  // Handlers para edição de propriedades básicas
  const handleNameChange = (value: string) => {
    if (!editedFeature) return;
    
    setEditedFeature(prev => prev ? {
      ...prev,
      properties: {
        ...prev.properties,
        name: value,
      },
    } : null);
    setIsDirty(true);
  };

  const handleDescriptionChange = (value: string) => {
    if (!editedFeature) return;
    
    setEditedFeature(prev => prev ? {
      ...prev,
      properties: {
        ...prev.properties,
        description: value,
      },
    } : null);
    setIsDirty(true);
  };

  // Handlers para edição de estilo
  const handleStyleChange = (styleUpdates: Partial<FeatureStyle>) => {
    if (!editedFeature) return;
    
    setEditedFeature(prev => prev ? {
      ...prev,
      properties: {
        ...prev.properties,
        style: {
          ...prev.properties.style,
          ...styleUpdates,
        },
      },
    } : null);
    setIsDirty(true);
  };

  // Salvar mudanças
  const handleSave = async () => {
    if (!editedFeature || !isDirty) return;

    try {
      await updateFeature.mutateAsync({
        id: editedFeature.id,
        updates: editedFeature,
      });
      setIsDirty(false);
    } catch (error) {
      console.error('Erro ao salvar feature:', error);
    }
  };

  // Resetar mudanças
  const handleReset = () => {
    if (activeFeature) {
      setEditedFeature({ ...activeFeature });
      setIsDirty(false);
    }
  };

  // Renderizar conteúdo baseado na seleção
  const renderContent = () => {
    if (!hasSelection) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Selecione uma feature para editar suas propriedades
          </Typography>
        </Box>
      );
    }

    if (!hasSingleSelection) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Seleção Múltipla
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            {selectionStats.count} features selecionadas
          </Alert>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Tipos de Geometria:
            </Typography>
            {Object.entries(selectionStats.geometryTypes).map(([type, count]) => (
              <Chip
                key={type}
                label={`${type}: ${count}`}
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Camadas:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectionStats.layerCount} camada(s) diferentes
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Selecione apenas uma feature para editar propriedades individuais
          </Typography>
        </Box>
      );
    }

    if (!editedFeature) return null;

    return (
      <Box sx={{ p: 2 }}>
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Propriedades
          </Typography>
          <Box>
            {isDirty && (
              <Tooltip title="Resetar mudanças">
                <IconButton size="small" onClick={handleReset}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Salvar mudanças">
              <span>
                <IconButton
                  size="small"
                  onClick={handleSave}
                  disabled={!isDirty || updateFeature.isPending}
                  color="primary"
                >
                  <SaveIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        {isDirty && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Há mudanças não salvas
          </Alert>
        )}

        {/* Informações básicas */}
        <Accordion
          expanded={expandedAccordions.includes('basic')}
          onChange={handleAccordionChange('basic')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Informações Básicas</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nome"
                value={editedFeature.properties.name || ''}
                onChange={(e) => handleNameChange(e.target.value)}
                size="small"
                fullWidth
              />
              
              <TextField
                label="Descrição"
                value={editedFeature.properties.description || ''}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                multiline
                rows={3}
                size="small"
                fullWidth
              />

              <Box>
                <Typography variant="caption" color="text.secondary">
                  ID: {editedFeature.id}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tipo: {editedFeature.geometry.type}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Criado: {new Date(editedFeature.properties.createdAt).toLocaleString()}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Modificado: {new Date(editedFeature.properties.updatedAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Estilo */}
        <Accordion
          expanded={expandedAccordions.includes('style')}
          onChange={handleAccordionChange('style')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Estilo</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Cor do traço */}
              <Box>
                <Typography variant="body2" gutterBottom>
                  Cor do Traço
                </Typography>
                <input
                  type="color"
                  value={editedFeature.properties.style?.strokeColor || '#1976d2'}
                  onChange={(e) => handleStyleChange({ strokeColor: e.target.value })}
                  style={{
                    width: '100%',
                    height: 40,
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                />
              </Box>

              {/* Largura do traço */}
              <Box>
                <Typography variant="body2" gutterBottom>
                  Largura do Traço: {editedFeature.properties.style?.strokeWidth || 3}px
                </Typography>
                <Slider
                  value={editedFeature.properties.style?.strokeWidth || 3}
                  onChange={(_, value) => handleStyleChange({ strokeWidth: value as number })}
                  min={1}
                  max={20}
                  step={1}
                  size="small"
                />
              </Box>

              {/* Opacidade do traço */}
              <Box>
                <Typography variant="body2" gutterBottom>
                  Opacidade do Traço: {Math.round((editedFeature.properties.style?.strokeOpacity || 1) * 100)}%
                </Typography>
                <Slider
                  value={editedFeature.properties.style?.strokeOpacity || 1}
                  onChange={(_, value) => handleStyleChange({ strokeOpacity: value as number })}
                  min={0}
                  max={1}
                  step={0.1}
                  size="small"
                />
              </Box>

              {/* Para pontos */}
              {editedFeature.geometry.type === 'Point' && (
                <>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Cor do Marcador
                    </Typography>
                    <input
                      type="color"
                      value={editedFeature.properties.style?.markerColor || '#1976d2'}
                      onChange={(e) => handleStyleChange({ markerColor: e.target.value })}
                      style={{
                        width: '100%',
                        height: 40,
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Tamanho do Marcador: {editedFeature.properties.style?.markerSize || 8}px
                    </Typography>
                    <Slider
                      value={editedFeature.properties.style?.markerSize || 8}
                      onChange={(_, value) => handleStyleChange({ markerSize: value as number })}
                      min={4}
                      max={30}
                      step={2}
                      size="small"
                    />
                  </Box>
                </>
              )}

              {/* Para polígonos */}
              {editedFeature.geometry.type === 'Polygon' && (
                <>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Cor do Preenchimento
                    </Typography>
                    <input
                      type="color"
                      value={editedFeature.properties.style?.fillColor || '#1976d2'}
                      onChange={(e) => handleStyleChange({ fillColor: e.target.value })}
                      style={{
                        width: '100%',
                        height: 40,
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Opacidade do Preenchimento: {Math.round((editedFeature.properties.style?.fillOpacity || 0.3) * 100)}%
                    </Typography>
                    <Slider
                      value={editedFeature.properties.style?.fillOpacity || 0.3}
                      onChange={(_, value) => handleStyleChange({ fillOpacity: value as number })}
                      min={0}
                      max={1}
                      step={0.1}
                      size="small"
                    />
                  </Box>
                </>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Coordenadas (somente leitura) */}
        <Accordion
          expanded={expandedAccordions.includes('coordinates')}
          onChange={handleAccordionChange('coordinates')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Coordenadas</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {editedFeature.geometry.type === 'Point' && (
                <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem' }}>
                  Longitude: {(editedFeature.geometry.coordinates as [number, number])[0].toFixed(6)}{'\n'}
                  Latitude: {(editedFeature.geometry.coordinates as [number, number])[1].toFixed(6)}
                </Typography>
              )}
              
              {editedFeature.geometry.type === 'LineString' && (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    {(editedFeature.geometry.coordinates as [number, number][]).length} pontos
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ fontSize: '0.7rem', maxHeight: 200, overflow: 'auto' }}>
                    {(editedFeature.geometry.coordinates as [number, number][])
                      .map((coord, i) => `${i + 1}: ${coord[1].toFixed(6)}, ${coord[0].toFixed(6)}`)
                      .join('\n')}
                  </Typography>
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  };

  if (!open) return null;

  return (
    <Paper
      className={`properties-panel ${className || ''}`}
      elevation={3}
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        width: 350,
        maxHeight: 'calc(100vh - 32px)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Cabeçalho */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6">
          Propriedades
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Conteúdo */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {renderContent()}
      </Box>

      {/* Loading indicator */}
      {updateFeature.isPending && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: 'primary.main',
            animation: 'progress 1s ease-in-out infinite',
          }}
        />
      )}
    </Paper>
  );
};