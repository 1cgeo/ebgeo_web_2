// Path: features/layers/components/AttributeTable.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  IconButton,
  Button,
  Box,
  Chip,
  Tooltip,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  Alert,
  Divider,
  CircularProgress,
  Pagination,
  Paper,
  Toolbar,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  TablePagination,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Clear as ClearIcon,
  SwapHoriz as TransferIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  Place as PointIcon,
  Timeline as LineIcon,
  Polygon as PolygonIcon,
  TextFields as TextIcon,
} from '@mui/icons-material';

import { useFeaturesByLayer } from '../../data-access/hooks/useFeatures';
import { useUpdateFeature, useDeleteManyFeatures } from '../../data-access/hooks/useMutateFeature';
import { useFeatureSelection } from '../../selection/hooks/useFeatureSelection';
import { useFeatureTransfer } from '../hooks/useFeatureTransfer';
import { useLayers } from '../../data-access/hooks/useLayers';
import { ExtendedFeature } from '../../data-access/schemas/feature.schema';
import { LayerConfig } from '../../data-access/schemas/layer.schema';
import { formatDate, formatCoordinates } from '../../../utils/format.utils';

interface AttributeTableProps {
  open: boolean;
  layerId: string;
  onClose: () => void;
  onFeatureEdit?: (feature: ExtendedFeature) => void;
  className?: string;
}

type SortOrder = 'asc' | 'desc';
type SortField = keyof ExtendedFeature['properties'] | 'geometryType' | 'coordinates';

interface ColumnConfig {
  field: string;
  label: string;
  sortable: boolean;
  editable: boolean;
  type: 'text' | 'number' | 'date' | 'geometry' | 'coordinates';
  width?: number;
}

export const AttributeTable: React.FC<AttributeTableProps> = ({
  open,
  layerId,
  onClose,
  onFeatureEdit,
  className,
}) => {
  // Estados locais
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ featureId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [geometryFilter, setGeometryFilter] = useState<string>('all');
  const [showCoordinates, setShowCoordinates] = useState(false);

  // Hooks
  const { data: layerFeatures = [], isLoading, error } = useFeaturesByLayer(layerId);
  const { data: allLayers = [] } = useLayers();
  const updateFeature = useUpdateFeature();
  const deleteManyFeatures = useDeleteManyFeatures();
  const { selectFeatures, clearSelection } = useFeatureSelection();
  const featureTransfer = useFeatureTransfer();

  // Layer info
  const layer = allLayers.find(l => l.id === layerId);

  // Configuração das colunas
  const columns: ColumnConfig[] = useMemo(() => [
    { field: 'name', label: 'Nome', sortable: true, editable: true, type: 'text', width: 200 },
    { field: 'description', label: 'Descrição', sortable: true, editable: true, type: 'text', width: 250 },
    { field: 'geometryType', label: 'Geometria', sortable: true, editable: false, type: 'geometry', width: 120 },
    ...(showCoordinates ? [
      { field: 'coordinates', label: 'Coordenadas', sortable: false, editable: false, type: 'coordinates', width: 200 }
    ] : []),
    { field: 'createdAt', label: 'Criado em', sortable: true, editable: false, type: 'date', width: 150 },
    { field: 'updatedAt', label: 'Atualizado em', sortable: true, editable: false, type: 'date', width: 150 },
  ], [showCoordinates]);

  // Features filtradas e ordenadas
  const processedFeatures = useMemo(() => {
    let filtered = layerFeatures;

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(feature => 
        (feature.properties.name?.toLowerCase().includes(term)) ||
        (feature.properties.description?.toLowerCase().includes(term)) ||
        feature.id.toLowerCase().includes(term) ||
        feature.geometry.type.toLowerCase().includes(term)
      );
    }

    // Filtro por tipo de geometria
    if (geometryFilter !== 'all') {
      filtered = filtered.filter(feature => feature.geometry.type === geometryFilter);
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === 'geometryType') {
        aValue = a.geometry.type;
        bValue = b.geometry.type;
      } else if (sortField === 'coordinates') {
        // Ordenar por primeira coordenada
        aValue = getFeatureCoordinates(a)[0] || 0;
        bValue = getFeatureCoordinates(b)[0] || 0;
      } else {
        aValue = a.properties[sortField as keyof typeof a.properties];
        bValue = b.properties[sortField as keyof typeof b.properties];
      }

      // Tratamento de valores nulos/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortOrder === 'asc' ? 1 : -1;
      if (bValue == null) return sortOrder === 'asc' ? -1 : 1;

      // Comparação
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Para datas
      if (typeof aValue === 'string' && (sortField === 'createdAt' || sortField === 'updatedAt')) {
        const dateA = new Date(aValue).getTime();
        const dateB = new Date(bValue).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }

      return 0;
    });

    return filtered;
  }, [layerFeatures, searchTerm, geometryFilter, sortField, sortOrder]);

  // Features paginadas
  const paginatedFeatures = useMemo(() => {
    const start = page * rowsPerPage;
    return processedFeatures.slice(start, start + rowsPerPage);
  }, [processedFeatures, page, rowsPerPage]);

  // Tipos de geometria únicos
  const geometryTypes = useMemo(() => {
    const types = new Set(layerFeatures.map(f => f.geometry.type));
    return Array.from(types).sort();
  }, [layerFeatures]);

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      setPage(0);
      setSelectedRows(new Set());
      setEditingCell(null);
      setSearchTerm('');
      setGeometryFilter('all');
    }
  }, [open, layerId]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectRow = (featureId: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(featureId)) {
      newSelection.delete(featureId);
    } else {
      newSelection.add(featureId);
    }
    setSelectedRows(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedFeatures.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedFeatures.map(f => f.id)));
    }
  };

  const handleEditStart = (featureId: string, field: string, currentValue: any) => {
    setEditingCell({ featureId, field });
    setEditValue(currentValue?.toString() || '');
  };

  const handleEditSave = async () => {
    if (!editingCell) return;

    try {
      const feature = layerFeatures.find(f => f.id === editingCell.featureId);
      if (!feature) return;

      await updateFeature.mutateAsync({
        id: feature.id,
        updates: {
          properties: {
            ...feature.properties,
            [editingCell.field]: editValue,
            updatedAt: new Date().toISOString(),
          }
        }
      });

      setEditingCell(null);
      setEditValue('');
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
    }
  };

  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.size === 0) return;

    try {
      await deleteManyFeatures.mutateAsync(Array.from(selectedRows));
      setSelectedRows(new Set());
    } catch (error) {
      console.error('Erro ao deletar features:', error);
    }
  };

  const handleTransferSelected = () => {
    if (selectedRows.size === 0) return;
    featureTransfer.openTransferDialog(Array.from(selectedRows));
  };

  const handleFeatureSelect = (featureId: string) => {
    selectFeatures([featureId], 'replace');
    if (onFeatureEdit) {
      const feature = layerFeatures.find(f => f.id === featureId);
      if (feature) {
        onFeatureEdit(feature);
      }
    }
  };

  // Utility functions
  const getGeometryIcon = (type: string) => {
    switch (type) {
      case 'Point': return <PointIcon fontSize="small" />;
      case 'LineString': return <LineIcon fontSize="small" />;
      case 'Polygon': return <PolygonIcon fontSize="small" />;
      default: return <TextIcon fontSize="small" />;
    }
  };

  const getFeatureCoordinates = (feature: ExtendedFeature): number[] => {
    switch (feature.geometry.type) {
      case 'Point':
        return feature.geometry.coordinates as number[];
      case 'LineString':
        const lineCoords = feature.geometry.coordinates as number[][];
        return lineCoords[0] || [];
      case 'Polygon':
        const polyCoords = feature.geometry.coordinates as number[][][];
        return polyCoords[0]?.[0] || [];
      default:
        return [];
    }
  };

  const formatCellValue = (feature: ExtendedFeature, column: ColumnConfig) => {
    const { field, type } = column;

    if (field === 'geometryType') {
      return feature.geometry.type;
    }

    if (field === 'coordinates') {
      const coords = getFeatureCoordinates(feature);
      return coords.length >= 2 ? formatCoordinates(coords[1], coords[0]) : '';
    }

    const value = feature.properties[field as keyof typeof feature.properties];

    if (value == null) return '';

    switch (type) {
      case 'date':
        return formatDate(value as string);
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      default:
        return value.toString();
    }
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6">
              Tabela de Atributos - {layer?.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {processedFeatures.length} de {layerFeatures.length} feature(s)
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Toolbar */}
      <Toolbar variant="dense" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" gap={2} flex={1}>
          {/* Busca */}
          <TextField
            size="small"
            placeholder="Buscar features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />

          {/* Filtro de geometria */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Geometria</InputLabel>
            <Select
              value={geometryFilter}
              onChange={(e) => setGeometryFilter(e.target.value)}
              label="Geometria"
            >
              <MenuItem value="all">Todas</MenuItem>
              {geometryTypes.map(type => (
                <MenuItem key={type} value={type}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getGeometryIcon(type)}
                    {type}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Opções de visualização */}
          <FormControlLabel
            control={
              <Switch
                checked={showCoordinates}
                onChange={(e) => setShowCoordinates(e.target.checked)}
                size="small"
              />
            }
            label="Coordenadas"
          />

          <Box flex={1} />

          {/* Ações */}
          {selectedRows.size > 0 && (
            <>
              <Chip 
                label={`${selectedRows.size} selecionada(s)`} 
                color="primary" 
                size="small" 
              />
              <Button
                size="small"
                startIcon={<TransferIcon />}
                onClick={handleTransferSelected}
              >
                Transferir
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteSelected}
                disabled={deleteManyFeatures.isPending}
              >
                Deletar
              </Button>
            </>
          )}
        </Box>
      </Toolbar>

      <DialogContent sx={{ flex: 1, padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            Erro ao carregar features da camada
          </Alert>
        ) : processedFeatures.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
            <Typography variant="h6" color="textSecondary">
              Nenhuma feature encontrada
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {layerFeatures.length === 0 ? 'Esta camada não possui features' : 'Tente ajustar os filtros'}
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ flex: 1 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRows.size === paginatedFeatures.length && paginatedFeatures.length > 0}
                      indeterminate={selectedRows.size > 0 && selectedRows.size < paginatedFeatures.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell
                      key={column.field}
                      style={{ width: column.width }}
                      sortDirection={sortField === column.field ? sortOrder : false}
                    >
                      {column.sortable ? (
                        <TableSortLabel
                          active={sortField === column.field}
                          direction={sortField === column.field ? sortOrder : 'asc'}
                          onClick={() => handleSort(column.field as SortField)}
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  ))}
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedFeatures.map((feature) => (
                  <TableRow
                    key={feature.id}
                    selected={selectedRows.has(feature.id)}
                    hover
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRows.has(feature.id)}
                        onChange={() => handleSelectRow(feature.id)}
                      />
                    </TableCell>
                    {columns.map((column) => {
                      const isEditing = editingCell?.featureId === feature.id && editingCell?.field === column.field;
                      const value = formatCellValue(feature, column);

                      return (
                        <TableCell key={column.field}>
                          {isEditing ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              <TextField
                                size="small"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleEditSave();
                                  if (e.key === 'Escape') handleEditCancel();
                                }}
                                autoFocus
                                fullWidth
                              />
                              <IconButton size="small" onClick={handleEditSave}>
                                <CheckIcon />
                              </IconButton>
                              <IconButton size="small" onClick={handleEditCancel}>
                                <CancelIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={1}
                              onClick={() => column.editable && handleEditStart(feature.id, column.field, value)}
                              sx={{ cursor: column.editable ? 'text' : 'default' }}
                            >
                              {column.field === 'geometryType' && (
                                <>
                                  {getGeometryIcon(feature.geometry.type)}
                                  <Typography variant="body2">{value}</Typography>
                                </>
                              )}
                              {column.field !== 'geometryType' && (
                                <Typography variant="body2" noWrap>
                                  {value}
                                </Typography>
                              )}
                              {column.editable && (
                                <EditIcon sx={{ fontSize: 14, opacity: 0.5 }} />
                              )}
                            </Box>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <Tooltip title="Selecionar no mapa">
                        <IconButton
                          size="small"
                          onClick={() => handleFeatureSelect(feature.id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: 1, borderColor: 'divider' }}>
        <TablePagination
          component="div"
          count={processedFeatures.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Linhas por página:"
        />
      </DialogActions>
    </Dialog>
  );
};