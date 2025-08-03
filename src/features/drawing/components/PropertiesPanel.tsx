// Path: features/drawing/components/PropertiesPanel.tsx

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
import { CoordinatesTable } from '../../shared/components/CoordinatesTable';

interface PropertiesPanelProps {
  open: boolean;
  onClose: () => void;
  className?: string;
  onVertexSelect?: (featureId: string, vertexIndex: number, coordinate: [number, number]) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  open,
  onClose,
  className,
  onVertexSelect,
}) => {
  const { selectedFeatures, selectionStats, hasSelection, hasSingleSelection } = useFeatureSelection();
  const updateFeature = useUpdateFeature();

  // Estado local para edição
  const [editedFeature, setEditedFeature] = useState<ExtendedFeature | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>(['basic', 'style', 'coordinates']);
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | undefined>();

  // Feature ativa (primeira selecionada)
  const activeFeature = selectedFeatures[0] || null;

  // Sincronizar com feature selecionada
  useEffect(() => {
    if (hasSingleSelection && activeFeature) {
      setEditedFeature({ ...activeFeature });
      setIsDirty(false);
      setSelectedVertexIndex(undefined);
    } else {
      setEditedFeature(null);
      setIsDirty(false);
      setSelectedVertexIndex(undefined);
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

  // Handler para salvar mudanças
  const handleSave = async () => {
    if (!editedFeature || !isDirty) return;

    try {
      await updateFeature.mutateAsync({
        id: editedFeature.id,
        updates: {
          properties: {
            ...editedFeature.properties,
            updatedAt: new Date().toISOString(),
          },
        },
      });
      setIsDirty(false);
    } catch (error) {
      console.error('Erro ao salvar feature:', error);
    }
  };

  // Handler para reset
  const handleReset = () => {
    if (activeFeature) {
      setEditedFeature({ ...activeFeature });
      setIsDirty(false);
    }
  };

  // Handler para seleção de vértice
  const handleVertexSelect = (vertexIndex: number, coordinate: [number, number]) => {
    setSelectedVertexIndex(vertexIndex);
    if (editedFeature && onVertexSelect) {
      onVertexSelect(editedFeature.id, vertexIndex, coordinate);
    }
  };

  // Handler para hover de vértice
  const handleVertexHover = (vertexIndex: number | null) => {
    // Implementar highlight do vértice no mapa se necessário
  };

  // Render content baseado no estado
  const renderContent = () => {
    if (!hasSelection) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Selecione uma feição no mapa para ver suas propriedades
          </Typography>
        </Box>
      );
    }

    if (!hasSingleSelection) {
      return (
        <Box sx={{ p: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            {selectionStats.count} feições selecionadas
          </Alert>
          
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Para editar propriedades, selecione apenas uma feição.
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Resumo da Seleção:
            </Typography>
            <Typography variant="body2">
              • {selectionStats.count} feições
            </Typography>
            <Typography variant="body2">
              • {selectionStats.layerCount} camada(s)
            </Typography>
            <Typography variant="body2">
              • Tipos: {Object.entries(selectionStats.geometryTypes)
                .map(([type, count]) => `${type} (${count})`)
                .join(', ')}
            </Typography>
          </Box>
        </Box>
      );
    }

    if (!editedFeature) return null;

    return (
      <Box>
        {isDirty && (
          <Alert 
            severity="warning" 
            sx={{ m: 2, mb: 1 }}
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" onClick={handleReset}>
                  Desfazer
                </Button>
                <Button 
                  size="small" 
                  variant="contained" 
                  onClick={handleSave}
                  disabled={updateFeature.isPending}
                >
                  Salvar
                </Button>
              </Box>
            }
          >
            Modificações não salvas
          </Alert>
        )}

        {/* Propriedades Básicas */}
        <Accordion
          expanded={expandedAccordions.includes('basic')}
          onChange={handleAccordionChange('basic')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Propriedades Básicas</Typography>
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
                size="small"
                fullWidth
                multiline
                rows={3}
              />

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip 
                  icon={<EditIcon fontSize="small" />}
                  label={editedFeature.geometry.type}
                  size="small"
                  variant="outlined"
                />
                <Typography variant="caption" color="textSecondary">
                  ID: {editedFeature.id}
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
              {/* Cor da linha/borda */}
              <Box>
                <Typography variant="body2" gutterBottom>
                  Cor da Linha
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

              {/* Largura da linha */}
              <Box>
                <Typography variant="body2" gutterBottom>
                  Largura da Linha: {editedFeature.properties.style?.strokeWidth || 2}px
                </Typography>
                <Slider
                  value={editedFeature.properties.style?.strokeWidth || 2}
                  onChange={(_, value) => handleStyleChange({ strokeWidth: value as number })}
                  min={1}
                  max={10}
                  step={1}
                  size="small"
                  marks
                />
              </Box>

              {/* Opacidade da linha */}
              <Box>
                <Typography variant="body2" gutterBottom>
                  Opacidade da Linha: {Math.round((editedFeature.properties.style?.strokeOpacity || 1) * 100)}%
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

        {/* Coordenadas - Nova implementação com CoordinatesTable */}
        <Accordion
          expanded={expandedAccordions.includes('coordinates')}
          onChange={handleAccordionChange('coordinates')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Coordenadas</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <CoordinatesTable
              feature={editedFeature}
              selectedVertexIndex={selectedVertexIndex}
              onVertexSelect={handleVertexSelect}
              onVertexHover={handleVertexHover}
              maxHeight={300}
              showActions={true}
              showDistances={editedFeature.geometry.type !== 'Point'}
              compactMode={false}
            />
          </AccordionDetails>
        </Accordion>

        {/* Metadados */}
        <Accordion
          expanded={expandedAccordions.includes('metadata')}
          onChange={handleAccordionChange('metadata')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Metadados</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Criado em:</strong> {new Date(editedFeature.properties.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Atualizado em:</strong> {new Date(editedFeature.properties.updatedAt).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Camada:</strong> {editedFeature.properties.layerId}
              </Typography>
              {editedFeature.properties.ownerId && (
                <Typography variant="body2" color="textSecondary">
                  <strong>Proprietário:</strong> {editedFeature.properties.ownerId}
                </Typography>
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
        width: 400,
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