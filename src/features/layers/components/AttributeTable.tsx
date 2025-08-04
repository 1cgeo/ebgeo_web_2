// Path: features\layers\components\AttributeTable.tsx

import React, { useState, useMemo, useCallback } from 'react';
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
  Toolbar,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  TablePagination,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  MoreVert as MoreIcon,
  Clear as ClearIcon,
  SwapHoriz as TransferIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  Place as PointIcon,
  Timeline as LineIcon,
  CropSquare as PolygonIcon, // Substituto para Polygon que não existe
  TextFields as TextIcon,
} from '@mui/icons-material';

import { useFeaturesByLayer } from '../../data-access/hooks/useFeatures';
import { useUpdateFeature, useDeleteManyFeatures } from '../../data-access/hooks/useMutateFeature';
import { ExtendedFeature } from '../../data-access/schemas/feature.schema';

// Placeholder para hooks não implementados
const useFeatureSelection = () => ({
  selectFeatures: (ids: string[], mode: string) => {},
  clearSelection: () => {},
});

const useFeatureTransfer = () => ({
  openTransferDialog: (ids: string[]) => {},
});

const useLayers = () => ({
  data: [] as any[],
});

// Placeholder para formatters
const formatDate = {
  brazilian: (date: string | Date) => new Date(date).toLocaleDateString('pt-BR'),
  brazilianDateTime: (date: string | Date) => new Date(date).toLocaleString('pt-BR'),
  iso: (date: string | Date) => new Date(date).toISOString(),
  relative: (date: string | Date) => 'há alguns minutos',
};

const formatCoordinates = {
  decimal: (lng: number, lat: number, precision = 6) =>
    `${lng.toFixed(precision)}, ${lat.toFixed(precision)}`,
  dms: (lng: number, lat: number) =>
    `${Math.abs(lng)}°${lng >= 0 ? 'E' : 'W'}, ${Math.abs(lat)}°${lat >= 0 ? 'N' : 'S'}`,
  simple: (lng: number, lat: number) => `${lng}, ${lat}`,
  labeled: (lng: number, lat: number, precision = 6) =>
    `Lng: ${lng.toFixed(precision)}, Lat: ${lat.toFixed(precision)}`,
};

interface AttributeTableProps {
  open: boolean;
  layerId: string;
  onClose: () => void;
  onFeatureEdit?: (feature: ExtendedFeature) => void;
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
  const layer = allLayers.find((l: any) => l.id === layerId);

  // Configuração das colunas
  const columns: ColumnConfig[] = useMemo(
    () => [
      { field: 'name', label: 'Nome', sortable: true, editable: true, type: 'text', width: 200 },
      {
        field: 'description',
        label: 'Descrição',
        sortable: true,
        editable: true,
        type: 'text',
        width: 250,
      },
      {
        field: 'geometryType',
        label: 'Geometria',
        sortable: true,
        editable: false,
        type: 'geometry',
        width: 120,
      },
      ...(showCoordinates
        ? [
            {
              field: 'coordinates',
              label: 'Coordenadas',
              sortable: false,
              editable: false,
              type: 'coordinates' as const,
              width: 200,
            },
          ]
        : []),
      {
        field: 'createdAt',
        label: 'Criado em',
        sortable: true,
        editable: false,
        type: 'date',
        width: 150,
      },
      {
        field: 'updatedAt',
        label: 'Atualizado em',
        sortable: true,
        editable: false,
        type: 'date',
        width: 150,
      },
    ],
    [showCoordinates]
  );

  // Processar e filtrar features
  const processedFeatures = useMemo(() => {
    let filtered = layerFeatures;

    // Filtro de texto
    if (searchTerm) {
      filtered = filtered.filter(
        (feature: ExtendedFeature) =>
          feature.properties.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          feature.properties.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          feature.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de geometria
    if (geometryFilter !== 'all') {
      filtered = filtered.filter(
        (feature: ExtendedFeature) => feature.geometry.type === geometryFilter
      );
    }

    // Ordenação
    const sortedFeatures = [...filtered].sort((a: ExtendedFeature, b: ExtendedFeature) => {
      let aValue: any;
      let bValue: any;

      if (sortField === 'geometryType') {
        aValue = a.geometry.type;
        bValue = b.geometry.type;
      } else if (sortField === 'coordinates') {
        const aCoords = getFeatureCoordinates(a);
        const bCoords = getFeatureCoordinates(b);
        aValue = aCoords.length > 0 ? aCoords[0] : 0;
        bValue = bCoords.length > 0 ? bCoords[0] : 0;
      } else {
        aValue = a.properties[sortField as keyof typeof a.properties];
        bValue = b.properties[sortField as keyof typeof b.properties];
      }

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sortedFeatures;
  }, [layerFeatures, searchTerm, geometryFilter, sortField, sortOrder]);

  // Paginação
  const paginatedFeatures = useMemo(() => {
    const start = page * rowsPerPage;
    return processedFeatures.slice(start, start + rowsPerPage);
  }, [processedFeatures, page, rowsPerPage]);

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
      setSelectedRows(new Set(paginatedFeatures.map((f: ExtendedFeature) => f.id)));
    }
  };

  const handleEditStart = (featureId: string, field: string, currentValue: any) => {
    setEditingCell({ featureId, field });
    setEditValue(currentValue?.toString() || '');
  };

  const handleEditSave = async () => {
    if (!editingCell) return;

    try {
      const feature = layerFeatures.find((f: ExtendedFeature) => f.id === editingCell.featureId);
      if (!feature) return;

      await updateFeature.mutateAsync({
        id: feature.id,
        updates: {
          properties: {
            ...feature.properties,
            [editingCell.field]: editValue,
            updatedAt: new Date().toISOString(),
          },
        },
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
      const feature = layerFeatures.find((f: ExtendedFeature) => f.id === featureId);
      if (feature) {
        onFeatureEdit(feature);
      }
    }
  };

  // Utility functions
  const getGeometryIcon = (type: string) => {
    switch (type) {
      case 'Point':
        return <PointIcon fontSize="small" />;
      case 'LineString':
        return <LineIcon fontSize="small" />;
      case 'Polygon':
        return <PolygonIcon fontSize="small" />;
      default:
        return <TextIcon fontSize="small" />;
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

  const formatCellValue = (feature: ExtendedFeature, column: ColumnConfig): string => {
    const { field, type } = column;

    if (field === 'geometryType') {
      return feature.geometry.type;
    }

    if (field === 'coordinates') {
      const coords = getFeatureCoordinates(feature);
      if (coords.length >= 2) {
        return formatCoordinates.decimal(coords[0], coords[1]);
      }
      return 'N/A';
    }

    const value = feature.properties[field as keyof typeof feature.properties];

    if (value === null || value === undefined) {
      return '';
    }

    switch (type) {
      case 'date':
        return formatDate.brazilian(value as string);
      case 'coordinates':
        if (Array.isArray(value) && value.length >= 2) {
          return formatCoordinates.decimal(value[0], value[1]);
        }
        return 'N/A';
      default:
        return String(value);
    }
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', display: 'flex', flexDirection: 'column' },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Tabela de Atributos - {layer?.name || 'Camada'}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Toolbar */}
      <Toolbar variant="dense" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          size="small"
          placeholder="Buscar features..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
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
          sx={{ mr: 2, minWidth: 250 }}
        />

        <FormControl size="small" sx={{ mr: 2, minWidth: 120 }}>
          <InputLabel>Geometria</InputLabel>
          <Select
            value={geometryFilter}
            onChange={e => setGeometryFilter(e.target.value)}
            label="Geometria"
          >
            <Box component="div" value="all">
              Todos
            </Box>
            <Box component="div" value="Point">
              Pontos
            </Box>
            <Box component="div" value="LineString">
              Linhas
            </Box>
            <Box component="div" value="Polygon">
              Polígonos
            </Box>
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        {selectedRows.size > 0 && (
          <>
            <Chip
              label={`${selectedRows.size} selecionada(s)`}
              color="primary"
              size="small"
              sx={{ mr: 1 }}
            />
            <IconButton size="small" onClick={handleDeleteSelected} title="Deletar selecionadas">
              <DeleteIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleTransferSelected}
              title="Transferir para outra camada"
            >
              <TransferIcon />
            </IconButton>
          </>
        )}
      </Toolbar>

      <DialogContent sx={{ flex: 1, p: 0 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            Erro ao carregar features: {String(error)}
          </Alert>
        ) : processedFeatures.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <Typography color="text.secondary">
              {searchTerm ? 'Nenhuma feature encontrada' : 'Nenhuma feature nesta camada'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRows.size === paginatedFeatures.length}
                      indeterminate={
                        selectedRows.size > 0 && selectedRows.size < paginatedFeatures.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  {columns.map(column => (
                    <TableCell
                      key={column.field}
                      sx={{ width: column.width }}
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
                {paginatedFeatures.map((feature: ExtendedFeature) => (
                  <TableRow key={feature.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRows.has(feature.id)}
                        onChange={() => handleSelectRow(feature.id)}
                      />
                    </TableCell>
                    {columns.map(column => {
                      const value = formatCellValue(feature, column);
                      const isEditing =
                        editingCell?.featureId === feature.id &&
                        editingCell?.field === column.field;

                      return (
                        <TableCell key={column.field}>
                          {isEditing ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              <TextField
                                size="small"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onKeyDown={e => {
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
                              onClick={() =>
                                column.editable && handleEditStart(feature.id, column.field, value)
                              }
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
                              {column.editable && <EditIcon sx={{ fontSize: 14, opacity: 0.5 }} />}
                            </Box>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleFeatureSelect(feature.id)}
                        title="Selecionar no mapa"
                      >
                        <VisibilityIcon />
                      </IconButton>
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
          onRowsPerPageChange={e => {
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
